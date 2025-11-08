package cnpmnc.assignment.dto;

import cnpmnc.assignment.model.Test;
import cnpmnc.assignment.util.constant.TestStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestDTO {

    private String id;
    private String passcode;
    private String title;
    private String description;
    private LocalDateTime openTime;
    private LocalDateTime closeTime;
    private long duration;
    private TestStatus status;
    public static TestDTO fromTest(Test test) {
        return new TestDTO(
                test.getId(),
                test.getPasscode(),
                test.getTitle(),
                test.getDescription(),
                test.getOpenTime(),
                test.getCloseTime(),
                test.getDuration(),
                test.getStatus()
        );
    }

}
