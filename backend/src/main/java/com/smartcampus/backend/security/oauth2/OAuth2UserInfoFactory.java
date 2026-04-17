package com.smartcampus.backend.security.oauth2;

import lombok.Getter;
import org.springframework.security.oauth2.core.user.OAuth2User;

/**
 * Extracts profile info from Google's OAuth2 response.
 * Google returns: email, name, picture (when scope=email,profile)
 */
@Getter
public class OAuth2UserInfoFactory {

    private final String email;
    private final String name;
    private final String picture;

    private OAuth2UserInfoFactory(String email, String name, String picture) {
        this.email   = email;
        this.name    = name;
        this.picture = picture;
    }

    public static OAuth2UserInfoFactory fromGoogle(OAuth2User oAuth2User) {
        String email   = oAuth2User.getAttribute("email");
        String name    = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        if (email == null || email.isBlank()) {
            throw new RuntimeException(
                "Email not returned by Google. Ensure 'email' scope is configured in application.properties."
            );
        }
        return new OAuth2UserInfoFactory(email, name, picture);
    }
}
