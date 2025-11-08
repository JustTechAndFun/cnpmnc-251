package cnpmnc.assignment.repository;

import cnpmnc.assignment.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {
}
