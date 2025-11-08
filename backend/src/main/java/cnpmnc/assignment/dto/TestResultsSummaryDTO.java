package cnpmnc.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TestResultsSummaryDTO {
    private long totalSubmissions;
    private double highestScore;
    private double lowestScore;
    private double averageScore;
    private double maxScore;
    private double completionRate;
}
