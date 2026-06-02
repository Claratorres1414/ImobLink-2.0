package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.Exceptions.FileStorageException;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@Profile("dev")
@Service
public class LocalFileStorageService implements FileStorageService {

    @Override
    public String saveImage(MultipartFile file, Long userId) {
        String folder = "uploads/users/" + userId;
        return writeFile(file, folder);
    }

    @Override
    public String saveUserProfileImage(MultipartFile file, Long userId) {
        String folder = "uploads/users/" + userId + "/profile";
        return writeFile(file, folder);
    }

    @Override
    public byte[] readFile(String filePath) {
        try {
            return Files.readAllBytes(Paths.get(filePath));
        } catch (IOException e) {
            throw new FileStorageException("Erro ao ler arquivo: " + filePath, e);
        }
    }

    private String writeFile(MultipartFile file, String folder) {
        try {
            Files.createDirectories(Paths.get(folder));
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String filePath = folder + "/" + fileName;
            Files.write(Paths.get(filePath), file.getBytes());
            return filePath;
        } catch (IOException e) {
            throw new FileStorageException("Erro ao salvar arquivo em: " + folder, e);
        }
    }
}