package cnpmnc.assignment.repository;

import cnpmnc.assignment.model.Test;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestRepository extends JpaRepository<Test, String> {
    boolean existsByPasscode(String passcode);
}
