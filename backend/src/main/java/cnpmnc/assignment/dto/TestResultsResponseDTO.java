package cnpmnc.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TestResultsResponseDTO {
    private String testId;
    private String testName;
    private List<StudentSubmissionDTO> submissions;
    private TestResultsSummaryDTO summary;
}
