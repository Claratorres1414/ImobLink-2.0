package com.PIEC.ImobLink.Services.Images;

import com.PIEC.ImobLink.DTOs.Images.StoredFile;
import com.PIEC.ImobLink.Entitys.Images;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorageService {
    StoredFile saveImage(MultipartFile file, Long userId);
    StoredFile saveUserProfileImage(MultipartFile file, Long userId);
    byte[] readFile(String filePath);
    void delete(Images image) throws IOException;
}