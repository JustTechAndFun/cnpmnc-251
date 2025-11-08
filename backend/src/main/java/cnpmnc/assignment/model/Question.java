package cnpmnc.assignment.model;


import cnpmnc.assignment.util.constant.Answer;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Question {
    // Define fields, constructors, getters, and setters here
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(columnDefinition = "TEXT", nullable = false)
    @NotEmpty
    private String content;

    // Multiple choice options (persisted as a separate collection table)
    // Index of the correct choice in the `choices` list (0-based). Use null if not set.


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @Column(columnDefinition = "TEXT")
    private String choiceA;
    @Column(columnDefinition = "TEXT")
    private String choiceB;
    @Column(columnDefinition = "TEXT")
    private String choiceC;
    @Column(columnDefinition = "TEXT")
    private String choiceD;
    @Enumerated(EnumType.STRING)
    private Answer answer;


}
