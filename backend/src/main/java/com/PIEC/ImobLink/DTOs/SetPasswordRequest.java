package com.PIEC.ImobLink.DTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class SetPasswordRequest {
    String password;
    String newPassword;
}