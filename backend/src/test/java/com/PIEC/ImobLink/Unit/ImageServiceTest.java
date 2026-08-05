package com.PIEC.ImobLink.Unit;

import Role.Role;
import com.PIEC.ImobLink.DTOs.ImageResponse;
import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.DTOs.Images.StoredFile;
import com.PIEC.ImobLink.Exceptions.ResourceNotFoundException;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Services.Images.FileStorageService;
import com.PIEC.ImobLink.Services.Images.ImageService;
import com.PIEC.ImobLink.Services.RequireUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ImageServiceTest {
    @Mock private ImageRepository imageRepository;
    @Mock private UserRepository userRepository;
    @Mock private RequireUserService requireUserService;
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
    void shouldSaveImageSuccessfully() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);
        when(file.getContentType())
                .thenReturn("image/jpeg");
        when(fileStorageService.saveImage(any(), anyLong()))
                .thenReturn(new StoredFile(
                        "fake/path/fake.jpeg",
                        null
                ));
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
    void shouldThrowWhenUserNotFoundOnSaveImage() {
        when(requireUserService.requireUser(any()))
                .thenThrow(UsernameNotFoundException.class);

        assertThrows(UsernameNotFoundException.class,
                () -> imageService.saveImage(file, auth));
    }

    @Test
    void shouldPropagateIOExceptionOnSaveImage() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(fileStorageService.saveImage(any(), anyLong()))
                .thenThrow(new RuntimeException("Disk error"));

        assertThrows(RuntimeException.class,
                () -> imageService.saveImage(file, auth));
    }

    @Test
    void shouldSaveUserProfileImageSuccessfully() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);
        when(fileStorageService.saveUserProfileImage(any(), anyLong()))
                .thenReturn(new StoredFile(
                        "fake/path/fake.jpeg",
                        null
                ));
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
    void shouldUpdateUserProfileImageId() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(fileStorageService.saveUserProfileImage(any(), anyLong()))
                .thenReturn(new StoredFile(
                        "fake/path/fake.jpeg",
                        null
                ));
        when(file.getContentType())
                .thenReturn("image/jpeg");

        when(imageRepository.save(any(Images.class)))
                .thenAnswer(invocation -> {
                    Images img = invocation.getArgument(0);
                    img.setId(99L);
                    return img;
                });

        imageService.saveProfileImage(file, auth);

        assertEquals(99L, user.getImageProfileId());

        verify(userRepository).save(user);
    }

    @Test
    void shouldThrowWhenUserNotFoundOnSaveProfileImage() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("user not found"));

        assertThrows(UsernameNotFoundException.class,
                () -> imageService.saveProfileImage(file, auth));
    }

    @Test
    void shouldReturnFirstImageBytesByPostId() {
        Images image = new Images();
        image.setFilepath("fake/path/image.jpeg");

        Post post = new Post();
        post.setId(1L);
        post.setImages(List.of(image));

        byte[] fakeBytes = "fake-image-content".getBytes();

        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(postRepository.findById(anyLong()))
                .thenReturn(Optional.of(post));

        when(fileStorageService.readFile("fake/path/image.jpeg"))
                .thenReturn(fakeBytes);

        byte[] result = imageService.getFirstImageByPostId(1L, auth);

        assertNotNull(result);
        assertArrayEquals(fakeBytes, result);

        verify(fileStorageService).readFile("fake/path/image.jpeg");
    }

    @Test
    void shouldThrowWhenPostHasNoImages() {
        Post post = new Post();
        post.setImages(List.of());

        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(postRepository.findById(anyLong()))
                .thenReturn(Optional.of(post));

        assertThrows(ResourceNotFoundException.class,
                () -> imageService.getFirstImageByPostId(1L, auth));
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

        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(postRepository.findById(anyLong()))
                .thenReturn(Optional.of(post));

        List<ImageResponse> response =
                imageService.getAllImagesByPostId(1L, auth);

        assertEquals(2, response.size());
        assertEquals("img1.jpeg", response.get(0).getFilename());
        assertEquals("img2.jpeg", response.get(1).getFilename());
    }

    @Test
    void shouldThrowWhenPostNotFound() {

        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(postRepository.findById(anyLong()))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> imageService.getAllImagesByPostId(1L, auth));
    }

    @Test
    void shouldReturnImageBytesByImageId() {
        Images image = new Images();
        image.setId(1L);
        image.setFilepath("fake/path/image.jpeg");

        byte[] fakeBytes = "fake-image".getBytes();

        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(imageRepository.findById(anyLong()))
                .thenReturn(Optional.of(image));

        when(fileStorageService.readFile("fake/path/image.jpeg"))
                .thenReturn(fakeBytes);

        byte[] result = imageService.getImageById(1L, auth);

        assertArrayEquals(fakeBytes, result);

        verify(fileStorageService).readFile("fake/path/image.jpeg");
    }

    @Test
    void shouldThrowWhenImageNotFound() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(imageRepository.findById(anyLong()))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> imageService.getImageById(1L, auth));
    }

    @Test
    void shouldThrowWhenAuthenticatedUserNotFound() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("user not found"));

        assertThrows(UsernameNotFoundException.class,
                () -> imageService.getImageById(1L, auth));
    }

    @Test
    void shouldPropagateIOExceptionOnReadFile() {
        Images image = new Images();
        image.setFilepath("fake/path/image.jpeg");

        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(imageRepository.findById(anyLong()))
                .thenReturn(Optional.of(image));

        when(fileStorageService.readFile(anyString()))
                .thenThrow(new RuntimeException("Read error"));

        assertThrows(RuntimeException.class,
                () -> imageService.getImageById(1L, auth));
    }
}