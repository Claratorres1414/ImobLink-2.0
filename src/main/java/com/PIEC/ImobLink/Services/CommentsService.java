package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.CommentRequest;
import com.PIEC.ImobLink.DTOs.CommentResponse;
import com.PIEC.ImobLink.Entitys.Comment;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.CommentRepository;
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

    public CommentResponse comment(CommentRequest req, Long userId, Authentication auth){
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime createdAt = LocalDateTime.now();

        Comment comment = new Comment();
        comment.setContent(req.getContent());
        comment.setCreatedAt(createdAt);
        comment.setUserId(userId);
        comment.setAuthorId(user.getId());

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
}
