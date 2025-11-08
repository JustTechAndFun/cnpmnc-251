package cnpmnc.assignment.repository;

import cnpmnc.assignment.model.Submission;
import cnpmnc.assignment.model.Test;
import cnpmnc.assignment.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, String> {
    
    List<Submission> findByTest(Test test);
    
    List<Submission> findByTestId(String testId);
    
    List<Submission> findByStudentId(String studentId);
    
    Optional<Submission> findByTestAndStudent(Test test, User student);
    
    @Query("SELECT s FROM Submission s WHERE s.test.id = :testId ORDER BY s.score DESC")
    List<Submission> findByTestIdOrderByScoreDesc(@Param("testId") String testId);
    
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.test.id = :testId")
    long countByTestId(@Param("testId") String testId);
    
    @Query("SELECT MAX(s.score) FROM Submission s WHERE s.test.id = :testId")
    Double findMaxScoreByTestId(@Param("testId") String testId);
    
    @Query("SELECT MIN(s.score) FROM Submission s WHERE s.test.id = :testId")
    Double findMinScoreByTestId(@Param("testId") String testId);
    
    @Query("SELECT AVG(s.score) FROM Submission s WHERE s.test.id = :testId")
    Double findAvgScoreByTestId(@Param("testId") String testId);
}
