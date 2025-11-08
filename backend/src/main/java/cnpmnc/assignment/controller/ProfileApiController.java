package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.dto.UpdateProfileRequest;
import cnpmnc.assignment.dto.UserProfileDto;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.model.UserSchool;
import cnpmnc.assignment.repository.UserRepository;
import cnpmnc.assignment.repository.UserSchoolRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile", description = "User profile endpoints")
public class ProfileApiController {

    private final UserSchoolRepository userSchoolRepository;
    private final UserRepository userRepository;

    public ProfileApiController(UserSchoolRepository userSchoolRepository, UserRepository userRepository) {
        this.userSchoolRepository = userSchoolRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Get current user's profile", description = "Return profile of the currently authenticated user")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(HttpSession session) {
        Boolean authenticated = (Boolean) session.getAttribute("authenticated");
        if (authenticated != null && authenticated) {
            Object userObj = session.getAttribute("user");
            if (userObj instanceof User) {
                User user = (User) userObj;

                // fetch school info if available
                UserSchool userSchool = userSchoolRepository.findByUserId(user.getId()).orElse(null);

                UserProfileDto profile = UserProfileDto.fromUser(user, userSchool);
                return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved"));
            }
        }

        return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
    }

    @PutMapping
    @Operation(summary = "Update current user's profile", description = "Update student ID for the currently authenticated user")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            HttpSession session) {
        Boolean authenticated = (Boolean) session.getAttribute("authenticated");
        if (authenticated == null || !authenticated) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        Object userObj = session.getAttribute("user");
        if (!(userObj instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User session invalid"));
        }

        User user = (User) userObj;

        // Check if studentId is already taken by another user
        if (request.getStudentId() != null && !request.getStudentId().isEmpty()) {
            User existingUser = userRepository.findByStudentId(request.getStudentId()).orElse(null);
            if (existingUser != null && !existingUser.getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("Student ID already in use"));
            }

            user.setStudentId(request.getStudentId());
            User updatedUser = userRepository.save(user);
            
            // Update session
            session.setAttribute("user", updatedUser);

            // Fetch updated profile
            UserSchool userSchool = userSchoolRepository.findByUserId(updatedUser.getId()).orElse(null);
            UserProfileDto profile = UserProfileDto.fromUser(updatedUser, userSchool);

            return ResponseEntity.ok(ApiResponse.success(profile, "Profile updated successfully"));
        }

        return ResponseEntity.badRequest().body(ApiResponse.error("No valid fields to update"));
    }
}
