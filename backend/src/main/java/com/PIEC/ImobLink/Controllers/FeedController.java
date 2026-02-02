package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.Response.ApiResponse;
import com.PIEC.ImobLink.Response.ResponseUtil;
import com.PIEC.ImobLink.Services.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
@Tag(name = "Feed", description = "Carregar posts")
public class FeedController {
    private final PostService postService;

    @Operation(
            summary = "Listar posts em ordem cronológica",
            description = "Apresenta a lista de posts no formato de um feed"
    )
    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponse>>> getFeed() {
        return ResponseUtil.ok(
                "Feed buscado com sucesso",
                postService.getFeed()
        );
    }
}
