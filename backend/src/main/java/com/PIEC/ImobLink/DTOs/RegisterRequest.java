package com.PIEC.ImobLink.DTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String cpf;
    private String phoneNumber;
    private String name;
    private String email;
    private String password;
}
