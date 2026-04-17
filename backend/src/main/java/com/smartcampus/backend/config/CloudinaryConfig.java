package com.smartcampus.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

/**
 * Configuration for Cloudinary integration.
 * Reads CLOUDINARY_URL from Spring properties (injected from .env.properties).
 * Format: cloudinary://api_key:api_secret@cloud_name
 */
@Configuration
public class CloudinaryConfig {

    @org.springframework.beans.factory.annotation.Value("${CLOUDINARY_URL:}")
    private String cloudinaryUrl;

    @Bean
    public Cloudinary cloudinary() {
        if (cloudinaryUrl == null || cloudinaryUrl.isEmpty()) {
            return new Cloudinary();
        }
        return new Cloudinary(cloudinaryUrl);
    }
}
