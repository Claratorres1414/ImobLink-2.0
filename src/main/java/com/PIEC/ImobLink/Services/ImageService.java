package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.ImageResponse;
import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public Images saveImage(MultipartFile file, Authentication auth) throws IOException, java.io.IOException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        String folder = "uploads/users/" + user.getId();
        Files.createDirectories(Paths.get(folder));

        String filePath = folder + "/" + file.getOriginalFilename();
        Files.write(Paths.get(filePath), file.getBytes());

        Images image = new Images();
        image.setFilename(UUID.randomUUID() + "_" + file.getOriginalFilename());
        image.setFilepath(filePath);
        image.setContentType(file.getContentType());
        image.setUser(user);
        try {
            imageRepository.save(image);
        } catch (IOException e) {
            throw new IOException("Erro ao salvar a imagem: " + e.getMessage());
        }

        return image;
    }

    public ResponseEntity<byte[]> getFirstImageByPostId(@PathVariable Long postId, Authentication auth) throws java.io.IOException {
        userRepository.findByEmail(auth.getName()).orElseThrow(() -> new UsernameNotFoundException(auth.getName()));
        try{
            Post post = postRepository.getPostById(postId);
            List<Images> images = post.getImages();

            Images image = images.getFirst();

            File file = new File(image.getFilepath());
            byte[] imageBytes = Files.readAllBytes(file.toPath());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentLength(imageBytes.length);

            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (ResponseStatusException e) {
            throw new IOException("Erro ao buscar imagem: " + e.getMessage());
        }
    }

    public List<ImageResponse> getAllImagesByPostId(@PathVariable Long postId, Authentication auth) throws IOException {
        String email = auth.getName();
        userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(email));
        Post post = postRepository.findById(postId).orElseThrow(() -> new UsernameNotFoundException(auth.getName()));
        return post.getImages()
                .stream()
                .map(img -> new ImageResponse(img.getId(), img.getFilename(), img.getFilepath(), img.getContentType()))
                .toList();
    }

    public ResponseEntity<byte[]> getImageById(@PathVariable Long imageId, Authentication auth) throws IOException, java.io.IOException {
        String email = auth.getName();
        userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(email));
        Images image = imageRepository.findById(imageId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Imagem não encontrada"));

        File file = new File(image.getFilepath());
        if (!file.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo não encontrado");
        }

        byte[] imageBytes = Files.readAllBytes(file.toPath());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(image.getContentType()));
        headers.setContentLength(imageBytes.length);

        return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
    }
}
