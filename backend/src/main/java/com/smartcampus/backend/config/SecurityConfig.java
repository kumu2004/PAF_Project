package com.smartcampus.backend.config;

import com.smartcampus.backend.security.JwtAuthenticationFilter;
import com.smartcampus.backend.security.oauth2.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Master Spring Security configuration.
 *
 * Handles:
 *  - JWT stateless auth on every API request
 *  - Google OAuth2 login flow
 *  - BCrypt password encoding for email/password accounts
 *  - CORS using our CorsConfig bean
 *  - Public vs protected endpoint rules
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final UserDetailsService userDetailsService;

    // ── Password Encoder ──────────────────────────────────────────────────────

    /**
     * BCrypt password encoder. Injected into AuthService for hashing passwords.
     * BCrypt automatically salts and rehashes — safe against rainbow-table attacks.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ── Authentication Provider ───────────────────────────────────────────────

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    // ── Security Filter Chain ─────────────────────────────────────────────────

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            @Qualifier("corsConfigurationSource") CorsConfigurationSource corsConfigurationSource
    ) throws Exception {
        http
            // Disable CSRF (using JWT, not cookies)
            .csrf(csrf -> csrf.disable())

            // CORS — handled by CorsConfig bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // Stateless — no HttpSession created or used
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Endpoint access rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — anyone can access without a token
                .requestMatchers(
                    "/oauth2/**",
                    "/login/**",
                    "/api/auth/**",
                    "/error",
                    "/actuator/health"
                ).permitAll()
                // Everything else requires a valid JWT
                .anyRequest().authenticated()
            )

            // Google OAuth2 login flow
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(endpoint ->
                        endpoint.baseUri("/oauth2/authorization"))
                .redirectionEndpoint(endpoint ->
                        endpoint.baseUri("/login/oauth2/code/*"))
                .successHandler(oAuth2SuccessHandler)
            )

            // Wire in the JWT filter
            .addFilterBefore(jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
