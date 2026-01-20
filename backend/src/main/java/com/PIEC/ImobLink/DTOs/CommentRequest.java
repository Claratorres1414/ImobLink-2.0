package com.PIEC.ImobLink.DTOs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
@AllArgsConstructor
public class CommentRequest {
    @Schema(example = "comentário tal")
    private String content;
}
