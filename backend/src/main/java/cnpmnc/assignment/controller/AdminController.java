package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.model.Role;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ApiResponse.success(users, "Users retrieved successfully");
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<User> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setRole(role);
        User updatedUser = userRepository.save(user);
        
        return ApiResponse.success(updatedUser, "User role updated successfully");
    }

    @PutMapping("/users/{id}/activate")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<User> activateUser(@PathVariable Long id, @RequestParam Boolean activate) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setActivate(activate);
        User updatedUser = userRepository.save(user);
        
        return ApiResponse.success(updatedUser, "User activation status updated successfully");
    }
}
