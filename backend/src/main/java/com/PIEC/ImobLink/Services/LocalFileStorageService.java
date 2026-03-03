package com.PIEC.ImobLink.Services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {
    @Override
    public String saveImage(MultipartFile file, Long userId) throws IOException {
        String folder = "uploads/users/" + userId;
        Files.createDirectories(Paths.get(folder));

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();;
        String filePath = folder + "/"+ fileName;

        Files.write(Paths.get(filePath), file.getBytes());

        return filePath;
    }

    @Override
    public String saveUserProfileImage (MultipartFile file, Long userId) throws IOException {
        String folder = "uploads/users/" + userId + "/profile";
        Files.createDirectories(Paths.get(folder));

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String filePath = folder + "/"+ fileName;

        Files.write(Paths.get(filePath), file.getBytes());

        return filePath;
    }

    @Override
    public byte[] readFile(String filePath) throws IOException {
        return Files.readAllBytes(Paths.get(filePath));
    }
}
