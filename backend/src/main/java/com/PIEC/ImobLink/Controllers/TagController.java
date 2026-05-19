package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.TagResponse;
import com.PIEC.ImobLink.Response.ApiResponse;
import com.PIEC.ImobLink.Response.ResponseUtil;
import com.PIEC.ImobLink.Services.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Tag(name = "Tags", description = "Operações relacionadas a tags de publicações")
@SecurityRequirement(name = "BearerAuth")
public class TagController {

    private final TagService tagService;

    @Operation(
            summary = "Buscar tags",
            description = "Busca tags existentes por aproximação do nome digitado"
    )
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TagResponse>>> searchTags(
            @RequestParam("query") String query,
            Authentication auth
    ) {
        return ResponseUtil.ok(
                "Tags buscadas com sucesso",
                tagService.searchTags(query)
        );
    }

    @Operation(
            summary = "Listar sugestões de tags",
            description = "Lista sugestões de tags já existentes na plataforma"
    )
    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<TagResponse>>> suggestions(Authentication auth) {
        return ResponseUtil.ok(
                "Sugestões de tags buscadas com sucesso",
                tagService.suggestions()
        );
    }
}