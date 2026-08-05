package com.PIEC.ImobLink.Unit;

import Role.Role;
import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.DTOs.SetPostInfoRequest;
import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.Tag;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.*;
import com.PIEC.ImobLink.Services.Images.ImageService;
import com.PIEC.ImobLink.Services.PostService;
import com.PIEC.ImobLink.Services.RequireUserService;
import com.PIEC.ImobLink.Services.TagService;
import com.PIEC.ImobLink.Util.FavsLimitedHeap;
import com.PIEC.ImobLink.Util.LikesLimitedHeap;
import com.PIEC.ImobLink.Util.ViewsLimitedHeap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostServiceTest {
    @Mock private PostRepository postRepository;
    @Mock private RequireUserService requireUserService;
    @Mock private ImageService imageService;
    @Mock private TagService tagService;
    @Mock private FavsRepository favsRepository;
    @Mock private LikesRepository likesRepository;
    @Mock private ViewsLimitedHeap viewsHeap;
    @Mock private FavsLimitedHeap favsHeap;
    @Mock private LikesLimitedHeap likesHeap;
    @Mock private ImageRepository imageRepository;
    @Mock private MultipartFile mFile;

    @InjectMocks private PostService postService;

    User user;
    Authentication auth;
    Post post;
    List<MultipartFile> images;
    Images image;
    List<Tag> tags;
    List<String> tagsString;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(80L);
        user.setEmail("email");
        user.setPassword("password");
        user.setName("name");
        user.setPhoneNumber("5889527957");
        user.setCpf("123456789");
        user.setRole(Role.USER);

        tags = new ArrayList<>();
        tagsString = new ArrayList<>();

        tagsString.add("tag1");
        Tag tag = new Tag();
        tag.setName("tag1");
        tags.add(tag);

        post = new Post();
        post.setType("aluguel");
        post.setPropertyType("casa");
        post.setTags(tags);
        post.setDescription("aaaaaaaaa");
        post.setAvenue("aa");
        post.setNumber("1545");
        post.setStreet("street");
        post.setId(80L);
        post.setPrice(5000);
        post.setUser(user);
        auth = new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword());

        mFile = new MockMultipartFile("image", "img.jpg", "image/jpeg", "data".getBytes());

        image = new Images();
        image.setId(10L);
        image.setFilename("img.jpg");

        images = new ArrayList<>();
        images.add(mFile);
    }

    @Test
    void shouldCreateANewPost() throws IOException {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(tagService.getOrCreateTags(anyList()))
                .thenReturn(tags);

        when(imageService.saveImage(any(), any()))
                .thenReturn(image);

        when(postRepository.save(any(Post.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PostResponse response = postService.createPost(images, post.getDescription(), post.getPrice(), post.getStreet(), post.getAvenue(), post.getNumber(), post.getType(), post.getPropertyType(), tagsString, auth);

        assertNotNull(response);
        assertEquals(response.getUserId(), user.getId());

        verify(requireUserService, times(1)).requireUser(any());
        verify(postRepository, times(1)).save(any(Post.class));
    }

    @Test
    void shouldNotCreateANewPostWhenUserNotFound() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("User not found"));

        Authentication authFake = new UsernamePasswordAuthenticationToken(user.getEmail(), "a");

        assertThrows(UsernameNotFoundException.class,
                () -> postService.createPost(images, post.getDescription(), post.getPrice(), post.getStreet(), post.getAvenue(), post.getNumber(), post.getType(), post.getPropertyType(), tagsString, authFake));
    }

    @Test
    void shouldNotCreateANewPostWhenPostHasNoImages() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        List<MultipartFile> imagesFake = new ArrayList<>();

        assertThrows(IllegalArgumentException.class,
                () -> postService.createPost(imagesFake, post.getDescription(), post.getPrice(), post.getStreet(), post.getAvenue(), post.getNumber(), post.getType(), post.getPropertyType(), tagsString, auth));
    }

    @Test
    void shouldEditAPost() throws AccessDeniedException {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(postRepository.getPostById(anyLong()))
                .thenReturn(post);

        when(postRepository.save(any(Post.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SetPostInfoRequest info = new SetPostInfoRequest();
        info.setAvenue("avenida");

        PostResponse response = postService.editPost(post.getId(), info, auth);

        assertNotNull(response);
        assertEquals(response.getAvenue(), info.getAvenue());
        assertEquals(response.getDescription(), post.getDescription());

        verify(requireUserService, times(1)).requireUser(any());
        verify(postRepository, times(1)).getPostById(anyLong());
        verify(postRepository, times(1)).save(any(Post.class));
    }

    @Test
    void shouldNotEditAPostWhenUserNotFound() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("User not found"));

        Authentication authFake = new UsernamePasswordAuthenticationToken(user.getEmail(), "a");
        assertThrows(UsernameNotFoundException.class,
                () -> postService.editPost(post.getId(), new SetPostInfoRequest(), authFake));
    }

    @Test
    void shouldDeleteAPost() throws AccessDeniedException {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(postRepository.getPostById(anyLong()))
                .thenReturn(post);

        postService.deletePost(post.getId(), auth);

        verify(requireUserService, times(1)).requireUser(any());
        verify(postRepository, times(1)).delete(any(Post.class));
    }

    @Test
    void shouldNotDeleteAPostWhenUserNotFound() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("User not found"));

        Authentication authFake = new UsernamePasswordAuthenticationToken(user.getEmail(), "a");

        assertThrows(UsernameNotFoundException.class,
                () -> postService.deletePost(post.getId(), authFake));
    }

    @Test
    void shouldAddAnImageToPost() throws IOException {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(postRepository.getPostById(anyLong()))
                .thenReturn(post);

        when(imageService.saveImage(any(), any()))
                .thenReturn(image);

        when(postRepository.save(any(Post.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(imageRepository.save(any(Images.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PostResponse response = postService.addImageToPost(post.getId(), mFile, auth);

        assertNotNull(response);
    }

    @Test
    void shouldNotAddAnImageToPostWhenUserNotFound() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("User not found"));

        Authentication authFake = new UsernamePasswordAuthenticationToken(user.getEmail(), "a");

        assertThrows(UsernameNotFoundException.class,
                () -> postService.addImageToPost(post.getId(), mFile, authFake));
    }

    @Test
    void shouldNotAddAnImageWhenPostHasAlready10Images() {
        for(int i = 0; i < 10; i++) {
            post.addImage(image);
        }

        when(requireUserService.requireUser(any()))
                .thenReturn(user);
        when(postRepository.getPostById(anyLong()))
                .thenReturn(post);

        assertThrows(UnsupportedOperationException.class,
                () -> postService.addImageToPost(post.getId(), mFile, auth));
    }

    @Test
    void shouldRemoveAnImageFromPost() throws IOException {
        for(int i = 0; i < 10; i++) {
            image.setId(image.getId() + 10);
            post.addImage(image);
        }

        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(postRepository.getPostById(anyLong()))
                .thenReturn(post);

        postService.removeImageByPostIdAndImageId(post.getId(), image.getId(), auth);
        assertNotNull(post.getImages());
        verify(requireUserService, times(1)).requireUser(any());
        verify(postRepository, times(1)).getPostById(anyLong());
        verify(imageRepository, times(1)).deleteById(anyLong());
    }

    @Test
    void shouldNotRemoveAnImageFromPostWhenUserNotFound() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("User not found"));
        Authentication authFake = new UsernamePasswordAuthenticationToken(user.getEmail(), "a");

        assertThrows(UsernameNotFoundException.class,
                () -> postService.removeImageByPostIdAndImageId(post.getId(), image.getId(), authFake));
    }

    @Test
    void shouldNotRemoveAnImageWhenPostHasJustOneImage() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        when(postRepository.getPostById(anyLong()))
                .thenReturn(post);

        assertThrows(UnsupportedOperationException.class,
                () -> postService.removeImageByPostIdAndImageId(post.getId(), image.getId(), auth));
    }
}
