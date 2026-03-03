package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.ImageResponse;
import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Response.ApiResponse;
import com.PIEC.ImobLink.Response.ResponseUtil;
import com.PIEC.ImobLink.Services.ImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Tag(name = "Images", description = "Operações relacionadas a carregamento, save e busca de imagens")
public class ImageController {
    private final ImageService imageService;

    @Operation(
            summary = "Salvar imagem",
            description = "Permite salvar endereços de imagens diretamente na db (mais utilizado para testes)"
    )
    @PostMapping
    public ResponseEntity<ApiResponse<Images>> saveImage(@RequestParam("image") MultipartFile image, Authentication auth) throws java.io.IOException {
        Images imageResponse = imageService.saveImage(image, auth);
        return ResponseUtil.created("Imagem salva com sucesso com caminho: " + imageResponse.getFilepath(),
                imageResponse
                );
    }

    @Operation(
            summary = "Buscar thumb por post",
            description = "Permite a busca da primeira imagem de um post"
    )
    @SecurityRequirement(name = "BearerAuth")
    @GetMapping("/{postId}/post/thumb")
    public ResponseEntity<ApiResponse<byte[]>> getFirstImage(@PathVariable Long postId, Authentication auth) throws IOException {
        return  ResponseUtil.ok(
                "Imagem buscada com sucesso",
                imageService.getFirstImageByPostId(postId, auth)
                );
    }

    @Operation(
            summary = "Buscar todas imagens por post",
            description = "Permite a busca de todas as imagens de um post"
    )
    @SecurityRequirement(name = "BearerAuth")
    @GetMapping("/{postId}/post/all")
    public ResponseEntity<ApiResponse<List<ImageResponse>>> getAllImagesByPostId(@PathVariable Long postId, Authentication auth) {
        return ResponseUtil.ok(
                "Imagens buscadas com sucesso",
                imageService.getAllImagesByPostId(postId, auth)
        );
    }

    @Operation(
            summary = "Carregar imagem",
            description = "Permite carregar uma imagem"
    )
    @SecurityRequirement(name = "BearerAuth")
    @GetMapping("/get/{imageId}")
    public ResponseEntity<ApiResponse<byte[]>> getImageById(@PathVariable Long imageId, Authentication auth) throws IOException {
        return ResponseUtil.ok(
                "Imagem buscada com sucesso",
                imageService.getImageById(imageId, auth));
    }
}
