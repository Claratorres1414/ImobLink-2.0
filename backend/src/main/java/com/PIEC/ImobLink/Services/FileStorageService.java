package com.PIEC.ImobLink.Services;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorageService {
    String saveImage(MultipartFile file, Long user_id) throws IOException;
    String saveUserProfileImage(MultipartFile file, Long user_id) throws IOException;
    byte[] readFile(String filePath) throws IOException;
}
