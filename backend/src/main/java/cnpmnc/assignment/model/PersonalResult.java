package cnpmnc.assignment.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "personal_result")
@Data
public class PersonalResult {

    // The DB table 'personal_result' doesn't have a column named 'id'.
    // In the schema the test identifier column is 'test_id' and it is used
    // as the primary key / identifier for a personal_result. Mark that field
    // as @Id so JPA selects the correct column (select ... test_id ...).

    @Id
    @Column(name = "test_id", length = 255)
    private String testId;

    @Column(name = "total_score")
    private Double totalScore;

    @Column(name = "correct_count")
    private Integer correctCount;

    @Column(name = "wrong_count")
    private Integer wrongCount;
}
