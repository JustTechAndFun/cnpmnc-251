package cnpmnc.assignment.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "questions")
@Data
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
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
    @JoinColumn(name = "test_id", referencedColumnName = "id")
    private Test test;

    // Transient field to help with backward compatibility
    @Transient
    private String testIdCache;

    // Helper method to get testId
    public String getTestId() {
        if (test != null) {
            return test.getId();
        }
        return testIdCache;
    }

    // Helper method to set testId (for compatibility with existing code)
    // Note: This should only be used when you don't have the Test entity
    public void setTestId(String testId) {
        this.testIdCache = testId;
        if (testId != null && this.test == null) {
            Test tempTest = new Test();
            tempTest.setId(testId);
            this.test = tempTest;
        }
    }
}
