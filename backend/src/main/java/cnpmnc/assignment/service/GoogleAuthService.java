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

            // Create or update user with retry logic for duplicate key
            User user;
            try {
                user = userRepository.findByEmail(userInfo.getEmail())
                        .orElseGet(() -> {
                            User newUser = new User();
                            newUser.setEmail(userInfo.getEmail());
                            newUser.setRole(Role.STUDENT); // Default role
                            newUser.setActivate(true);
                            return newUser;
                        });

                user.setAccessToken(accessToken);
                user = userRepository.save(user);
            } catch (Exception e) {
                // If duplicate key error, fetch the existing user
                if (e.getMessage() != null && e.getMessage().contains("duplicate key")) {
                    user = userRepository.findByEmail(userInfo.getEmail())
                            .orElseThrow(() -> new RuntimeException("User not found after duplicate key error"));
                    user.setAccessToken(accessToken);
                    user = userRepository.save(user);
                } else {
                    throw e;
                }
            }

            // Return the user object directly
            return user;
        } catch (Exception e) {
            throw new RuntimeException("Error processing Google callback: " + e.getMessage(), e);
        }
    }
}
