package cnpmnc.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinClassRequest {
    @NotBlank(message = "Class code is required")
    private String classCode;
}
