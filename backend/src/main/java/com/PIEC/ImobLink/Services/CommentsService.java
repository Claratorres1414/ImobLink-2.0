package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.CommentRequest;
import com.PIEC.ImobLink.DTOs.CommentResponse;
import com.PIEC.ImobLink.Entitys.Comment;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.CommentRepository;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentsService {
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final RequireUserService requireUserService;

    public CommentResponse comment(CommentRequest req, Long userId, Authentication auth) {
        User author = requireUserService.requireUser(auth);

        LocalDateTime createdAt = LocalDateTime.now();

        Comment comment = new Comment();
        comment.setContent(req.getContent());
        comment.setCreatedAt(createdAt);
        comment.setUser(requireUserById(userId));
        comment.setAuthor(author);

        commentRepository.save(comment);
        return new CommentResponse(comment);
    }

    public CommentResponse commentPost(CommentRequest req, Long postId, Authentication auth) {
        User author = requireUserService.requireUser(auth);

        LocalDateTime createdAt = LocalDateTime.now();
        Post post = requirePostById(postId);

        Comment comment = new Comment();
        comment.setContent(req.getContent());
        comment.setCreatedAt(createdAt);
        comment.setUser(post.getUser());
        comment.setAuthor(author);
        comment.setPost(post);

        commentRepository.save(comment);
        return new CommentResponse(comment);
    }

    public List<CommentResponse> getCommentsByUserId(Long userId, Authentication auth) {
        requireUserService.requireUser(auth);

        return commentRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(CommentResponse::new)
                .toList();
    }

    public List<CommentResponse> getCommentsByPostId(Long postId, Authentication auth) {
        requireUserService.requireUser(auth);

        return commentRepository.findAllByPostIdOrderByCreatedAtDesc(postId)
                .stream()
                .map(CommentResponse::new)
                .toList();
    }

    public void deleteComment(Long id, Authentication auth) throws AccessDeniedException {
        User user = requireUserService.requireUser(auth);
        Comment comment = requireCommentById(id);

        if (Objects.equals(comment.getAuthor().getId(), user.getId())) {
            commentRepository.delete(comment);
            return;
        }
        log.warn("User {} attempted to delete comment {} without permission", user.getEmail(), id);
        throw new AccessDeniedException("Você não é autor deste comentário");
    }

    private User requireUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuário alvo não encontrado"));
    }

    private Post requirePostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post não encontrado"));
    }

    private Comment requireCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Comentário não encontrado"));
    }
}
