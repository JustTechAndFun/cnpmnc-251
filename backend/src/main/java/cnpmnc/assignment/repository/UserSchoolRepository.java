package cnpmnc.assignment.repository;

import cnpmnc.assignment.model.UserSchool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSchoolRepository extends JpaRepository<UserSchool, Long> {
    Optional<UserSchool> findByUserId(String userId);
}
