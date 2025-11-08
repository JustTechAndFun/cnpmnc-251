package cnpmnc.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResultDto {
    private String id;
    private String questionText;
    private String selectedAnswer;
    private String correctAnswer;
}
