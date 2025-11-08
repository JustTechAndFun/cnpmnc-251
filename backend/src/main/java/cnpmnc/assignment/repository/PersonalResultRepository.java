package cnpmnc.assignment.repository;

import cnpmnc.assignment.model.PersonalResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonalResultRepository extends JpaRepository<PersonalResult, String> {
    Optional<PersonalResult> findByTestId(String testId);
}
