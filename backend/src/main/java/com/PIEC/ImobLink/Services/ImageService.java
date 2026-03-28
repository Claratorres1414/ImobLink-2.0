package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.ImageResponse;
import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final FileStorageService fileStorageService;
    private final RequireUserService requireUserService;

    public Images saveImage(MultipartFile file, Authentication auth) throws IOException {
        User user = requireUserService.requireUser(auth);
        String filePath = fileStorageService.saveImage(file, user.getId());
        Images image = buildImageEntity(file, filePath, user);

        return imageRepository.save(image);
    }

    public Images saveProfileImage(MultipartFile file, Authentication auth) throws IOException {
        User user = requireUserService.requireUser(auth);
        String filePath = fileStorageService.saveUserProfileImage(file, user.getId());
        Images image = buildImageEntity(file, filePath, user);
        imageRepository.save(image);

        user.setImageProfileId(image.getId());
        userRepository.save(user);

        return image;
    }

    public byte[] getFirstImageByPostId(@PathVariable Long postId, Authentication auth) throws IOException {
        requireUserService.requireUser(auth);
        Post post = postRepository.getPostById(postId);
        List<Images> images = post.getImages();

        Images image = images.getFirst();

        return fileStorageService.readFile(image.getFilepath());
    }

    public List<ImageResponse> getAllImagesByPostId(@PathVariable Long postId, Authentication auth) {
        requireUserService.requireUser(auth);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new UsernameNotFoundException(auth.getName()));

        return post.getImages()
                .stream()
                .map(img -> new ImageResponse(img.getId(), img.getFilename(), img.getFilepath(), img.getContentType()))
                .toList();
    }

    public byte[] getImageById(@PathVariable Long imageId, Authentication auth) throws IOException {
        requireUserService.requireUser(auth);

        Images image = imageRepository.findById(imageId)
                .orElseThrow(() -> new NoSuchElementException(String.valueOf(imageId)));

        return fileStorageService.readFile(image.getFilepath());
    }

    private Images buildImageEntity(MultipartFile file, String filepath, User user) {
        Images image = new Images();
        image.setFilename(Paths.get(filepath).getFileName().toString());
        image.setFilepath(filepath);
        image.setContentType(file.getContentType());
        image.setUser(user);
        return image;
    }
}
