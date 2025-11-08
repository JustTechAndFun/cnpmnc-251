package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.dto.AnswerDto;
import cnpmnc.assignment.dto.SubmissionRequestDto;
import cnpmnc.assignment.model.*;
import cnpmnc.assignment.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
@Tag(name = "Submissions", description = "Endpoints for submitting tests")
public class SubmissionController {

    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;
    private final TestRepository testRepository;
    private final UserRepository userRepository;

    public SubmissionController(QuestionRepository questionRepository,
                                SubmissionRepository submissionRepository,
                                TestRepository testRepository,
                                UserRepository userRepository) {
        this.questionRepository = questionRepository;
        this.submissionRepository = submissionRepository;
        this.testRepository = testRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    @Operation(summary = "Submit answers for a test", description = "Student submits exam answers")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitTest(
            @RequestBody SubmissionRequestDto body,
            HttpSession session) {
        
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }

        String testId = body.getTestId();
        String userId = body.getUserId();
        List<AnswerDto> answers = body.getAnswers();

        // Validate user ID matches current user
        if (!currentUser.getId().equals(userId) && !currentUser.getEmail().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only submit your own answers"));
        }

        // Find test
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test not found"));

        // Find user by ID or email
        User student = userRepository.findById(userId)
                .orElse(userRepository.findByEmail(userId).orElse(null));
        
        if (student == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Student not found"));
        }

        // Check if already submitted
        if (submissionRepository.findByTestAndStudent(test, student).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("You have already submitted this test"));
        }

        // Fetch all questions for this test
        List<Question> questions = questionRepository.findByTest_Id(testId);
        
        if (questions.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("No questions found for this test"));
        }

        // Map correct answers and submitted answers
        Map<String, String> correctAnswers = new HashMap<>();
        for (Question q : questions) {
            correctAnswers.put(q.getId(), q.getAnswer());
        }

        Map<String, String> submittedAnswers = new HashMap<>();
        if (answers != null) {
            for (AnswerDto a : answers) {
                if (a.getQuestionId() != null && a.getSubmitAnswer() != null) {
                    submittedAnswers.put(a.getQuestionId(), a.getSubmitAnswer());
                }
            }
        }

        // Create submission
        Submission submission = new Submission();
        submission.setTest(test);
        submission.setStudent(student);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus(Submission.SubmissionStatus.COMPLETED);

        // Calculate score
        int correctCount = 0;
        int totalQuestions = questions.size();
        double pointsPerQuestion = 10.0; // Default 10 points per question
        double totalScore = 0.0;

        for (Question question : questions) {
            String questionId = question.getId();
            String correctAnswer = correctAnswers.get(questionId);
            String submittedAnswer = submittedAnswers.get(questionId);
            
            boolean isCorrect = submittedAnswer != null && submittedAnswer.equals(correctAnswer);
            if (isCorrect) {
                correctCount++;
                totalScore += pointsPerQuestion;
            }

            // Create submission answer
            SubmissionAnswer submissionAnswer = new SubmissionAnswer();
            submissionAnswer.setSubmission(submission);
            submissionAnswer.setQuestion(question);
            submissionAnswer.setSelectedAnswer(submittedAnswer);
            submissionAnswer.setCorrect(isCorrect);
            submissionAnswer.setPointsEarned(isCorrect ? pointsPerQuestion : 0.0);
            
            submission.getAnswers().add(submissionAnswer);
        }

        double maxScore = totalQuestions * pointsPerQuestion;
        submission.setScore(totalScore);
        submission.setMaxScore(maxScore);

        // Save submission (cascade will save answers)
        Submission savedSubmission = submissionRepository.save(submission);

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("submissionId", savedSubmission.getId());
        response.put("score", totalScore);
        response.put("maxScore", maxScore);
        response.put("percentage", (totalScore / maxScore) * 100);
        response.put("correctCount", correctCount);
        response.put("totalQuestions", totalQuestions);
        response.put("status", "COMPLETED");

        return ResponseEntity.ok(ApiResponse.success(response, "Test submitted successfully"));
    }
}
