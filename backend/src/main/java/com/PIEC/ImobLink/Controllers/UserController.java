package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.DeleteProfileRequest;
import com.PIEC.ImobLink.DTOs.SetInfoRequest;
import com.PIEC.ImobLink.DTOs.SetPasswordRequest;
import com.PIEC.ImobLink.Response.ApiResponse;
import com.PIEC.ImobLink.Response.ResponseUtil;
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
import java.nio.file.AccessDeniedException;
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
    public ResponseEntity<ApiResponse<UserDetails>> loadAccountInfo(Authentication auth) {
        return ResponseUtil.ok(
                "Inormações carregadas com sucesso",
                userService.loadUser(auth)
        );
    }

    @Operation(
            summary = "Visualizar informações do usuário",
            description = "Permite visualizar as informações sobre outro usuário"
    )
    @GetMapping("/getAccount/{id}")
    public ResponseEntity<ApiResponse<UserDetails>> loadUserById(@PathVariable Long id, Authentication auth) {
        return ResponseUtil.ok(
                "Informações carregadas com sucesso",
                userService.loadUserById(id, auth)
        );
    }

    @Operation(
            summary = "Listar perfis",
            description = "Gera uma lista dos usuários da plataforma"
    )
    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<List<UserDetails>>> getAll() {
        return ResponseUtil.ok(
                "Usuários buscados com sucesso",
                userService.loadAllUsers()
        );
    }

    @Operation(
            summary = "Buscar usuário",
            description = "Permite pesquisar por um perfil de um usuário"
    )
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserDetails>>> searchUsers(@RequestParam String search, Authentication auth) {
        return ResponseUtil.ok(
                "Usuários buscados com sucesso",
                userService.searchUsers(search, auth)
        );
    }

    @Operation(
            summary = "Editar informações da conta",
            description = "Permite editar as informações do seu perfil"
    )
    @PatchMapping("/setInfo")
    public ResponseEntity<ApiResponse<Boolean>> setInfo(@RequestBody SetInfoRequest setRequest, Authentication auth) {
        return ResponseUtil.ok(
                "Informações setadas com sucesso",
                userService.setInfo(setRequest, auth)
        );
    }

    @Operation(
            summary = "Editar foto de perfil",
            description = "Permite alterar a sua foto de perfil"
    )
    @PatchMapping(value = "/setImageProfile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> setProfileImage(@RequestParam("image") MultipartFile profileImage, Authentication auth) throws IOException {
        return ResponseUtil.ok(
                "Imagem alterada com sucesso",
                userService.setProfileImage(profileImage, auth)
        );
    }

    @Operation(
            summary = "Alterar senha",
            description = "Permite alterar a senha da sua conta"
    )
    @PatchMapping("/setPassword")
    public ResponseEntity<ApiResponse<Boolean>> setPassword(@RequestBody SetPasswordRequest setRequest, Authentication auth) throws AccessDeniedException {
        return ResponseUtil.ok(
                "Senha alterada com sucesso",
                userService.setPassword(setRequest, auth)
        );
    }

    @Operation(
            summary = "Deletar conta",
            description = "Permite deletar sua conta da plataforma"
    )
    @DeleteMapping("/deleteProfile")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(@RequestBody DeleteProfileRequest delRequest, Authentication auth) throws AccessDeniedException {
        userService.deleteProfile(delRequest, auth);
        return ResponseUtil.noContent(
                "Perfil deletado com sucesso"
        );
    }

    @Operation(
            summary = "Visualizar número de favoritados",
            description = "Permite visualizar quantas vezes seus posts foram favoritados ao todo"
    )
    @GetMapping("/info/favedTimes")
    public ResponseEntity<ApiResponse<Integer>> favedTimes(Authentication auth) {
        return ResponseUtil.ok(
                "Número de favs calculado com sucesso",
                userService.calcFavedTimes(auth)
        );
    }
}
