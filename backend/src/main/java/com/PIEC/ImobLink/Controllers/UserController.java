package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.DeleteProfileRequest;
import com.PIEC.ImobLink.DTOs.SetInfoRequest;
import com.PIEC.ImobLink.DTOs.SetPasswordRequest;
import com.PIEC.ImobLink.Services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "User", description = "Operações relacionadas ao perfil do usuário")
@SecurityRequirement(name = "BearerAuth")
public class UserController {
    private final UserService userService;

    @Operation(
            summary = "Testar identificação de ROLE",
            description = "Teste de acesso geral"
    )
    @GetMapping("/teste")
    public ResponseEntity<String> userAccess() {
        return ResponseEntity.ok("Acesso permitido para USER ou ADMIN");
    }

    @Operation(
            summary = "Testar identificação de ROLE (ADMIN)",
            description = "Teste de acesso para administradores"
    )
    @GetMapping("/admin/teste")
    public ResponseEntity<String> adminAccess() {
        return ResponseEntity.ok("Acesso permitido apenas para ADMIN");
    }

    @Operation(
            summary = "Visualizar informações da conta",
            description = "Permite visualizar as informações gerais da sua conta"
    )
    @GetMapping("/account")
    public ResponseEntity<UserDetails> loadAccountInfo(Authentication auth) {
        UserDetails response = userService.loadUser(auth);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Visualizar informações do usuário",
            description = "Permite visualizar as informações sobre outro usuário"
    )
    @GetMapping("/getAccount/{id}")
    public ResponseEntity<UserDetails> loadUserById(@PathVariable Long id, Authentication auth) {
        UserDetails response = userService.loadUserById(id, auth);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Listar perfis",
            description = "Gera uma lista dos usuários da plataforma"
    )
    @GetMapping("/getAll")
    public ResponseEntity<List<UserDetails>> getAll() {
        return ResponseEntity.ok(userService.loadAllUsers());
    }

    @Operation(
            summary = "Buscar usuário",
            description = "Permite pesquisar por um perfil de um usuário"
    )
    @GetMapping("/search")
    public ResponseEntity<List<UserDetails>> searchUsers(@RequestParam String search, Authentication auth) {
        return ResponseEntity.ok(userService.searchUsers(search, auth));
    }

    @Operation(
            summary = "Editar informações da conta",
            description = "Permite editar as informações do seu perfil"
    )
    @PatchMapping("/setInfo")
    public ResponseEntity<String> setInfo(@RequestBody SetInfoRequest setRequest, Authentication auth) {
        userService.setInfo(setRequest, auth);
        return ResponseEntity.ok("Informações atualizadas com sucesso!");
    }

    @Operation(
            summary = "Editar foto de perfil",
            description = "Permite alterar a sua foto de perfil"
    )
    @PatchMapping(value = "/setImageProfile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> setProfileImage(@RequestParam("image") MultipartFile profileImage, Authentication auth) throws IOException {
        String response = userService.setProfileImage(profileImage, auth);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Alterar senha",
            description = "Permite alterar a senha da sua conta"
    )
    @PatchMapping("/setPassword")
    public ResponseEntity<String> setPassword(@RequestBody SetPasswordRequest setRequest, Authentication auth) {
        Boolean response = userService.setPassword(setRequest, auth);
        if (response) {
            return ResponseEntity.ok("Senha atualizada com sucesso!");
        }
        return ResponseEntity.ok("Erro ao atualizar senha!");
    }

    @Operation(
            summary = "Deletar conta",
            description = "Permite deletar sua conta da plataforma"
    )
    @DeleteMapping("/deleteProfile")
    public ResponseEntity<String> deleteProfile(@RequestBody DeleteProfileRequest delRequest, Authentication auth) {
        Boolean response = userService.deleteProfile(delRequest, auth);
        if (response) {
            return ResponseEntity.ok("Usuário deletado com sucesso!");
        }
        return ResponseEntity.ok("Erro ao deletar usuario!");
    }

    @Operation(
            summary = "Visualizar número de favoritados",
            description = "Permite visualizar quantas vezes seus posts foram favoritados ao todo"
    )
    @GetMapping("/info/favedTimes")
    public ResponseEntity<Integer> favedTimes(Authentication auth) {
        int response = userService.calcFavedTimes(auth);
        return ResponseEntity.ok(response);
    }
}
