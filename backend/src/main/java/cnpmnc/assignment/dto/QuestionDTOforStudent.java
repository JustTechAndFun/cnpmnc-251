// java
package cnpmnc.assignment.dto;

import cnpmnc.assignment.model.Question;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDTOforStudent {
    private String id;  // Need id for frontend to track answers
    private String content;
    private String choiceA;
    private String choiceB;
    private String choiceC;
    private String choiceD;


    public static QuestionDTOforStudent fromEntity(Question q) {
        return new QuestionDTOforStudent(
                q.getId(),
                q.getContent(),
                q.getChoiceA(),
                q.getChoiceB(),
                q.getChoiceC(),
                q.getChoiceD()
        );
    }

    // getters và setters
}