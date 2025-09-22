package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.PromoteRequest;
import com.PIEC.ImobLink.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;

    @PostMapping("/promote")
    public ResponseEntity<?> promoteUser(@RequestBody PromoteRequest request) {
        try{
            userService.promoteUser(request.getEmail());
        }catch (Exception e){
            System.out.println(e.getMessage());
        }
        return ResponseEntity.ok("Usuário promovido a ADMIN com sucecsso!");
    }
}
