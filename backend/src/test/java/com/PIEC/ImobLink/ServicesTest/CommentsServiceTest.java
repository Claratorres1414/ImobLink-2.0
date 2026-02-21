package com.PIEC.ImobLink.ServicesTest;

import Role.Role;
import com.PIEC.ImobLink.DTOs.CommentRequest;
import com.PIEC.ImobLink.DTOs.CommentResponse;
import com.PIEC.ImobLink.Entitys.Comment;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.CommentRepository;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Services.CommentsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CommentsServiceTest {
    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private CommentsService commentsService;

    private Comment comment;
    private User user;
    private User author;
    private Authentication auth;
    private Post post;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(78L);
        user.setCpf("123456789");
        user.setPhoneNumber("546244526");
        user.setEmail("email092@email.com");
        user.setPassword("password");
        user.setName("name");
        user.setRole(Role.USER);

        author = new User();
        author.setCpf("123456780");
        author.setPhoneNumber("546244525");
        author.setEmail("email0@email.com");
        author.setPassword("password");
        author.setName("pessoa");
        author.setRole(Role.USER);

        comment = new Comment();
        comment.setContent("test");
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUser(user);
        comment.setAuthor(author);

        post = new Post();
        post.setId(78L);
        post.setNumber("15");
        post.setStreet("rua");
        post.setAvenue("bairro");
        post.setUser(user);
        post.setCreatedAt(LocalDateTime.now());
        post.setDescription("test");
        post.setPrice(1000);
        post.setType("aluguel");

        auth = new UsernamePasswordAuthenticationToken(author.getEmail(), author.getPassword());
    }

    @Test
    void commentAtUserProfile() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(author));

        when(commentRepository.save(any(Comment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(userRepository.findById(anyLong()))
                .thenReturn(Optional.of(user));

        CommentRequest req = new CommentRequest(comment.getContent());

        CommentResponse response = commentsService.comment(req, user.getId(), auth);
        assertEquals("test", response.getContent());

        verify(commentRepository, times(1)).save(any(Comment.class));
    }

    @Test
    void commentAtPost() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(author));

        when(postRepository.findById(anyLong()))
                .thenReturn(Optional.of(post));

        when(commentRepository.save(any(Comment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CommentRequest req = new CommentRequest(comment.getContent());
        CommentResponse response = commentsService.commentPost(req, post.getId(), auth);

        assertEquals("test", response.getContent());
        assertEquals(user.getId(), response.getUserId());

        verify(commentRepository, times(1)).save(any(Comment.class));
    }

    @Test
    void getCommentsByUserId() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        when(commentRepository.findAllByUserIdOrderByCreatedAtDesc(anyLong()))
                .thenReturn(List.of(comment));

        List<CommentResponse> comments = commentsService.getCommentsByUserId(user.getId(), auth);
        assertEquals(1, comments.size());
        assertEquals(comment.getContent(), comments.getFirst().getContent());
    }

    @Test
    void getCommentsByPostId() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        when(commentRepository.findAllByPostIdOrderByCreatedAtDesc(anyLong()))
                .thenReturn(List.of(comment));

        comment.setPost(post);
        List<CommentResponse> comments = commentsService.getCommentsByPostId(post.getId(), auth);

        assertEquals(1, comments.size());
        assertEquals(comment.getContent(), comments.getFirst().getContent());
    }
}