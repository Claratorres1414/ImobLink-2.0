package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.UserDetails;
import com.PIEC.ImobLink.Response.ApiResponse;
import com.PIEC.ImobLink.Response.ResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.PIEC.ImobLink.Services.FollowService;
import com.PIEC.ImobLink.Entitys.Follow;

import java.util.List;

@RestController
@RequestMapping("/follow")
@RequiredArgsConstructor
@Tag(name = "Follow", description = "Seguir perfis e listar perfis seguidos")
@SecurityRequirement(name = "BearerAuth")
public class FollowController {
    private final FollowService followService;

    @Operation(
            summary = "Seguir usuário",
            description = "Permite seguir o perfil de outro usuário"
    )
    @PostMapping("/{followingId}")
    public ResponseEntity<ApiResponse<Void>> followUser(@PathVariable Long followingId, Authentication auth) {
        followService.follow(auth, followingId);
        return ResponseUtil.noContent(
                "OK"
        );
    }

    @Operation(
            summary = "Deixar de seguir usuário",
            description = "Permite deixar de seguir o perfil de outro usuário"
    )
    @DeleteMapping("/unfollow/{followingId}")
    public ResponseEntity<ApiResponse<Void>> unfollowUser(@PathVariable Long followingId, Authentication auth) {
        followService.unfollow(auth, followingId);
        return ResponseUtil.noContent(
                "Unfollow OK"
        );
    }

    @Operation(
            summary = "Listar seus seguidores",
            description = "Permite visualizar os usuários que te seguem"
    )
    @GetMapping("/getFollowers")
    public ResponseEntity<ApiResponse<List<UserDetails>>> getFollowers(Authentication auth) {
        return ResponseUtil.ok(
                "Lista de seguidores buscada com sucesso",
                followService.getFollowers(auth)
        );
    }

    @Operation(
            summary = "Listar quem você segue",
            description = "Permite visualizar os usuários que você segue"
    )
    @GetMapping("/getFollowings")
    public ResponseEntity<ApiResponse<List<UserDetails>>> getFollowings(Authentication auth) {
        return ResponseUtil.ok(
                "Lista de usuários seguidos buscada com sucesso",
                followService.getFollowings(auth)
        );
    }

    @Operation(
            summary = "Listar seguidores de um usuário",
            description = "Permite visualizar os usuários seguem alguém"
    )
    @GetMapping("/getFollowers/{userId}")
    public ResponseEntity<ApiResponse<List<UserDetails>>> getFollowersById(@PathVariable Long userId) {
        return ResponseUtil.ok(
                "Lista de seguidores buscada com sucesso",
                followService.getFollowersById(userId)
        );
    }

    @Operation(
            summary = "Listar quem um usuário segue",
            description = "Permite visualizar os usuários que alguém segue"
    )
    @GetMapping("/getFollowings/{userId}")
    public ResponseEntity<ApiResponse<List<UserDetails>>> getFollowingsById(@PathVariable Long userId) {
        return ResponseUtil.ok(
                "Lista de usuários seguidos buscada com sucesso",
                followService.getFollowingsById(userId)
        );
    }

    @GetMapping("/check/{userId}")
    public ResponseEntity<ApiResponse<Boolean>> checkFollow(@PathVariable Long userId, Authentication auth) {
        return ResponseUtil.ok(
                "Verificado com sucesso",
                followService.check(userId, auth)
        );
    }
}
