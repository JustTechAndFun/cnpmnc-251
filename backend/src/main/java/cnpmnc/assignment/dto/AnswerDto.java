package cnpmnc.assignment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class AnswerDto {

    @JsonProperty("question_id")
    private String questionId;

    @JsonProperty("submit_answer")
    private String submitAnswer;
}
