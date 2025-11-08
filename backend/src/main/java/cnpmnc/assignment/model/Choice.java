package cnpmnc.assignment.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "choices")
@Data
public class Choice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "test_id", length = 255)
    private String testId;

    @Column(name = "question_id", length = 255)
    private String questionId;

    // selected answer by student for this question (e.g., "A", "B", etc.)
    @Column(name = "selected_answer", length = 255)
    private String selectedAnswer;

    @Column(name = "user_id", length = 255)
    private String userId;
}
