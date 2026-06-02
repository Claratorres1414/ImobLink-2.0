package com.PIEC.ImobLink.Services.Images;

import com.PIEC.ImobLink.Entitys.Images;
import com.cloudinary.Cloudinary;
import com.PIEC.ImobLink.DTOs.Images.StoredFile;
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
    public StoredFile saveImage(MultipartFile file, Long userId) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "posts/" + userId
                    )
            );

            return new StoredFile(result.get("secure_url").toString(), result.get("public_id").toString());
        } catch (IOException e) {
            throw new RuntimeException("Erro ao enviar imagem para o Cloudinary", e);
        }
    }

    @Override
    public StoredFile saveUserProfileImage(MultipartFile file, Long userId) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "profiles/" + userId
                    )
            );

            return new StoredFile(result.get("secure_url").toString(), result.get("public_id").toString());
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

    @Override
    public void delete(Images image) throws IOException {

        if (image.getCloudinaryPublicId() == null) {
            return;
        }

        cloudinary.uploader().destroy(
                image.getCloudinaryPublicId(),
                Map.of()
        );
    }
}
