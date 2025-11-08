package cnpmnc.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassDto {
    private String id;
    private String name;
    private String description;
    private String classCode;
    private String semester;
    private Integer year;
    private TeacherDto teacher;
    private Integer studentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TeacherDto {
        private String id;
        private String email;
    }
}
