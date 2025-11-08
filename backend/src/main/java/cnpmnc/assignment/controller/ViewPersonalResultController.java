package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.dto.QuestionResultDto;
import cnpmnc.assignment.dto.StudentGradeDTO;
import cnpmnc.assignment.dto.SubmissionResponseDto;
import cnpmnc.assignment.model.Choice;
import cnpmnc.assignment.model.PersonalResult;
import cnpmnc.assignment.model.Question;
import cnpmnc.assignment.model.Submission;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.repository.ChoiceRepository;
import cnpmnc.assignment.repository.PersonalResultRepository;
import cnpmnc.assignment.repository.QuestionRepository;
import cnpmnc.assignment.repository.SubmissionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/getresult")
@Tag(name = "Personal Results", description = "Endpoints for viewing a user's personal result for a test")
public class ViewPersonalResultController {

    private final PersonalResultRepository personalResultRepository;
    private final QuestionRepository questionRepository;
    private final ChoiceRepository choiceRepository;
    private final SubmissionRepository submissionRepository;

    public ViewPersonalResultController(PersonalResultRepository personalResultRepository,
                                        QuestionRepository questionRepository,
                                        ChoiceRepository choiceRepository,
                                        SubmissionRepository submissionRepository) {
        this.personalResultRepository = personalResultRepository;
        this.questionRepository = questionRepository;
        this.choiceRepository = choiceRepository;
        this.submissionRepository = submissionRepository;
    }

    @GetMapping("/{id}")
    @Operation(summary = "View personal result by test id",
               description = "Return totalScore, correctCount, wrongCount from personal_result and list of questions with selected and correct answers")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<SubmissionResponseDto>> getPersonalResult(
            @Parameter(description = "Test id / submission id") @PathVariable String id) {

        // Fetch personal result (score summary)
        PersonalResult pr = personalResultRepository.findByTestId(id).orElse(null);

        Double totalScore = pr != null ? pr.getTotalScore() : null;
        Integer correctCount = pr != null ? pr.getCorrectCount() : null;
        Integer wrongCount = pr != null ? pr.getWrongCount() : null;

        // Fetch questions for this test
        List<Question> questions = questionRepository.findByTestId(id);

        // Fetch choices (selected answers) for this test
        List<Choice> choices = choiceRepository.findByTestId(id);

        Map<String, String> selectedByQuestion = new HashMap<>();
        for (Choice c : choices) {
            if (c.getQuestionId() != null) {
                selectedByQuestion.put(c.getQuestionId(), c.getSelectedAnswer());
            }
        }

        List<QuestionResultDto> questionResults = questions.stream()
                .map(q -> new QuestionResultDto(
                        q.getId(),
                        q.getContent(),
                        selectedByQuestion.get(q.getId()),
                        q.getAnswer()
                ))
                .collect(Collectors.toList());

        SubmissionResponseDto resp = new SubmissionResponseDto(totalScore, correctCount, wrongCount, questionResults);

        return ResponseEntity.ok(ApiResponse.success(resp, "Personal result retrieved"));
    }

    @GetMapping("/student/grades")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    @Operation(summary = "Get student's all grades", description = "Get all test submissions and grades for the current student")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<List<StudentGradeDTO>>> getStudentGrades(HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }

        List<Submission> submissions = submissionRepository.findByStudentId(currentUser.getId());
        
        List<StudentGradeDTO> grades = submissions.stream()
                .map(submission -> {
                    StudentGradeDTO dto = new StudentGradeDTO();
                    dto.setSubmissionId(submission.getId());
                    dto.setTestId(submission.getTest().getId());
                    dto.setTestName(submission.getTest().getTitle());
                    dto.setClassId(submission.getTest().getClazz().getId());
                    dto.setClassName(submission.getTest().getClazz().getName());
                    dto.setScore(submission.getScore());
                    dto.setMaxScore(submission.getMaxScore());
                    dto.setPercentage((submission.getScore() / submission.getMaxScore()) * 100);
                    dto.setSubmittedAt(submission.getSubmittedAt());
                    dto.setStatus(submission.getStatus().name());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(grades, "Grades retrieved successfully"));
    }
}
