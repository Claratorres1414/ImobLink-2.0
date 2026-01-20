package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.AuthResponse;
import com.PIEC.ImobLink.DTOs.LoginRequest;
import com.PIEC.ImobLink.DTOs.RegisterRequest;
import com.PIEC.ImobLink.Services.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Operações de login e cadastro")
public class AuthController {
    private final AuthenticationService authenticationService;

    @Operation(
            summary = "Acessar sua conta",
            description = "Permite que o user faça login na aplicação"
    )
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try{
            AuthResponse response = authenticationService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @Operation(
            summary = "Registrar nova conta",
            description = "Permite que o user crie uma conta na aplicação"
    )
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request){
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @Operation(
            summary = "Acessar conta de ADMIN na dashboard",
            description = "Permite que o ADMIN realize login na interface administrativa"
    )
    @PostMapping("/adm/login")
    public ResponseEntity<AuthResponse> admLogin(@RequestBody LoginRequest request){
        return ResponseEntity.ok(authenticationService.loginAdm(request));
    }
}
