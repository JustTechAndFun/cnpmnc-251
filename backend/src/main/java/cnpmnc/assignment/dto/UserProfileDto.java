package cnpmnc.assignment.dto;

import cnpmnc.assignment.model.Role;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.model.UserSchool;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private String id;
    private String email;
    private String studentId;
    private Role role;
    private String school;
    private String schoolName;
    private Boolean activate;
    
    // Factory method to convert User and UserSchool to UserProfileDto
    public static UserProfileDto fromUser(User user, UserSchool userSchool) {
        return new UserProfileDto(
            user.getId(),
            user.getEmail(),
            user.getStudentId(),
            user.getRole(),
            userSchool != null ? userSchool.getSchool() : null,
            userSchool != null ? userSchool.getSchoolName() : null,
            user.getActivate()
        );
    }
}
    
