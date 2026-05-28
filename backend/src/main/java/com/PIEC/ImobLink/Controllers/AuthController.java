package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.AuthResponse;
import com.PIEC.ImobLink.DTOs.LoginRequest;
import com.PIEC.ImobLink.DTOs.RegisterRequest;
import com.PIEC.ImobLink.Response.ApiResponse;
import com.PIEC.ImobLink.Response.ResponseUtil;
import com.PIEC.ImobLink.Services.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Operações de login e cadastro")
public class AuthController {
    private final AuthenticationService authenticationService;

    @Operation(
            summary = "Acessar sua conta",
            description = "Permite que o user faça login na aplicação"
    )
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        return ResponseUtil.ok(
                "Bem-vindo(a) à ImobLinnk",
                authenticationService.login(request)
        );
    }

    @Operation(
            summary = "Registrar nova conta",
            description = "Permite que o user crie uma conta na aplicação"
    )
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest request){
        return ResponseUtil.created(
                "Conta criada com sucesso",
                authenticationService.register(request)
        );
    }

    @Operation(
            summary = "Acessar conta de ADMIN na dashboard",
            description = "Permite que o ADMIN realize login na interface administrativa"
    )
    @PostMapping("/adm/login")
    public ResponseEntity<ApiResponse<AuthResponse>> admLogin(@RequestBody @Valid LoginRequest request) throws AccessDeniedException {
        return ResponseUtil.ok(
                "Bem-vindo, ADM",
                authenticationService.loginAdm(request)
        );
    }
}
