package cnpmnc.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddStudentRequest {
    
    private String email;
    
    private String studentId;
    
    public boolean isValid() {
        return (email != null && !email.isBlank()) || (studentId != null && !studentId.isBlank());
    }
}
