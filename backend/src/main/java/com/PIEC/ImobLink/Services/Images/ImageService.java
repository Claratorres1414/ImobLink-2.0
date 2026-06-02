package com.PIEC.ImobLink.Services.Images;

import com.PIEC.ImobLink.DTOs.ImageResponse;
import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Exceptions.ResourceNotFoundException;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Services.RequireUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final FileStorageService fileStorageService;
    private final RequireUserService requireUserService;

    public Images saveImage(MultipartFile file, Authentication auth) {
        User user = requireUserService.requireUser(auth);
        String filePath = fileStorageService.saveImage(file, user.getId());
        return imageRepository.save(buildImageEntity(file, filePath, user));
    }

    public Images saveProfileImage(MultipartFile file, Authentication auth) {
        User user = requireUserService.requireUser(auth);
        String filePath = fileStorageService.saveUserProfileImage(file, user.getId());
        Images image = imageRepository.save(buildImageEntity(file, filePath, user));

        user.setImageProfileId(image.getId());
        userRepository.save(user);

        return image;
    }

    public byte[] getFirstImageByPostId(Long postId, Authentication auth) {
        requireUserService.requireUser(auth);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", postId));

        Images image = post.getImages().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Imagem do post", postId));

        return fileStorageService.readFile(image.getFilepath());
    }

    public List<ImageResponse> getAllImagesByPostId(Long postId, Authentication auth) {
        requireUserService.requireUser(auth);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", postId));

        return post.getImages().stream()
                .map(img -> new ImageResponse(img.getId(), img.getFilename(), img.getFilepath(), img.getContentType()))
                .toList();
    }

    public byte[] getImageById(Long imageId, Authentication auth) {
        requireUserService.requireUser(auth);

        Images image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagem", imageId));

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