package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.CommentRequest;
import com.PIEC.ImobLink.DTOs.CommentResponse;
import com.PIEC.ImobLink.Entitys.Comment;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.CommentRepository;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentsService {
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final RequireUserService requireUserService;

    public CommentResponse comment(CommentRequest req, Long userId, Authentication auth){
        User user = requireUserService.requireUser(auth);

        LocalDateTime createdAt = LocalDateTime.now();

        Comment comment = new Comment();
        comment.setContent(req.getContent());
        comment.setCreatedAt(createdAt);
        comment.setUser(userRepository.findById(userId).get());
        comment.setAuthor(user);

        commentRepository.save(comment);
        return new CommentResponse(comment);
    }

    public CommentResponse commentPost(CommentRequest req, Long postId, Authentication auth){
        User user = requireUserService.requireUser(auth);

        LocalDateTime createdAt = LocalDateTime.now();

        Comment comment = new Comment();
        comment.setContent(req.getContent());
        comment.setCreatedAt(createdAt);
        comment.setUser(postRepository.findById(postId).get().getUser());
        comment.setAuthor(user);
        comment.setPost(postRepository.findById(postId).get());

        commentRepository.save(comment);
        return new CommentResponse(comment);
    }

    public List<CommentResponse> getCommentsByUserId(Long userId, Authentication auth){
        requireUserService.requireUser(auth);

        return commentRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(CommentResponse :: new)
                .toList();
    }

    public List<CommentResponse> getCommentsByPostId(Long postId, Authentication auth){
        requireUserService.requireUser(auth);

        return commentRepository.findAllByPostIdOrderByCreatedAtDesc(postId)
                .stream()
                .map(CommentResponse :: new)
                .toList();
    }

    public void deleteComment(Long id, Authentication auth) throws AccessDeniedException {
        Comment comment;
        User user = requireUserService.requireUser(auth);

        comment = commentRepository.findById(id).get();

        if (comment.getAuthor() == user){
            commentRepository.delete(comment);
            return;
        }
        System.out.println("Invalid credentials!");
        throw new AccessDeniedException("Você não é autor deste comentário");
    }
}
