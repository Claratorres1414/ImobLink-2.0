package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.DeleteProfileRequest;
import com.PIEC.ImobLink.DTOs.SetInfoRequest;
import com.PIEC.ImobLink.DTOs.SetPasswordRequest;
import com.PIEC.ImobLink.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.PIEC.ImobLink.DTOs.UserDetails;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
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
    public ResponseEntity<UserDetails> loadAccountInfo(Authentication auth) {
        UserDetails response = userService.loadUser(auth);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<UserDetails>> getAll() {
        return ResponseEntity.ok(userService.loadAllUsers());
    }

    @PatchMapping("/setInfo")
    public ResponseEntity<String> setInfo(@RequestBody SetInfoRequest setRequest, Authentication auth) {
        userService.setInfo(setRequest, auth);
        return ResponseEntity.ok("Informações atualizadas com sucesso!");
    }

    @PatchMapping(value = "/setImageProfile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> setProfileImage(@RequestParam("image") MultipartFile profileImage, Authentication auth) throws IOException {
        String response = userService.setProfileImage(profileImage, auth);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/setPassword")
    public ResponseEntity<String> setPassword(@RequestBody SetPasswordRequest setRequest, Authentication auth) {
        Boolean response = userService.setPassword(setRequest, auth);
        if (response) {
            return ResponseEntity.ok("Senha atualizada com sucesso!");
        }
        return ResponseEntity.ok("Erro ao atualizar senha!");
    }

    @DeleteMapping("/deleteProfile")
    public ResponseEntity<String> deleteProfile(@RequestBody DeleteProfileRequest delRequest, Authentication auth) {
        Boolean response = userService.deleteProfile(delRequest, auth);
        if (response) {
            return ResponseEntity.ok("Usuário deletado com sucesso!");
        }
        return ResponseEntity.ok("Erro ao deletar usuario!");
    }
}
