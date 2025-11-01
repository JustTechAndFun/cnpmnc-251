package cnpmnc.assignment.service;

import cnpmnc.assignment.dto.GoogleUserInfo;
import cnpmnc.assignment.model.Role;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class GoogleAuthService {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    public GoogleAuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> handleCallback(String code, String redirectUri) {
        try {
            // Exchange code for access token
            GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance(),
                    "https://oauth2.googleapis.com/token",
                    clientId,
                    clientSecret,
                    code,
                    redirectUri
            ).execute();

            String accessToken = tokenResponse.getAccessToken();

            // Get user info from Google
            String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + accessToken;
            GoogleUserInfo userInfo = restTemplate.getForObject(userInfoUrl, GoogleUserInfo.class);

            if (userInfo == null || userInfo.getEmail() == null) {
                throw new RuntimeException("Failed to get user info from Google");
            }

            // Create or update user
            User user = userRepository.findByEmail(userInfo.getEmail())
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(userInfo.getEmail());
                        newUser.setRole(Role.STUDENT); // Default role
                        newUser.setActivate(true);
                        return newUser;
                    });

            user.setAccessToken(accessToken);
            userRepository.save(user);

            // Return user data
            Map<String, Object> result = new HashMap<>();
            result.put("email", user.getEmail());
            result.put("name", userInfo.getName());
            result.put("picture", userInfo.getPicture());
            result.put("role", user.getRole().name());

            return result;
        } catch (Exception e) {
            throw new RuntimeException("Error processing Google callback: " + e.getMessage(), e);
        }
    }
}
