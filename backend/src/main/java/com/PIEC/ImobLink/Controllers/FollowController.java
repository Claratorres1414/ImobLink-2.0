package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.UserDetails;
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
@RequestMapping("/api/follow")
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
    public ResponseEntity<String> followUser(@PathVariable Long followingId, Authentication auth) {
        Follow follow = followService.follow(auth, followingId);
        if (follow == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok("Following " + followingId);
    }

    @Operation(
            summary = "Deixar de seguir usuário",
            description = "Permite deixar de seguir o perfil de outro usuário"
    )
    @DeleteMapping("/unfollow/{followingId}")
    public ResponseEntity<String> unfollowUser(@PathVariable Long followingId, Authentication auth) {
        followService.unfollow(auth, followingId);
        return ResponseEntity.ok("Unfollowing " + followingId);
    }

    @Operation(
            summary = "Listar seus seguidores",
            description = "Permite visualizar os usuários que te seguem"
    )
    @GetMapping("/getFollowers")
    public ResponseEntity<List<UserDetails>> getFollowers(Authentication auth) {
        return ResponseEntity.ok(followService.getFollowers(auth));
    }

    @Operation(
            summary = "Listar quem você segue",
            description = "Permite visualizar os usuários que você segue"
    )
    @GetMapping("/getFollowings")
    public ResponseEntity<List<UserDetails>> getFollowings(Authentication auth) {
        return ResponseEntity.ok(followService.getFollowings(auth));
    }

    @Operation(
            summary = "Listar seguidores de um usuário",
            description = "Permite visualizar os usuários seguem alguém"
    )
    @GetMapping("/getFollowers/{userId}")
    public ResponseEntity<List<UserDetails>> getFollowersById(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowersById(userId));
    }

    @Operation(
            summary = "Listar quem um usuário segue",
            description = "Permite visualizar os usuários que alguém segue"
    )
    @GetMapping("/getFollowings/{userId}")
    public ResponseEntity<List<UserDetails>> getFollowingsById(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowingsById(userId));
    }

}
