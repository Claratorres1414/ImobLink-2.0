package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final UserRepository userRepository;

    public String saveImage(MultipartFile file, Authentication auth) throws IOException, java.io.IOException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        String folder = "uploads/users/" + user.getId();
        Files.createDirectories(Paths.get(folder));

        String filePath = folder + "/" + file.getOriginalFilename();
        Files.write(Paths.get(filePath), file.getBytes());

        Images image = new Images();
        image.setFilename(file.getOriginalFilename());
        image.setFilepath(filePath);
        image.setContentType(file.getContentType());
        image.setUser(user);
        try {
            imageRepository.save(image);
        } catch (IOException e) {
            throw new IOException("Erro ao salvar a imagem: " + e.getMessage());
        }

        return image.getFilepath();
    }
}
