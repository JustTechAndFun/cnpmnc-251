package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.dto.QuestionResultDto;
import cnpmnc.assignment.dto.SubmissionResponseDto;
import cnpmnc.assignment.model.Choice;
import cnpmnc.assignment.model.PersonalResult;
import cnpmnc.assignment.model.Question;
import cnpmnc.assignment.repository.ChoiceRepository;
import cnpmnc.assignment.repository.PersonalResultRepository;
import cnpmnc.assignment.repository.QuestionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/submissions")
@Tag(name = "Submissions", description = "Submission related endpoints")
public class SubmissionController {

    private final PersonalResultRepository personalResultRepository;
    private final QuestionRepository questionRepository;
    private final ChoiceRepository choiceRepository;

    public SubmissionController(PersonalResultRepository personalResultRepository,
                                QuestionRepository questionRepository,
                                ChoiceRepository choiceRepository) {
        this.personalResultRepository = personalResultRepository;
        this.questionRepository = questionRepository;
        this.choiceRepository = choiceRepository;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get submission results by test id",
               description = "Return totalScore, correctCount, wrongCount from personal_result and list of questions with selected and correct answers")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<SubmissionResponseDto>> getSubmission(
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

        return ResponseEntity.ok(ApiResponse.success(resp, "Submission retrieved"));
    }
}
