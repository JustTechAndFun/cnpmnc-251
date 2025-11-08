package cnpmnc.assignment.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {
    @Pattern(regexp = "^[A-Z0-9]{6,10}$", message = "Student ID must be 6-10 uppercase alphanumeric characters")
    private String studentId;
}
