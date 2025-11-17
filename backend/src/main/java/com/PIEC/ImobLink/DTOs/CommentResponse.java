package com.PIEC.ImobLink.DTOs;

import com.PIEC.ImobLink.Entitys.Comment;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private Long userId;
    private Long authorId;
    private Long postId;

    public CommentResponse(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
        this.userId = comment.getUser().getId();
        this.authorId = comment.getAuthor().getId();
        if (comment.getPost() != null) {
            this.postId = comment.getPost().getId();
        }
    }
}
