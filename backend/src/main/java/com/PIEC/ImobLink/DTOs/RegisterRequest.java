package com.PIEC.ImobLink.DTOs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @Schema(example = "000.000.000-00")
    private String cpf;
    @Schema(example = "(00) 90000-0000")
    private String phoneNumber;
    @Schema(example = "Fulano de tal")
    private String name;
    @Schema(example = "fulano@email.com")
    private String email;
    @Schema(example = "senha123")
    private String password;
}
