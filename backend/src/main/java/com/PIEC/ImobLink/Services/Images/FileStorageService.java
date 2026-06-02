package com.PIEC.ImobLink.Services.Images;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String saveImage(MultipartFile file, Long userId);
    String saveUserProfileImage(MultipartFile file, Long userId);
    byte[] readFile(String filePath);
}