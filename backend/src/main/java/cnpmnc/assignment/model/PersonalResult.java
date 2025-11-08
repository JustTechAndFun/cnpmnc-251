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

    @Id
    @Column(length = 255)
    private String id; // assume id is test id or submission id

    @Column(name = "total_score")
    private Double totalScore;

    @Column(name = "correct_count")
    private Integer correctCount;

    @Column(name = "wrong_count")
    private Integer wrongCount;

    @Column(name = "test_id", length = 255)
    private String testId;
}
