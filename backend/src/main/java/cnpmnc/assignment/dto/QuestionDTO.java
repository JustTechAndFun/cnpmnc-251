// java
package cnpmnc.assignment.dto;

import cnpmnc.assignment.model.Question;

public class QuestionDTO {
    private String id;
    private String content;
    private String choiceA;
    private String choiceB;
    private String choiceC;
    private String choiceD;

    private String answer;
    private String testId;

    public QuestionDTO() {}

    public QuestionDTO(String id, String content, String choiceA, String choiceB, String choiceC, String choiceD, String answer, String testId) {
        this.id = id;
        this.content = content;
        this.choiceA = choiceA;
        this.choiceB = choiceB;
        this.choiceC = choiceC;
        this.choiceD = choiceD;
        this.answer = answer;
        this.testId = testId;
    }

    public static QuestionDTO fromEntity(Question q) {
        return new QuestionDTO(
                q.getId(),
                q.getContent(),
                q.getChoiceA(),
                q.getChoiceB(),
                q.getChoiceC(),
                q.getChoiceD(),
                q.getAnswer() != null ? q.getAnswer().name() : null,
                q.getTest() != null ? q.getTest().getId() : null
        );
    }

    // getters và setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getChoiceA() { return choiceA; }
    public void setChoiceA(String choiceA) { this.choiceA = choiceA; }
    public String getChoiceB() { return choiceB; }
    public void setChoiceB(String choiceB) { this.choiceB = choiceB; }
    public String getChoiceC() { return choiceC; }
    public void setChoiceC(String choiceC) { this.choiceC = choiceC; }
    public String getChoiceD() { return choiceD; }
    public void setChoiceD(String choiceD) { this.choiceD = choiceD; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public String getTestId() { return testId; }
    public void setTestId(String testId) { this.testId = testId; }
}
