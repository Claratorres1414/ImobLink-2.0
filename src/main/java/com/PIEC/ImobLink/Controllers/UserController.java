package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.SetInfoRequest;
import com.PIEC.ImobLink.DTOs.SetPasswordRequest;
import com.PIEC.ImobLink.Services.CustomUserDetailsService;
import com.PIEC.ImobLink.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.PIEC.ImobLink.DTOs.UserDetails;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final CustomUserDetailsService customUserDetailsService;
    private final UserService userService;

    @GetMapping("/teste")
    public ResponseEntity<String> userAccess() {
        return ResponseEntity.ok("Acesso permitido para USER ou ADMIN");
    }

    @GetMapping("/admin/teste")
    public ResponseEntity<String> adminAccess() {
        return ResponseEntity.ok("Acesso permitido apenas para ADMIN");
    }

    @GetMapping("/account")
    public ResponseEntity<UserDetails> loadAccountInfo(Authentication authentication) {
        String email = authentication.getName();
        UserDetails response = userService.loadUser(email);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/setInfo")
    public ResponseEntity<String> setInfo(@RequestBody SetInfoRequest setRequest, Authentication authentication) {
        userService.setInfo(setRequest, authentication);
        return ResponseEntity.ok("Informações atualizadas com sucesso!");
    }

    @PatchMapping(value = "/setImageProfile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> setProfileImage(@RequestParam("image") MultipartFile profileImage, Authentication auth) throws IOException {
        String response = userService.setProfileImage(profileImage, auth);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/setPassword")
    public ResponseEntity<String> setPassword(@RequestBody SetPasswordRequest setRequest, Authentication authentication) {
        String email = authentication.getName();
        Boolean response = userService.setPassword(setRequest, email);
        if (response) {
            return ResponseEntity.ok("Senha atualizada com sucesso!");
        }
        return ResponseEntity.ok("Erro ao atualizar senha!");
    }
}
