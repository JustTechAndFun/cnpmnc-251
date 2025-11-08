package cnpmnc.assignment.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_school")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSchool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // bigint

    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    @Column(nullable = false, length = 255)
    private String school;

    @Column(name = "school_name", length = 255)
    private String schoolName;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
