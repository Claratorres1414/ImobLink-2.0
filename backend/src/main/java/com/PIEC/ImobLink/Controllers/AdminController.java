package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.DTOs.PromoteRequest;
import com.PIEC.ImobLink.Services.PostService;
import com.PIEC.ImobLink.Services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.ServletException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Operações que só podem ser realizadas por ADMIN's e SUPERADMIN")
@SecurityRequirement(name = "BearerAuth")
public class AdminController {
    private final UserService userService;
    private final PostService postService;

    @Operation(
            summary = "Promover USER para ADMIN",
            description = "Permite que o SUPERADMIN ou um ADMIN promova um usuário comum a administrador da plataforma"
    )
    @PostMapping("/promote")
    public ResponseEntity<?> promoteUser(@RequestBody PromoteRequest request) {
        try{
            userService.promoteUser(request.getEmail());
        }catch (Exception e){
            System.out.println(e.getMessage());
        }
        return ResponseEntity.ok("Usuário promovido a ADMIN com sucecsso!");
    }

    @Operation(
            summary = "Visualizar posts favoritos do usuário",
            description = "Permite que o administrador visualize os posts favoritos de um user"
    )
    @GetMapping("/info/posts/favedPosts/{userId}")
    public ResponseEntity<List<PostResponse>> getFavedPostsByUser(@PathVariable Long userId) throws ServletException {
        List<PostResponse> favedPosts = postService.getFavedPostsByUserId(userId);
        return ResponseEntity.ok(favedPosts);
    }

    @Operation(
            summary = "Visualizar número de posts favoritos do usuário",
            description = "Permite que o administrador visualize o número de posts favoritados de um user"
    )
    @GetMapping("/info/number/favedPosts/{userId}")
    public ResponseEntity<Integer> getNumberOfFavedPostsByUser(@PathVariable Long userId) {
        Integer faveds = userService.calcNumberOfFavedsByUserId(userId);
        return ResponseEntity.ok(faveds);
    }

    @Operation(
            summary = "Visualizar número de vezes que os posts daquele usuário foram favoritados",
            description = "Permite que o administrador visualize o número de vezes que todos os posts de um user foram favoritados na plataforma"
    )
    @GetMapping("/info/number/allPosts/favedTimes/{userId}")
    public ResponseEntity<Integer> getFavedTimesByUser(@PathVariable Long userId) {
        Integer favedTimes = userService.calcAllPostsFavedTimesByUserId(userId);
        return ResponseEntity.ok(favedTimes);
    }

    @Operation(
            summary = "Visualizar número de favoritos por post",
            description = "Permite que o administrador visualize o número de vezes que um post foi favoritado"
    )
    @GetMapping("/info/number/favedTimes/{postId}")
    public ResponseEntity<Integer> getFavedTimesByPost(@PathVariable Long postId) {
        Integer favedTimes = postService.getFavedTimesByPostId(postId);
        return ResponseEntity.ok(favedTimes);
    }
}
