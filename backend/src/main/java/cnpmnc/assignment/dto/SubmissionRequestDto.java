package cnpmnc.assignment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class SubmissionRequestDto {

    @JsonProperty("test_id")
    private String testId;

    @JsonProperty("user_id")
    private String userId;

    private List<AnswerDto> answers;
}
