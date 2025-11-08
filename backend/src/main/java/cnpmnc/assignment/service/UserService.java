package cnpmnc.assignment.service;

import cnpmnc.assignment.dto.TeacherDTO;
import cnpmnc.assignment.dto.UserDto;
import cnpmnc.assignment.model.Role;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

                String raw = email.trim().toLowerCase();
                String escaped = escapeForLike(raw);
                // sử dụng escape char '\'
                predicate = cb.and(predicate,
                        cb.like(cb.lower(root.get("email")), "%" + escaped + "%", '\\'));
                // Email chứa chuỗi (nếu có)
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
        if (user == null) {
            throw new IllegalArgumentException("User must not be null");
        }
        if (user.getEmail() == null) {
            throw new IllegalArgumentException("User email must not be null");
        }
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
    private String escapeForLike(String input) {
        // escape backslash first, then % and _
        return input.replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }
    
    @Transactional
    public UserDto toggleUserActivation(String userId, Boolean activate) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        user.setActivate(activate);
        User updatedUser = userRepository.save(user);
        
        // Send notification email
        String subject = activate ? "Account Activated" : "Account Deactivated";
        String message = activate 
            ? "Your account has been activated. You can now access the system."
            : "Your account has been deactivated. Please contact the administrator for more information.";
        
        emailService.sendSimpleMail(user.getEmail(), subject, message);
        
        return UserDto.fromUser(updatedUser);
    }

}
