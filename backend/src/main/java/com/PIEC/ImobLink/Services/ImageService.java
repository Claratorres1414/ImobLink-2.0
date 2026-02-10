package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.ImageResponse;
import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Response.ApiResponse;
import com.PIEC.ImobLink.Response.ResponseUtil;
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
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    //Remover exceptions de PostController e PostService relacionados assim que refatorado
    public Images saveImage(MultipartFile file, Authentication auth) throws java.io.IOException {
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

        imageRepository.save(image);

        return image;
    }

    public Images saveProfileImage(MultipartFile file, Authentication auth) throws java.io.IOException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        String folder = "uploads/users/" + user.getId() +"/profile";
        Files.createDirectories(Paths.get(folder));

        String filePath = folder + "/" + file.getOriginalFilename();
        Files.write(Paths.get(filePath), file.getBytes());

        Images image = new Images();
        image.setFilename(UUID.randomUUID() + "_" + file.getOriginalFilename());
        image.setFilepath(filePath);
        image.setContentType(file.getContentType());
        image.setUser(user);

        imageRepository.save(image);
        user.setImageProfileId(image.getId());
        userRepository.save(user);

        return image;
    }

    public ResponseEntity<byte[]> getFirstImageByPostId(@PathVariable Long postId, Authentication auth) throws java.io.IOException {
        userRepository.findByEmail(auth.getName()).orElseThrow(() -> new UsernameNotFoundException(auth.getName()));

        Post post = postRepository.getPostById(postId);
        List<Images> images = post.getImages();

        Images image = images.getFirst();

        File file = new File(image.getFilepath());
        byte[] imageBytes = Files.readAllBytes(file.toPath());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        headers.setContentLength(imageBytes.length);

        return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
    }

    public List<ImageResponse> getAllImagesByPostId(@PathVariable Long postId, Authentication auth) {
        String email = auth.getName();
        userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(email));
        Post post = postRepository.findById(postId).orElseThrow(() -> new UsernameNotFoundException(auth.getName()));
        return post.getImages()
                .stream()
                .map(img -> new ImageResponse(img.getId(), img.getFilename(), img.getFilepath(), img.getContentType()))
                .toList();
    }

    public ResponseEntity<byte[]> getImageById(@PathVariable Long imageId, Authentication auth) throws IOException {
        String email = auth.getName();
        userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(email));
        Images image = imageRepository.findById(imageId).orElseThrow(() -> new NoSuchElementException(String.valueOf(imageId)));

        File file = new File(image.getFilepath());
        if (!file.exists()) {
            throw new NoSuchElementException(String.valueOf(String.valueOf(file)));
        }

        byte[] imageBytes = Files.readAllBytes(file.toPath());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(image.getContentType()));
        headers.setContentLength(imageBytes.length);

        return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
    }
}
