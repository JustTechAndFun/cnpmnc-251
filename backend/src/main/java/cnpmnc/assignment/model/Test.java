package cnpmnc.assignment.model;

import cnpmnc.assignment.util.constant.TestStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;


@Entity
@Table(name = "tests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Test {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "passcode", length = 6, nullable = false, unique = true)
    private String passcode;

    @Column(nullable = false, length = 100)
    @NotBlank
    @NotNull
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime openTime;
    private LocalDateTime closeTime;

    @Min(1)
    private long duration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TestStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private Class clazz;

}
