package cnpmnc.assignment.dto.RequestDTO;

import cnpmnc.assignment.model.Test;
import cnpmnc.assignment.util.constant.Answer;
import cnpmnc.assignment.util.constant.TestStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddQuestions {
    private String content;

    // Multiple choice options (persisted as a separate collection table)
    // Index of the correct choice in the `choices` list (0-based). Use null if not set.
    @Column(columnDefinition = "TEXT")
    @NotEmpty
    private String choiceA;
    @Column(columnDefinition = "TEXT")
    @NotEmpty
    private String choiceB;
    @Column(columnDefinition = "TEXT")
    @NotEmpty
    private String choiceC;
    @Column(columnDefinition = "TEXT")
    @NotEmpty
    private String choiceD;

    @Enumerated(EnumType.STRING)
    private Answer answer;
}
