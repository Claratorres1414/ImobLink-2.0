package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.CommentRequest;
import com.PIEC.ImobLink.DTOs.CommentResponse;
import com.PIEC.ImobLink.Response.ApiResponse;
import com.PIEC.ImobLink.Response.ResponseUtil;
import com.PIEC.ImobLink.Services.CommentsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Realizar comentários em posts e perfis")
@SecurityRequirement(name = "BearerAuth")
public class CommentsController {
    private final CommentsService commentsService;

    @Operation(
            summary = "Comentar em perfil de um user",
            description = "Permite realizar comentários no perfil de um usuário"
    )
    @PostMapping("/comment/{userId}")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(@RequestBody CommentRequest commentRequest, @PathVariable Long userId, Authentication auth) {
        return ResponseUtil.created(
                "Comentário publicado com sucesso",
                commentsService.comment(commentRequest, userId, auth)
        );
    }

    @Operation(
            summary = "Comentar em um post",
            description = "Permite realizar comentários em um post"
    )
    @PostMapping("/comment/post/{postId}")
    public ResponseEntity<ApiResponse<CommentResponse>> addCommentPost(@RequestBody CommentRequest commentRequest, @PathVariable Long postId, Authentication auth) {
        return ResponseUtil.created(
                "Comentário publicado com sucesso",
                commentsService.commentPost(commentRequest, postId, auth)
        );
    }

    @Operation(
            summary = "Listar comentários por perfil",
            description = "Permite buscar a lista de comentários por perfil do usuário"
    )
    @GetMapping("/getComments/{userId}")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(@PathVariable Long userId, Authentication auth) {
        return ResponseUtil.ok(
                "Comentários buscados com sucesso",
                commentsService.getCommentsByUserId(userId, auth)
        );
    }

    @Operation(
            summary = "Listar comentários por post",
            description = "Permite buscar a lista de comentários por post"
    )
    @GetMapping("/getComments/post/{postId}")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getCommentsByPost(@PathVariable Long postId, Authentication auth) {
        return ResponseUtil.ok(
                "Comentários buscados com sucesso",
                commentsService.getCommentsByPostId(postId, auth)
        );
    }

    @Operation(
            summary = "Deletar comentário",
            description = "Permite deletar seu comentário"
    )
    @DeleteMapping("/deleteComment/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id, Authentication auth) throws AccessDeniedException {
        commentsService.deleteComment(id, auth);
        return ResponseUtil.noContent(
                "Comentário deletado com sucesso"
        );
    }
}
