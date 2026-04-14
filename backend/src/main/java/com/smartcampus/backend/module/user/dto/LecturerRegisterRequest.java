package com.smartcampus.backend.module.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LecturerRegisterRequest {

    @NotBlank(message = "Title is required")
    private String title;                        // Mr., Mrs., Ms., Dr., Prof.

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50)
    private String lastName;


    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(\\+94|0)[0-9]{9}$",
             message = "Please enter a valid Sri Lankan phone number")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Please confirm your password")
    private String confirmPassword;

    @NotBlank(message = "Faculty is required")
    private String faculty;

    @NotBlank(message = "Position is required")
    private String position;
    // Assistant Lecturer / Lecturer / Senior Lecturer /
    // Visiting Lecturer / Professor / Associate Professor
}
