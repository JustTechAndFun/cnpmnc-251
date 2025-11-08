package cnpmnc.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateClassRequestDTO {
    
    @NotBlank(message = "Class name is required")
    private String className;
    
    @NotBlank(message = "Class code is required")
    private String classCode;
    
    @NotBlank(message = "Semester is required")
    private String semester;
    
    @NotNull(message = "Year is required")
    private Integer year;
}
