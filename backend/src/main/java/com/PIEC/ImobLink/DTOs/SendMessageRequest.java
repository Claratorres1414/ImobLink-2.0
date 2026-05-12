package com.PIEC.ImobLink.DTOs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendMessageRequest {

    @Schema(example = "Olá! Tenho interesse nesse imóvel.")
    private String content;

    @Schema(example = "12", nullable = true, description = "Id do post relacionado à mensagem, se houver")
    private Long postId;
}