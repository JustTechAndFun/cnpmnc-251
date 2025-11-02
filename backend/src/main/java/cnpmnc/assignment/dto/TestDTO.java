package cnpmnc.assignment.dto;

import cnpmnc.assignment.model.Test;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestDTO {
    private String id;
    private String testName;
    private String description;
    private Time time;


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Time {
        private LocalDateTime openTime;
        private LocalDateTime closeTime;
        private long duration;
    }

    public static TestDTO fromTest(Test test) {
        return new TestDTO(
                test.getId(),
                test.getTestName(),
                test.getDescription(),
                new Time(
                        test.getOpenTime(),
                        test.getCloseTime(),
                        test.getDuration()
                )
        );
    }

}
