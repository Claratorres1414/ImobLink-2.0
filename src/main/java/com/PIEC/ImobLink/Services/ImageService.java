package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
import io.jsonwebtoken.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.nio.file.Files;
import java.nio.file.Paths;

@Service
public class ImageService {
    @Autowired
    private ImageRepository imageRepository;

    public Images saveImage(MultipartFile file, User user) throws IOException, java.io.IOException {
        String folder = "uploads/users/" + user.getId();
        Files.createDirectories(Paths.get(folder));

        String filePath = folder + "/" + file.getOriginalFilename();
        Files.write(Paths.get(filePath), file.getBytes());

        Images image = new Images();
        image.setFilename(file.getOriginalFilename());
        image.setFilepath(filePath);
        image.setContentType(file.getContentType());
        image.setUser(user);

        return imageRepository.save(image);
    }
}
