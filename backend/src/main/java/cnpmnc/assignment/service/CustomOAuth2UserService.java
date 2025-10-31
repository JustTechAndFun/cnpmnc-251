package cnpmnc.assignment.service;

import cnpmnc.assignment.model.Role;
import cnpmnc.assignment.model.User;
import cnpmnc.assignment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String accessToken = userRequest.getAccessToken().getTokenValue();
        
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(email, accessToken));
        
        user.setAccessToken(accessToken);
        userRepository.save(user);
        
        Map<String, Object> attributes = oauth2User.getAttributes();
        String authority = user.getRole().name();
        
        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(authority)),
                attributes,
                "sub"
        );
    }
    
    private User createNewUser(String email, String accessToken) {
        User user = new User();
        user.setEmail(email);
        user.setAccessToken(accessToken);
        user.setRole(Role.STUDENT); // Default role
        user.setActivate(true); // Default not activated
        return userRepository.save(user);
    }
}
