package cnpmnc.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponseDto {
    private Double totalScore;
    private Integer correctCount;
    private Integer wrongCount;
    private List<QuestionResultDto> questions;
}
