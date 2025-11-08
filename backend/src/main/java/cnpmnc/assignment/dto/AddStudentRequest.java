package cnpmnc.assignment.dto;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddStudentRequest {
    
    @Email(message = "Email must be valid")
    private String email;
    
    private String studentId;
    
    public boolean isValid() {
        return (email != null && !email.isBlank()) || (studentId != null && !studentId.isBlank());
    }
}
