package cnpmnc.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StudentGradeDTO {
    private String submissionId;
    private String testId;
    private String testName;
    private String classId;
    private String className;
    private double score;
    private double maxScore;
    private double percentage;
    private LocalDateTime submittedAt;
    private String status;
}
