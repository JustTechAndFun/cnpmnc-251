package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.dto.GoogleCallbackRequest;
import cnpmnc.assignment.dto.UserDto;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.service.GoogleAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication endpoints for Google OAuth2")
public class AuthController {

    private final GoogleAuthService googleAuthService;

    public AuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google/callback")
    @Operation(summary = "Handle Google OAuth2 callback", 
               description = "Exchange authorization code for user information",
               security = {})
    public ResponseEntity<ApiResponse<UserDto>> handleGoogleCallback(
            @RequestBody GoogleCallbackRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            User user = googleAuthService.handleCallback(
                    request.getCode(),
                    request.getRedirectUri()
            );

            // Get or create session (reuse existing if available)
            HttpSession session = httpRequest.getSession(true);
            
            // Check if session already has a different user - invalidate for security
            Object existingUserObj = session.getAttribute("user");
            if (existingUserObj instanceof User) {
                User existingUser = (User) existingUserObj;
                if (!existingUser.getEmail().equals(user.getEmail())) {
                    // Different user - invalidate old session and create new one
                    session.invalidate();
                    session = httpRequest.getSession(true);
                    System.out.println("[AUTH] Different user detected, session invalidated and recreated");
                }
            }
            
            // Store/update user info in session
            session.setAttribute("user", user);
            session.setAttribute("authenticated", true);
            
            // Set session max inactive interval (30 days in seconds)
            session.setMaxInactiveInterval(2592000);
            
            // Log for debugging
            System.out.println("[AUTH] Session ID: " + session.getId());
            System.out.println("[AUTH] User authenticated: " + user.getEmail());
            System.out.println("[AUTH] Session max inactive interval: " + session.getMaxInactiveInterval() + " seconds");

            // Return UserDto without accessToken
            UserDto userDto = UserDto.fromUser(user);
            return ResponseEntity.ok(ApiResponse.success(userDto, "Login successful"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Authentication failed: " + e.getMessage())
            );
        }
    }

    @GetMapping("/user")
    @Operation(summary = "Get current user", description = "Retrieve currently authenticated user information")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(HttpSession session) {
        Boolean authenticated = (Boolean) session.getAttribute("authenticated");
        if (authenticated != null && authenticated) {
            Object userObj = session.getAttribute("user");
            
            if (userObj instanceof User) {
                User user = (User) userObj;
                // Return UserDto without accessToken
                UserDto userDto = UserDto.fromUser(user);
                return ResponseEntity.ok(ApiResponse.success(userDto, "User retrieved"));
            }
        }
        return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Invalidate user session and logout")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<Void>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }
}
