package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.SetInfoRequest;
import com.PIEC.ImobLink.Services.CustomUserDetailsService;
import com.PIEC.ImobLink.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.PIEC.ImobLink.DTOs.UserDetails;

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
    public void setBio(@RequestBody SetInfoRequest setRequest, Authentication authentication) {
        String email = authentication.getName();
        userService.setBio(setRequest.getBio(), email);
    }
}
