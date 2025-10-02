package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.Services.ImageService;
import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;

    @PostMapping
    public ResponseEntity<String> saveImage(@RequestParam("image") MultipartFile image, Authentication auth) throws IOException {
        try{
            String imageResponse = imageService.saveImage(image, auth);
            return ResponseEntity.ok("Imagem salvo com sucesso: " + imageResponse);
        } catch (Exception e){
            throw new IOException("Erro ao salvar a imagem ou ao tentar autenticar o usuário: " + e.getMessage() + " tente novamente");
        }
    }

    @GetMapping("/{id}/post")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id, Authentication auth) throws IOException {
        try{
            return imageService.getImageByPostId(id, auth);
        } catch (Exception e){
            throw new IOException("Erro ao buscar imagem: " + e.getMessage());
        }
    }
}
