package cnpmnc.assignment.dto;

import cnpmnc.assignment.model.Role;
import cnpmnc.assignment.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String email;
    private String studentId;
    private Role role;
    private Boolean activate;
    
    // Factory method to convert User to UserDto
    public static UserDto fromUser(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getStudentId(),
            user.getRole(),
            user.getActivate()
        );
    }
}
