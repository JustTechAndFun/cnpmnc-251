package cnpmnc.assignment.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "questions")
@Data
public class Question {

    @Id
    @Column(length = 255)
    private String id;

    @Column(name = "content", columnDefinition = "text")
    private String content;

    // correct answer
    @Column(name = "answer", length = 255)
    private String answer;

    @Column(name = "choicea", length = 255)
    private String choiceA;

    @Column(name = "choiceb", length = 255)
    private String choiceB;

    @Column(name = "choicec", length = 255)
    private String choiceC;

    @Column(name = "choiced", length = 255)
    private String choiceD;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;
}
