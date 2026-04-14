package com.smartcampus.backend.security;

import com.smartcampus.backend.module.user.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Wraps our User MongoDB entity so Spring Security can work with it.
 *
 * The @Getter gives us getId() and getUser() for use in controllers:
 *   @AuthenticationPrincipal CustomUserDetails userDetails
 *   userDetails.getId()      → MongoDB _id
 *   userDetails.getUser()    → full User entity
 */
@Getter
public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    /** Returns the MongoDB _id of this user. */
    public String getId() { return user.getId(); }

    /** Returns the role name (e.g. "ADMIN", "STUDENT") */
    public String getRole() { return user.getRole().name(); }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override public String getPassword()             { return user.getPassword(); }
    @Override public String getUsername()             { return user.getEmail(); }
    @Override public boolean isAccountNonExpired()    { return true; }
    @Override public boolean isAccountNonLocked()     { return user.isActive(); }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled()              { return user.isActive(); }
}
