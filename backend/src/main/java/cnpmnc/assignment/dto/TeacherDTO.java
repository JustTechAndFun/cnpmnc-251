package cnpmnc.assignment.dto;

import cnpmnc.assignment.model.Role;
import cnpmnc.assignment.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class TeacherDTO {
    private String id;
    private String email;
    private Role role;
    private Boolean activate;
    public static TeacherDTO fromUser(User user) {
        return new TeacherDTO(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getActivate()
        );
    }
}
