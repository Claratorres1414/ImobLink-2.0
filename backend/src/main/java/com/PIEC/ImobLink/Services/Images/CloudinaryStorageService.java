package com.PIEC.ImobLink.Services.Images;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Map;

@Service
@Profile("prod")
@RequiredArgsConstructor
public class CloudinaryStorageService implements FileStorageService {
    private final Cloudinary cloudinary;

    @Override
    public String saveImage(MultipartFile file, Long userId) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "posts/" + userId
                    )
            );

            return result.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Erro ao enviar imagem para o Cloudinary", e);
        }
    }

    @Override
    public String saveUserProfileImage(MultipartFile file, Long userId) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "profiles/" + userId
                    )
            );

            return result.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Erro ao enviar imagem de perfil para o Cloudinary", e);
        }
    }

    @Override
    public byte[] readFile(String filePath) {
        try (InputStream inputStream = new URL(filePath).openStream()) {
            return inputStream.readAllBytes();
        }  catch (IOException e) {
            throw new RuntimeException("Erro ao ler imagem do Cloudinary", e);
        }
    }
}
