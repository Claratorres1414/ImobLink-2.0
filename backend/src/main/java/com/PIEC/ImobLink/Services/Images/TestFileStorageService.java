package com.PIEC.ImobLink.Services.Images;

import com.PIEC.ImobLink.DTOs.Images.StoredFile;
import com.PIEC.ImobLink.Entitys.Images;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@Profile("test")
public class TestFileStorageService implements FileStorageService {

    @Override
    public StoredFile saveImage(MultipartFile file, Long userId) {
        return null;
    }

    @Override
    public StoredFile saveUserProfileImage(MultipartFile file, Long userId) {
        return null;
    }

    @Override
    public byte[] readFile(String filePath) {
        return new byte[0];
    }

    @Override
    public void delete(Images image) throws IOException {

    }
}