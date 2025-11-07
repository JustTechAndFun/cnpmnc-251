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
    private final EmailService emailService;
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
    public TeacherDTO createTeacherAccount(User user) {
        String email = user.getEmail();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email address already in use");
        }
        User newUser = new User();
        newUser.setRole(Role.TEACHER);
        newUser.setActivate(Boolean.FALSE);
        newUser.setEmail(user.getEmail());
        User createdUser = userRepository.save(newUser);
        // Gửi email thông báo đã tạo
        emailService.sendSimpleMail(newUser.getEmail(),
                "Teacher Account Created",
                "Your teacher account has been created. Please login to activate your account.");
        return TeacherDTO.fromUser(createdUser);
    }
}
