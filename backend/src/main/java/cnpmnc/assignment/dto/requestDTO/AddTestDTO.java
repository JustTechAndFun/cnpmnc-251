package cnpmnc.assignment.dto.requestDTO;


import cnpmnc.assignment.model.Test;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddTestDTO {
    private String testName;
    private String description;
    private cnpmnc.assignment.dto.TestDTO.Time time;
}
