package com.PIEC.ImobLink.DTOs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class SetPasswordRequest {
    @Schema(example = "senha123")
    String password;
    @Schema(example = "Senha@123")
    String newPassword;
}