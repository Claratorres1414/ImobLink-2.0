package com.PIEC.ImobLink.DTOs;

import com.PIEC.ImobLink.Entitys.Comment;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class CommentResponse {
    private String content;
    private LocalDateTime createdAt;
    private Long userId;
    private Long authorId;

    public CommentResponse(Comment comment) {
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
        this.userId = comment.getUserId();
        this.authorId = comment.getAuthorId();
    }
}
