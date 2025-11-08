package cnpmnc.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExamJoinResponseDTO {
    private String testId;
    private String testTitle;
    private Long duration;
    private List<QuestionDTOforStudent> questions;
}
