package com.PIEC.ImobLink.DTOs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @Schema(example = "seuemail@email.com")
    private String email;
    @Schema(example = "senha@123")
    private String password;
}
