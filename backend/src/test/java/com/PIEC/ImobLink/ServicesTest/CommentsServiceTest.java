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

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CommentsServiceTest {
    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private RequireUserService requireUserService;

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
        author.setId(80L);
        author.setCpf("123456780");
        author.setPhoneNumber("546244525");
        author.setEmail("email0@email.com");
        author.setPassword("password");
        author.setName("pessoa");
        author.setRole(Role.USER);

        comment = new Comment();
        comment.setId(92L);
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
        when(requireUserService.requireUser(any())).thenReturn(author);

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
    void userNotFoundComment() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("User not found"));

        CommentRequest req = new CommentRequest(comment.getContent());
        Authentication authFake = new UsernamePasswordAuthenticationToken("email", author.getPassword());

        assertThrows(UsernameNotFoundException.class,
                () -> commentsService.comment(req, user.getId(), authFake));
    }

    @Test
    void targetUserNotFoundComment() {
        when(requireUserService.requireUser(any())).thenReturn(author);
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        CommentRequest req = new CommentRequest(comment.getContent());

        assertThrows(NoSuchElementException.class,
                () -> commentsService.comment(req, 999L, auth));
    }

    @Test
    void commentAtPost() {
        when(requireUserService.requireUser(any())).thenReturn(author);

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
    void userNotFoundCommentPost() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("User not found"));

        CommentRequest req = new CommentRequest(comment.getContent());
        Authentication authFake = new UsernamePasswordAuthenticationToken("email", author.getPassword());

        assertThrows(UsernameNotFoundException.class,
                () -> commentsService.commentPost(req, post.getId(), authFake));
    }

    @Test
    void postNotFoundCommentPost() {
        when(requireUserService.requireUser(any())).thenReturn(author);
        when(postRepository.findById(anyLong())).thenReturn(Optional.empty());

        CommentRequest req = new CommentRequest(comment.getContent());

        assertThrows(NoSuchElementException.class,
                () -> commentsService.commentPost(req, 999L, auth));
    }

    @Test
    void getCommentsByUserId() {
        when(requireUserService.requireUser(any())).thenReturn(author);

        when(commentRepository.findAllByUserIdOrderByCreatedAtDesc(anyLong()))
                .thenReturn(List.of(comment));

        List<CommentResponse> comments = commentsService.getCommentsByUserId(user.getId(), auth);
        assertEquals(1, comments.size());
        assertEquals(comment.getContent(), comments.getFirst().getContent());
    }

    @Test
    void userNotFoundGetCommentsByUserId() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("User not found"));

        Authentication authFake = new UsernamePasswordAuthenticationToken("email", author.getPassword());

        assertThrows(UsernameNotFoundException.class,
                () -> commentsService.getCommentsByUserId(user.getId(), authFake));
    }

    @Test
    void getCommentsByPostId() {
        when(requireUserService.requireUser(any())).thenReturn(author);

        when(commentRepository.findAllByPostIdOrderByCreatedAtDesc(anyLong()))
                .thenReturn(List.of(comment));

        comment.setPost(post);
        List<CommentResponse> comments = commentsService.getCommentsByPostId(post.getId(), auth);

        assertEquals(1, comments.size());
        assertEquals(comment.getContent(), comments.getFirst().getContent());
    }

    @Test
    void userNotFoundGetCommentsByPostId() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("User not found"));

        Authentication authFake = new UsernamePasswordAuthenticationToken("email", author.getPassword());

        assertThrows(UsernameNotFoundException.class,
                () -> commentsService.getCommentsByPostId(post.getId(), authFake));
    }

    @Test
    void deleteComment() throws AccessDeniedException {
        when(requireUserService.requireUser(any())).thenReturn(author);

        when(commentRepository.findById(anyLong()))
                .thenReturn(Optional.of(comment));

        commentsService.deleteComment(comment.getId(), auth);

        verify(commentRepository, times(1)).delete(any(Comment.class));
    }

    @Test
    void userNotFoundDeleteComment() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("User not found"));

        Authentication authFake = new UsernamePasswordAuthenticationToken("email", author.getPassword());

        assertThrows(UsernameNotFoundException.class,
                () -> commentsService.deleteComment(comment.getId(), authFake));
    }

    @Test
    void commentNotFoundDeleteComment() {
        when(requireUserService.requireUser(any())).thenReturn(author);
        when(commentRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class,
                () -> commentsService.deleteComment(999L, auth));
    }

    @Test
    void accessDeniedDeleteComment() {
        when(requireUserService.requireUser(any())).thenReturn(user);

        when(commentRepository.findById(anyLong()))
                .thenReturn(Optional.of(comment));

        Authentication authDenied = new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword());

        assertThrows(AccessDeniedException.class,
                () -> commentsService.deleteComment(comment.getId(), authDenied));
    }
}
