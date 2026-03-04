package com.PIEC.ImobLink.ServicesTest;

import Role.Role;
import com.PIEC.ImobLink.Entitys.Images;
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
}