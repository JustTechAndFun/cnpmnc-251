package cnpmnc.assignment.repository;

import cnpmnc.assignment.model.Test;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TestRepository extends JpaRepository<Test, String> {
    boolean existsByPasscode(String passcode);
    Optional<Test> findByPasscode(String passcode);
}
