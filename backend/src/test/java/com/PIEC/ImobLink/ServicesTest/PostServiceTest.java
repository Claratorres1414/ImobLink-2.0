package com.PIEC.ImobLink.ServicesTest;

import Role.Role;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.*;
import com.PIEC.ImobLink.Services.ImageService;
import com.PIEC.ImobLink.Services.PostService;
import com.PIEC.ImobLink.Util.FavsLimitedHeap;
import com.PIEC.ImobLink.Util.LikesLimitedHeap;
import com.PIEC.ImobLink.Util.ViewsLimitedHeap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
public class PostServiceTest {
    @Mock private PostRepository postRepository;
    @Mock private UserRepository userRepository;
    @Mock private ImageService imageService;
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

        post = new Post();
        post.setType("aluguel");
        post.setDescription("aaaaaaaaa");
        post.setAvenue("aa");
        post.setNumber("1545");
        post.setStreet("street");
        post.setId(80L);
        post.setPrice(5000);
        post.setUser(user);
        auth = new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword());
    }
}
