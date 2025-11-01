package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.ApiResponse;
import cnpmnc.assignment.dto.GoogleCallbackRequest;
import cnpmnc.assignment.service.GoogleAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication endpoints for Google OAuth2")
public class AuthController {

    private final GoogleAuthService googleAuthService;

    public AuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google/callback")
    @Operation(summary = "Handle Google OAuth2 callback (POST)", 
               description = "Exchange authorization code for user information via POST request",
               security = {})
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleGoogleCallbackPost(
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

    @GetMapping("/google/callback")
    @Operation(summary = "Handle Google OAuth2 callback (GET)", 
               description = "Receives authorization code from Google and redirects to frontend",
               security = {})
    public ResponseEntity<?> handleGoogleCallbackGet(
            @Parameter(description = "Authorization code from Google") @RequestParam("code") String code,
            @Parameter(description = "Frontend redirect URI") @RequestParam("redirect_uri") String redirectUri,
            HttpSession session
    ) {
        try {
            Map<String, Object> userData = googleAuthService.handleCallback(code, redirectUri);

            // Store user info in session
            session.setAttribute("user", userData);
            session.setAttribute("authenticated", true);

            // Redirect to frontend success page
            return ResponseEntity.status(302)
                    .header("Location", "http://localhost:3000/dashboard")
                    .build();
        } catch (Exception e) {
            // Redirect to frontend error page
            return ResponseEntity.status(302)
                    .header("Location", "http://localhost:3000/login?error=" + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/user")
    @Operation(summary = "Get current user", description = "Retrieve currently authenticated user information")
    @SecurityRequirement(name = "cookieAuth")
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
    @Operation(summary = "Logout", description = "Invalidate user session and logout")
    @SecurityRequirement(name = "cookieAuth")
    public ResponseEntity<ApiResponse<Void>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }
}
