package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.dto.UserProfileDto;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.model.UserSchool;
import cnpmnc.assignment.repository.UserSchoolRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile", description = "User profile endpoints")
public class ProfileApiController {

    private final UserSchoolRepository userSchoolRepository;

    public ProfileApiController(UserSchoolRepository userSchoolRepository) {
        this.userSchoolRepository = userSchoolRepository;
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
}
