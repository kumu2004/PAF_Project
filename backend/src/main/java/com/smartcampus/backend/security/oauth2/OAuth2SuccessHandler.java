package com.smartcampus.backend.security.oauth2;

import com.smartcampus.backend.module.user.entity.User;
import com.smartcampus.backend.module.user.repository.UserRepository;
import com.smartcampus.backend.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * Called by Spring Security after Google successfully authenticates the user.
 *
 * What it does:
 * 1. Extracts email, name, picture from Google's response
 * 2. Finds the user in MongoDB — creates a new USER if first-time login
 * 3. Generates a JWT token
 * 4. Redirects frontend to /oauth2/callback?token=<jwt>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        OAuth2UserInfoFactory userInfo = OAuth2UserInfoFactory.fromGoogle(oAuth2User);

        // Find user — only allow login if already registered
        User user;
        try {
            user = userRepository.findByEmail(userInfo.getEmail())
                    .map(existing -> {
                        // Update profile info in case it changed on Google
                        String[] names = splitName(userInfo.getName());
                        existing.setFirstName(names[0]);
                        existing.setLastName(names[1]);
                        existing.setProfilePictureUrl(userInfo.getPicture());
                        return userRepository.save(existing);
                    })
                    .orElseThrow(() -> new RuntimeException("Email not registered: " + userInfo.getEmail()));
        } catch (RuntimeException e) {
            log.warn("Google OAuth2 login rejected — email not registered: {}", userInfo.getEmail());
            String redirectUrl = UriComponentsBuilder
                    .fromUriString(frontendUrl + "/login")
                    .queryParam("error", "not_registered")
                    .build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            return;
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        log.info("Google OAuth2 login successful for: {}", user.getEmail());

        // Redirect to frontend with token in query param
        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/oauth2/callback")
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);

    }

    private String[] splitName(String fullName) {
        if (fullName == null || fullName.isBlank()) return new String[]{"Unknown", "User"};
        String[] parts = fullName.trim().split("\\s+", 2);
        String firstName = parts[0];
        String lastName = parts.length > 1 && !parts[1].isBlank() ? parts[1] : "-";
        return new String[]{firstName, lastName};
    }
}
