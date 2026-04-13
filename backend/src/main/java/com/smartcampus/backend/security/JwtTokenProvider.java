package com.smartcampus.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Generates and validates JWT tokens.
 *
 * Token contents (claims):
 *   subject → userId (MongoDB _id)
 *   email   → user's email
 *   role    → e.g. "ROLE_USER", "ROLE_ADMIN", "ROLE_TECHNICIAN"
 */
@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpirationMs;

    public String generateToken(String userId, String email, String role) {
        Date now    = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("role", "ROLE_" + role)   // Spring Security needs "ROLE_" prefix
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e)    { log.warn("JWT expired: {}", e.getMessage()); }
        catch (UnsupportedJwtException e)  { log.warn("JWT unsupported: {}", e.getMessage()); }
        catch (MalformedJwtException e)    { log.warn("JWT malformed: {}", e.getMessage()); }
        catch (SecurityException e)        { log.warn("JWT signature invalid: {}", e.getMessage()); }
        catch (IllegalArgumentException e) { log.warn("JWT claims empty: {}", e.getMessage()); }
        return false;
    }

    public String getUserIdFromToken(String token) { return parseClaims(token).getSubject(); }
    public String getEmailFromToken(String token)  { return (String) parseClaims(token).get("email"); }
    public String getRoleFromToken(String token)   { return (String) parseClaims(token).get("role"); }

    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build()
                .parseSignedClaims(token).getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
