package com.PIEC.ImobLink.Services.Images;

import com.PIEC.ImobLink.DTOs.Images.StoredFile;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    StoredFile saveImage(MultipartFile file, Long userId);
    StoredFile saveUserProfileImage(MultipartFile file, Long userId);
    byte[] readFile(String filePath);
}