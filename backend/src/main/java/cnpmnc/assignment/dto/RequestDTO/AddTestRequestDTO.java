package cnpmnc.assignment.dto.RequestDTO;

import cnpmnc.assignment.util.constant.TestStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddTestRequestDTO {
    @Column(nullable = false, length = 100)
    @NotBlank
    @NotNull
    private String title;
    private String description;
    private LocalDateTime openTime;
    private LocalDateTime closeTime;
    @Min(1)
    private long duration;

}
