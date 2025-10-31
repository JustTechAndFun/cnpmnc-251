package cnpmnc.assignment.controller;

import cnpmnc.assignment.dto.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class OAuth2Controller {

    @GetMapping("/oauth2/success")
    public ApiResponse<Map<String, Object>> loginSuccess(@AuthenticationPrincipal OAuth2User principal) {
        Map<String, Object> userData = new HashMap<>();
        userData.put("email", principal.getAttribute("email"));
        userData.put("name", principal.getAttribute("name"));
        userData.put("authorities", principal.getAuthorities());
        
        return ApiResponse.success(userData, "Login successful");
    }

    @GetMapping("/oauth2/failure")
    public ApiResponse<Object> loginFailure() {
        return ApiResponse.error("Login failed");
    }

    @GetMapping("/api/user/info")
    public ApiResponse<Map<String, Object>> getUserInfo(@AuthenticationPrincipal OAuth2User principal) {
        Map<String, Object> userData = new HashMap<>();
        userData.put("email", principal.getAttribute("email"));
        userData.put("name", principal.getAttribute("name"));
        userData.put("picture", principal.getAttribute("picture"));
        userData.put("authorities", principal.getAuthorities());
        
        return ApiResponse.success(userData, "User information retrieved successfully");
    }
}
