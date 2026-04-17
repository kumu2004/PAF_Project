package com.smartcampus.backend.common.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "pdf"};

    /**
     * Upload a file to Cloudinary in a specific folder
     */
    @SuppressWarnings("rawtypes")
    public String uploadFile(MultipartFile file, String folder) {
        validateFile(file);

        // Check if Cloudinary is properly configured. If not, return a placeholder for testing.
        if (cloudinary.config.apiKey == null || cloudinary.config.apiKey.isEmpty()) {
            log.warn("Cloudinary API key is missing. Returning a placeholder URL for testing.");
            // Return a reliable placeholder image URL
            return "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";
        }

        try {
            Map options = ObjectUtils.asMap(
                "folder", "smart-campus/" + folder,
                "resource_type", "auto",
                "quality", "auto",
                "fetch_format", "auto"
            );
            
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            String url = (String) uploadResult.get("secure_url");
            log.info("File uploaded to Cloudinary: {} (Folder: {})", url, folder);
            return url;
            
        } catch (IOException e) {
            log.error("Cloudinary upload failed", e);
            throw new RuntimeException("Failed to upload file to Cloudinary: " + e.getMessage());
        }
    }

    /**
     * Delete a file from Cloudinary by its URL
     */
    public void deleteFileByUrl(String url) {
        if (url == null || url.isEmpty() || !url.contains("cloudinary.com")) {
            return;
        }

        try {
            String publicId = extractPublicIdWithFolder(url);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Deleted file from Cloudinary: {}", publicId);
        } catch (Exception e) {
            log.error("Failed to delete file from Cloudinary: {}", url, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File exceeds maximum size of 10MB");
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new RuntimeException("Invalid file name");
        }

        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        boolean allowed = false;
        for (String ext : ALLOWED_EXTENSIONS) {
            if (ext.equals(extension)) {
                allowed = true;
                break;
            }
        }

        if (!allowed) {
            throw new RuntimeException("File type not supported. Allowed types: jpg, jpeg, png, webp, pdf");
        }
    }

    private String extractPublicIdWithFolder(String url) {
        // Example: https://res.cloudinary.com/cloud_name/image/upload/v12345/smart-campus/folder/public_id.jpg
        // We need: smart-campus/folder/public_id
        
        String[] parts = url.split("/upload/");
        if (parts.length < 2) return "";
        
        String pathWithVersion = parts[1]; // v12345/smart-campus/folder/public_id.jpg
        String pathWithoutVersion = pathWithVersion.substring(pathWithVersion.indexOf("/") + 1); // smart-campus/folder/public_id.jpg
        
        return pathWithoutVersion.contains(".") 
            ? pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf(".")) 
            : pathWithoutVersion;
    }
}
