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

            // Get current session, invalidate it for security
            HttpSession oldSession = httpRequest.getSession(false);
            if (oldSession != null) {
                oldSession.invalidate();
            }
            
            // Create new session - this will generate a new JSESSIONID cookie
            HttpSession newSession = httpRequest.getSession(true);
            
            // Store user info in new session
            newSession.setAttribute("user", user);
            newSession.setAttribute("authenticated", true);
            
            // Set session max inactive interval (30 days in seconds)
            newSession.setMaxInactiveInterval(2592000);
            
            // Log for debugging
            System.out.println("[AUTH] New session created: " + newSession.getId());
            System.out.println("[AUTH] User authenticated: " + user.getEmail());
            System.out.println("[AUTH] Session will expire in: " + newSession.getMaxInactiveInterval() + " seconds");

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
