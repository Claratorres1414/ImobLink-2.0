package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.ImageResponse;
import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Services.ImageService;
import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;

    @PostMapping
    public ResponseEntity<String> saveImage(@RequestParam("image") MultipartFile image, Authentication auth) throws IOException {
        try{
            Images imageResponse = imageService.saveImage(image, auth);
            if(imageResponse != null) {
                return ResponseEntity.ok("Imagem salvo com sucesso com caminho: " + imageResponse.getFilepath());
            }
            return ResponseEntity.badRequest().body("Erro ao salvar imagem");
        } catch (Exception e){
            throw new IOException("Erro ao salvar a imagem ou ao tentar autenticar o usuário: " + e.getMessage() + " tente novamente");
        }
    }

    @GetMapping("/{postId}/post/thumb")
    public ResponseEntity<byte[]> getFirstImage(@PathVariable Long postId, Authentication auth) throws IOException {
        try{
            return imageService.getFirstImageByPostId(postId, auth);
        } catch (Exception e){
            throw new IOException("Erro ao buscar imagem: " + e.getMessage());
        }
    }

    @GetMapping("/{postId}/post/all")
    public ResponseEntity<List<ImageResponse>> getAllImagesByPostId(@PathVariable Long postId, Authentication auth) throws IOException {
        return ResponseEntity.ok(imageService.getAllImagesByPostId(postId, auth));
    }

    @GetMapping("/get/{imageId}")
    public ResponseEntity<byte[]> getImageById(@PathVariable Long imageId, Authentication auth) throws IOException, java.io.IOException {
        return imageService.getImageById(imageId, auth);
    }
}
