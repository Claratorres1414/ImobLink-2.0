package com.PIEC.ImobLink.ServicesTest;

import Role.Role;
import com.PIEC.ImobLink.DTOs.ImageResponse;
import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Services.FileStorageService;
import com.PIEC.ImobLink.Services.ImageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ImageServiceTest {
    @Mock private ImageRepository imageRepository;
    @Mock private UserRepository userRepository;
    @Mock private PostRepository postRepository;
    @Mock private FileStorageService fileStorageService;
    @Mock private MultipartFile file;

    @InjectMocks private ImageService imageService;

    User user;
    Authentication auth;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(70L);
        user.setCpf("123456789");
        user.setPhoneNumber("546244526");
        user.setEmail("email092@email.com");
        user.setPassword("password");
        user.setName("name");
        user.setRole(Role.USER);

        auth = new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword());
    }

    @Test
    void shouldSaveImageSuccessfully() throws IOException {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));
        when(file.getContentType())
                .thenReturn("image/jpeg");
        when(fileStorageService.saveImage(any(), anyLong()))
                .thenReturn("fake/path/fake.jpeg");
        when(imageRepository.save(any(Images.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Images savedImage = imageService.saveImage(file, auth);

        assertNotNull(savedImage);
        assertEquals("image/jpeg", savedImage.getContentType());
        assertEquals(user, savedImage.getUser());
        assertTrue(savedImage.getFilename().contains("fake.jpeg"));

        verify(imageRepository, times(1)).save(any(Images.class));
    }

    @Test
    void shouldSaveUserProfileImageSuccessfully() throws IOException {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));
        when(fileStorageService.saveUserProfileImage(any(), anyLong()))
                .thenReturn("fake/path/fake.jpeg");
        when(file.getContentType())
                .thenReturn("image/jpeg");
        when(imageRepository.save(any(Images.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Images savedImage = imageService.saveProfileImage(file, auth);

        assertNotNull(savedImage);
        assertEquals("image/jpeg", savedImage.getContentType());
        assertEquals(user, savedImage.getUser());
        assertTrue(savedImage.getFilename().contains("fake.jpeg"));

        verify(imageRepository, times(1)).save(any(Images.class));
    }

    @Test
    void shouldReturnFirstImageBytesByPostId() throws IOException {

        // Arrange
        Images image = new Images();
        image.setFilepath("fake/path/image.jpeg");

        Post post = new Post();
        post.setId(1L);
        post.setImages(List.of(image));

        byte[] fakeBytes = "fake-image-content".getBytes();

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        when(postRepository.getPostById(anyLong()))
                .thenReturn(post);

        when(fileStorageService.readFile("fake/path/image.jpeg"))
                .thenReturn(fakeBytes);

        byte[] result = imageService.getFirstImageByPostId(1L, auth);

        assertNotNull(result);
        assertArrayEquals(fakeBytes, result);

        verify(fileStorageService).readFile("fake/path/image.jpeg");
    }

    @Test
    void shouldReturnAllImagesByPostId() {
        Images img1 = new Images();
        img1.setId(1L);
        img1.setFilename("img1.jpeg");
        img1.setFilepath("path/1");
        img1.setContentType("image/jpeg");

        Images img2 = new Images();
        img2.setId(2L);
        img2.setFilename("img2.jpeg");
        img2.setFilepath("path/2");
        img2.setContentType("image/jpeg");

        Post post = new Post();
        post.setImages(List.of(img1, img2));

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        when(postRepository.findById(anyLong()))
                .thenReturn(Optional.of(post));

        List<ImageResponse> response =
                imageService.getAllImagesByPostId(1L, auth);

        assertEquals(2, response.size());
        assertEquals("img1.jpeg", response.get(0).getFilename());
        assertEquals("img2.jpeg", response.get(1).getFilename());
    }

    @Test
    void shouldReturnImageBytesByImageId() throws IOException {

        Images image = new Images();
        image.setId(1L);
        image.setFilepath("fake/path/image.jpeg");

        byte[] fakeBytes = "fake-image".getBytes();

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        when(imageRepository.findById(anyLong()))
                .thenReturn(Optional.of(image));

        when(fileStorageService.readFile("fake/path/image.jpeg"))
                .thenReturn(fakeBytes);

        byte[] result = imageService.getImageById(1L, auth);

        assertArrayEquals(fakeBytes, result);

        verify(fileStorageService).readFile("fake/path/image.jpeg");
    }
}