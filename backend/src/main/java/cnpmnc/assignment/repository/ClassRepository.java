package cnpmnc.assignment.repository;

import cnpmnc.assignment.model.Class;
import cnpmnc.assignment.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<Class, String> {

    
    Optional<Class> findByClassCode(String classCode);
    
    boolean existsByClassCode(String classCode);
    
    List<Class> findByTeacher(User teacher);
    
    List<Class> findByStudentsContaining(User student);
}
