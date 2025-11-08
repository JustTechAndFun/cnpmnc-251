package cnpmnc.assignment.dto;

import cnpmnc.assignment.model.Submission;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StudentSubmissionDTO {
    private String submissionId;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private double score;
    private double maxScore;
    private LocalDateTime submittedAt;
    private Integer completionTime;
    private String status;

    public static StudentSubmissionDTO fromSubmission(Submission submission) {
        StudentSubmissionDTO dto = new StudentSubmissionDTO();
        dto.setSubmissionId(submission.getId());
        dto.setStudentId(submission.getStudent().getId());
        dto.setStudentName(submission.getStudent().getEmail()); // User doesn't have name field, using email
        dto.setStudentEmail(submission.getStudent().getEmail());
        dto.setScore(submission.getScore());
        dto.setMaxScore(submission.getMaxScore());
        dto.setSubmittedAt(submission.getSubmittedAt());
        dto.setCompletionTime(submission.getCompletionTime());
        dto.setStatus(submission.getStatus().name());
        return dto;
    }
}
