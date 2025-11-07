package cnpmnc.assignment.service;

import cnpmnc.assignment.dto.TeacherDTO;
import cnpmnc.assignment.model.Role;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    public List<TeacherDTO> getAllTeacher(String email, Boolean activate) {
        Specification<User> spec = (root, query, cb) -> {
            Predicate predicate = cb.conjunction(); // bắt đầu với điều kiện luôn đúng
            // Role = "teacher"
            predicate = cb.and(predicate, cb.equal(root.get("role"), Role.TEACHER));
            //Nếu Có filter
            if (email != null && !email.isEmpty()) {
                // Email chứa chuỗi (nếu có)
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%"));
            }
            // Active (nếu có)
            if (activate != null) {
                predicate = cb.and(predicate, cb.equal(root.get("activate"), activate));
            }
            return  predicate;
        };
        List<User> teachers = userRepository.findAll(spec);
        return teachers.stream()
                .map(TeacherDTO::fromUser).collect(Collectors.toList());
    }
}
