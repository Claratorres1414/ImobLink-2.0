package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.DTOs.PromoteRequest;
import com.PIEC.ImobLink.Response.ApiResponse;
import com.PIEC.ImobLink.Response.ResponseUtil;
import com.PIEC.ImobLink.Services.PostService;
import com.PIEC.ImobLink.Services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.ServletException;
import jakarta.validation.Valid;
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
    public ResponseEntity<ApiResponse<Void>> promoteUser(@RequestBody @Valid PromoteRequest request) {
        userService.promoteUser(request.getEmail());
        return ResponseUtil.ok(
                "Usuário promovido com sucesso",
                null
        );
    }

    @Operation(
            summary = "Visualizar posts favoritos do usuário",
            description = "Permite que o administrador visualize os posts favoritos de um user"
    )
    @GetMapping("/info/posts/favedPosts/{userId}")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getFavedPostsByUser(@PathVariable Long userId) throws ServletException {
        return ResponseUtil.ok(
                "Lista buscada com sucesso",
                postService.getFavedPostsByUserId(userId)
        );
    }

    @Operation(
            summary = "Visualizar número de posts favoritos do usuário",
            description = "Permite que o administrador visualize o número de posts favoritados de um user"
    )
    @GetMapping("/info/number/favedPosts/{userId}")
    public ResponseEntity<ApiResponse<Integer>> getNumberOfFavedPostsByUser(@PathVariable Long userId) {
        return ResponseUtil.ok(
                "Dados buscados com sucesso",
                userService.calcNumberOfFavedsByUserId(userId)
        );
    }

    @Operation(
            summary = "Visualizar número de vezes que os posts daquele usuário foram favoritados",
            description = "Permite que o administrador visualize o número de vezes que todos os posts de um user foram favoritados na plataforma"
    )
    @GetMapping("/info/number/allPosts/favedTimes/{userId}")
    public ResponseEntity<ApiResponse<Integer>> getFavedTimesByUser(@PathVariable Long userId) {
        return ResponseUtil.ok(
                "Dados buscados com sucesso",
                userService.calcAllPostsFavedTimesByUserId(userId)
        );
    }

    @Operation(
            summary = "Visualizar número de favoritos por post",
            description = "Permite que o administrador visualize o número de vezes que um post foi favoritado"
    )
    @GetMapping("/info/number/favedTimes/{postId}")
    public ResponseEntity<ApiResponse<Integer>> getFavedTimesByPost(@PathVariable Long postId) {
        return ResponseUtil.ok(
                "Dados buscados com sucesso",
                postService.getFavedTimesByPostId(postId)
        );
    }
}
