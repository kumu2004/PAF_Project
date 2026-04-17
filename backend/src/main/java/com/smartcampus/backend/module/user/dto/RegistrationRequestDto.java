package com.smartcampus.backend.module.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationRequestDto {
    private String userId;
    private String role;
    private String title;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String faculty;
    private String position;
    private String technicianPosition;
}
