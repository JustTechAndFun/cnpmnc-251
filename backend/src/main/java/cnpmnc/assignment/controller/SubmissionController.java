package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.dto.AnswerDto;
import cnpmnc.assignment.dto.SubmissionRequestDto;
import cnpmnc.assignment.model.PersonalResult;
import cnpmnc.assignment.model.Question;
import cnpmnc.assignment.model.Choice;
import cnpmnc.assignment.repository.PersonalResultRepository;
import cnpmnc.assignment.repository.QuestionRepository;
import cnpmnc.assignment.repository.ChoiceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
@Tag(name = "Submissions", description = "Endpoints for submitting tests")
public class SubmissionController {

    private final QuestionRepository questionRepository;
    private final ChoiceRepository choiceRepository;
    private final PersonalResultRepository personalResultRepository;

    public SubmissionController(QuestionRepository questionRepository,
                                ChoiceRepository choiceRepository,
                                PersonalResultRepository personalResultRepository) {
        this.questionRepository = questionRepository;
        this.choiceRepository = choiceRepository;
        this.personalResultRepository = personalResultRepository;
    }

    @PostMapping
    @Operation(summary = "Submit answers for a test and record personal result")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<PersonalResult>> submitTest(@RequestBody SubmissionRequestDto body) {

        String testId = body.getTestId();
        List<AnswerDto> answers = body.getAnswers();

        // Fetch all questions that belong to the test
        List<Question> questions = questionRepository.findByTest_Id(testId);

        // Map correct answers by question id for quick lookup
        Map<String, String> correctByQuestion = new HashMap<>();
        for (Question q : questions) {
            correctByQuestion.put(q.getId(), q.getAnswer());
        }

        // Fetch existing choices for this test to decide which submitted answers to insert
        List<Choice> existingChoices = choiceRepository.findByTestId(testId);
        Map<String, Choice> existingByQuestion = new HashMap<>();
        for (Choice c : existingChoices) {
            if (c.getQuestionId() != null) existingByQuestion.put(c.getQuestionId(), c);
        }

        // Insert new choices only for question_ids that don't exist yet
        if (answers != null) {
            for (AnswerDto a : answers) {
                String qid = a.getQuestionId();
                if (qid == null) continue;
                if (existingByQuestion.containsKey(qid)) {
                    // already saved answer for this question in this test -> skip
                    continue;
                }
                // only insert if question belongs to this test
                if (!correctByQuestion.containsKey(qid)) {
                    continue;
                }
                Choice toSave = new Choice();
                toSave.setTestId(testId);
                toSave.setQuestionId(qid);
                toSave.setSelectedAnswer(a.getSubmitAnswer());
                // set user id to satisfy DB constraint
                toSave.setUserId(body.getUserId());
                Choice savedChoice = choiceRepository.save(toSave);
                existingByQuestion.put(qid, savedChoice);
            }
        }

        // Re-fetch questions (already have) and use all choices (existingByQuestion) to compute totals.
        int correctCount = 0;
        int wrongCount = 0;

        for (Question q : questions) {
            String qid = q.getId();
            String correct = q.getAnswer();
            Choice c = existingByQuestion.get(qid);
            if (c == null) {
                // no answer saved -> treat as wrong (counts as unanswered/wrong)
                wrongCount++;
                continue;
            }
            String selected = c.getSelectedAnswer();
            if (selected != null && selected.equals(correct)) {
                correctCount++;
            } else {
                wrongCount++;
            }
        }

        // Simple scoring: 1 point per correct answer.
        double totalScore = (double) correctCount;

        PersonalResult pr = new PersonalResult();
        pr.setTestId(testId);
        pr.setTotalScore(totalScore);
        pr.setCorrectCount(correctCount);
        pr.setWrongCount(wrongCount);

        PersonalResult saved = personalResultRepository.save(pr);

        return ResponseEntity.ok(ApiResponse.success(saved, "Submission recorded"));
    }
}
