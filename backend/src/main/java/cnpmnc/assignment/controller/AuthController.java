package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.dto.GoogleCallbackRequest;
import cnpmnc.assignment.service.GoogleAuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final GoogleAuthService googleAuthService;

    public AuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google/callback")
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleGoogleCallback(
            @RequestBody GoogleCallbackRequest request,
            HttpSession session
    ) {
        try {
            Map<String, Object> userData = googleAuthService.handleCallback(
                    request.getCode(),
                    request.getRedirectUri()
            );

            // Store user info in session
            session.setAttribute("user", userData);
            session.setAttribute("authenticated", true);

            return ResponseEntity.ok(ApiResponse.success(userData, "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Authentication failed: " + e.getMessage())
            );
        }
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(HttpSession session) {
        Boolean authenticated = (Boolean) session.getAttribute("authenticated");
        if (authenticated != null && authenticated) {
            @SuppressWarnings("unchecked")
            Map<String, Object> user = (Map<String, Object>) session.getAttribute("user");
            return ResponseEntity.ok(ApiResponse.success(user, "User retrieved"));
        }
        return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }
}
