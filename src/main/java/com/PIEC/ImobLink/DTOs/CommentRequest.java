package com.PIEC.ImobLink.DTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
@AllArgsConstructor
public class CommentRequest {
    private String content;
    private LocalDateTime createdAt;
    private Long userId;
}
