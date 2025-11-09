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

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentsService {
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public CommentResponse comment(CommentRequest req, Long userId, Authentication auth){
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime createdAt = LocalDateTime.now();

        Comment comment = new Comment();
        comment.setContent(req.getContent());
        comment.setCreatedAt(createdAt);
        comment.setUser(userRepository.findById(userId).get());
        comment.setAuthor(user);

        try{
            commentRepository.save(comment);
            return new CommentResponse(comment);
        }catch (Exception e){
            throw new RuntimeException("Comment creation failed");
        }
    }

    public CommentResponse commentPost(CommentRequest req, Long postId, Authentication auth){
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime createdAt = LocalDateTime.now();

        Comment comment = new Comment();
        comment.setContent(req.getContent());
        comment.setCreatedAt(createdAt);
        comment.setUser(postRepository.findById(postId).get().getUser());
        comment.setAuthor(user);
        comment.setPost(postRepository.findById(postId).get());

        try{
            commentRepository.save(comment);
            return new CommentResponse(comment);
        }catch (Exception e){
            throw new RuntimeException("Comment creation failed");
        }
    }

    public List<CommentResponse> getCommentsByUserId(Long userId, Authentication auth){
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return commentRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(CommentResponse :: new)
                .toList();
    }

    public List<CommentResponse> getCommentsByPostId(Long postId, Authentication auth){
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return commentRepository.findAllByPostIdOrderByCreatedAtDesc(postId)
                .stream()
                .map(CommentResponse :: new)
                .toList();
    }

    public boolean deleteComment(Long id, Authentication auth) {
        Comment comment;
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            comment = commentRepository.findById(id).get();
        } catch (Exception e) {
            System.out.println("Comment not found, error: " + e.getMessage());
            return false;
        }

        if (comment.getAuthor() == user){
            try{
                commentRepository.delete(comment);
                return true;
            } catch (Exception e) {
                System.out.println("Comment deletion failed, error " + e.getMessage());
                return false;
            }
        }
        System.out.println("Invalid credentials!");
        return false;
    }
}
