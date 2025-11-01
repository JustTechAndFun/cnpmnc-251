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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

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

    @Transactional
    public User handleCallback(String code, String redirectUri) {
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
            System.out.println("Google User Info: " + userInfo);
            // Check if user exists
            User user = userRepository.findByEmail(userInfo.getEmail())
                    .orElse(null);

            if (user == null) {
                // User doesn't exist - create new user
                user = new User();
                user.setEmail(userInfo.getEmail());
                user.setRole(Role.STUDENT); // Default role for new users
                user.setActivate(true);
                user.setAccessToken(accessToken);
                
                try {
                    user = userRepository.save(user);
                } catch (Exception e) {
                    // Handle race condition: user might have been created by another thread
                    if (e.getMessage() != null && e.getMessage().contains("duplicate key")) {
                        user = userRepository.findByEmail(userInfo.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found after duplicate key error"));
                        user.setAccessToken(accessToken);
                        user = userRepository.save(user);
                    } else {
                        throw new RuntimeException("Failed to create new user: " + e.getMessage(), e);
                    }
                }
            } else {
                // User exists - update access token and continue with existing logic
                user.setAccessToken(accessToken);
                user = userRepository.save(user);
            }

            // Return the user object
            return user;
        } catch (Exception e) {
            throw new RuntimeException("Error processing Google callback: " + e.getMessage(), e);
        }
    }
}
