package cnpmnc.assignment.service;

import cnpmnc.assignment.dto.ResultPaginationDTO;
import cnpmnc.assignment.dto.TeacherDTO;
import cnpmnc.assignment.dto.UserCriteriaDTO;
import cnpmnc.assignment.model.Role;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    public ResultPaginationDTO getAllTeacher(String email,Boolean activate, Pageable pageable) {

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
            if (activate!=null) {
                predicate = cb.and(predicate, cb.equal(root.get("activate"), activate));
            }
            return predicate;
        };

        Page<User> page=userRepository.findAll(spec,pageable);

        List<TeacherDTO> users=page.getContent().stream()
                .map(TeacherDTO::fromUser).collect(Collectors.toList());


        ResultPaginationDTO resultPaginationDTO=new ResultPaginationDTO();

        ResultPaginationDTO.Meta mt=new ResultPaginationDTO.Meta();
        mt.setPage(page.getNumber());
        mt.setPageSize(page.getSize());

        mt.setPages(page.getTotalPages());
        mt.setTotal(page.getNumberOfElements());

        resultPaginationDTO.setMeta(mt);
        resultPaginationDTO.setResult(users);
        return resultPaginationDTO;
    }
    public TeacherDTO createTeacherAccount(User user) {
        String email = user.getEmail();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email address already in use");
        }
        user.setRole(Role.TEACHER);
        user.setActivate(Boolean.FALSE);
        User createdUser = userRepository.save(user);
        return TeacherDTO.fromUser(createdUser);
    }
}
