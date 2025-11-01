package cnpmnc.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateClassRequest {
    
    @NotBlank(message = "Class name is required")
    private String name;
    
    private String description;
    
    @NotBlank(message = "Class code is required")
    private String classCode;
    
    @NotBlank(message = "Teacher ID is required")
    private String teacherId;
}
