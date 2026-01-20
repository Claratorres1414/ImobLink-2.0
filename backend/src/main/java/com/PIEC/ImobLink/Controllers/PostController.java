package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.DTOs.SetPostInfoRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.ServletException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.PIEC.ImobLink.Services.PostService;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Operações relacionadas a posts")
@SecurityRequirement(name = "BearerAuth")
public class PostController {
    private final PostService postService;

    @Operation(
            summary = "Criar novo post",
            description = "Permite criar uma nova publicação com múltiplas imagens, descrição, preço, etc"
    )
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createPost(@RequestParam("description") String description, @RequestParam("price") double price, @RequestParam("street") String street, @RequestParam("avenue") String avenue, @RequestParam("number") String number, @RequestParam("type") String type, @RequestParam("images")MultipartFile[] images, Authentication auth) throws IOException {
        List<MultipartFile> imagesList = Arrays.asList(images);
        String response = postService.createPost(imagesList, description, price, street, avenue, number, type, auth);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Listar meus posts",
            description = "Serve uma lista de posts realizados por você"
    )
    @GetMapping("/my-posts")
    public ResponseEntity<List<PostResponse>> getMyPosts(Authentication auth) {
        List<PostResponse> posts = postService.getPostsByUser(auth.getName());
        return ResponseEntity.ok(posts);
    }

    @Operation(
            summary = "Listar meus favoritos",
            description = "Serve uma lista de posts favoritados por você"
    )
    @GetMapping("/my-favs")
    public ResponseEntity<List<PostResponse>> getMyFavs(Authentication auth) throws ServletException {
        List<PostResponse> posts = postService.getUserFavs(auth);
        return ResponseEntity.ok(posts);
    }

    @Operation(
            summary = "Careegar detalhes do post",
            description = "Apresenta as informações de um post por completo"
    )
    @GetMapping("/getOne/{id}")
    public ResponseEntity<PostResponse> getOnePost(@PathVariable Long id, Authentication auth) throws ServletException {
        PostResponse post = postService.getPostById(id, auth);
        return ResponseEntity.ok(post);
    }

    @Operation(
            summary = "Visualizar número de likes",
            description = "Apresenta a contagem de likes de um post"
    )
    @GetMapping("/likedTimes/{id}")
    public ResponseEntity<Integer> likedTimes(@PathVariable Long id, Authentication auth) throws ServletException {
        int likedTimes = postService.getLikedTimesByPostId(id, auth);
        return ResponseEntity.ok(likedTimes);
    }

    @Operation(
            summary = "Buscar por bairro",
            description = "Permite filtrar a busca de posts por bairro desejado"
    )
    @GetMapping("/search/avenue")
    public ResponseEntity<List<PostResponse>> searchByAvenue(@RequestParam("avenue") String avenue, Authentication auth) throws IOException {
        try {
            return postService.searchPostByAvenue(avenue, auth);
        } catch (Exception e) {
            throw new IOException("Erro ao tentar executar search: " + e.getMessage());
        }
    }

    @Operation(
            summary = "Buscar por rua",
            description = "Permite filtrar a busca de posts por rua desejada"
    )
    @GetMapping("/search/street")
    public ResponseEntity<List<PostResponse>> searchByStreet(@RequestParam("street") String street, Authentication auth) throws IOException {
        try{
            return postService.searchPostByStreet(street, auth);
        }  catch (Exception e) {
            throw new IOException("Erro ao tentar executar search: " + e.getMessage());
        }
    }

    @Operation(
            summary = "Deletar post",
            description = "Permite deletar uma publicação realizada por você"
    )
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePost(@PathVariable Long id,  Authentication auth) throws ServletException {
        String response = postService.deletePost(id, auth);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Remover imagem",
            description = "Permite remover uma imagem da sua publicação"
    )
    @DeleteMapping("/deleteImage/{id}/{imageId}")
    public ResponseEntity<String> deleteImage(@PathVariable Long id, @PathVariable Long imageId, Authentication auth) {
        String response = postService.removeImageByPostIdAndImageId(id, imageId, auth);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Adicionar imagem",
            description = "Permite adicionar uma imagem à sua publicação"
    )
    @PostMapping("/addImage/{id}")
    public ResponseEntity<String> addImage(@PathVariable Long id, @RequestParam MultipartFile image, Authentication auth) throws IOException {
        return postService.addImageToPost(id, image, auth);
    }

    @Operation(
            summary = "Editar post",
            description = "Permite editar as informações da sua publicação"
    )
    @PatchMapping("/edit/{id}")
    public ResponseEntity<String> editPost(@PathVariable Long id, @RequestBody SetPostInfoRequest newInfoPost, Authentication auth) throws ServletException {
        Boolean response = postService.editPost(id, newInfoPost, auth);
        if (response) {
            return ResponseEntity.ok("Editado com sucesso");
        }
        return ResponseEntity.badRequest().body("Erro ao tentar editar o post");
    }

    @Operation(
            summary = "Favoritar post",
            description = "Adiciona o post à sua lista de favoritos"
    )
    @PostMapping("/fav/{id}")
    public ResponseEntity<String> favPost(@PathVariable Long id, Authentication auth) throws ServletException {
        Boolean response = postService.favPost(id, auth);
        if (response) {
            return ResponseEntity.ok("Favorito com sucesso");
        }
        return ResponseEntity.badRequest().body("Erro ao tentar favoritar o post");
    }

    @Operation(
            summary = "Desfavoritar post",
            description = "Remove o post da sua lista de favoritos"
    )
    @DeleteMapping("/unfav/{id}")
    public ResponseEntity<String> unfavPost(@PathVariable Long id, Authentication auth) throws ServletException {
        Boolean response = postService.unfavPost(id, auth);
        if (response) {
            return ResponseEntity.ok("Desfavorito com sucesso");
        }
        return ResponseEntity.badRequest().body("Erro ao tentar desfavoritar o post");
    }

    @Operation(
            summary = "Curtir post",
            description = "Adiciona seu like ao post"
    )
    @PostMapping("/like/{id}")
    public ResponseEntity<String> likePost(@PathVariable Long id, Authentication auth) throws ServletException {
        Boolean response = postService.likePost(id, auth);
        if (response) {
            return ResponseEntity.ok("Curtido com sucesso");
        }
        return ResponseEntity.badRequest().body("Erro ao tentar curtir o post");
    }

    @Operation(
            summary = "Descurtir post",
            description = "Remove seu like do post"
    )
    @DeleteMapping("/unlike/{id}")
    public ResponseEntity<String> unlikePost(@PathVariable Long id, Authentication auth) throws ServletException {
        Boolean response = postService.unlikePost(id, auth);
        if (response) {
            return ResponseEntity.ok("Like removido com sucesso");
        }
        return ResponseEntity.badRequest().body("Erro ao tentar remover seu like do post");
    }

    //Endpoint para admin, mas pode servir para qualquer usuário visualizar

    @Operation(
            summary = "Listar posts mais vistos",
            description = "Gera uma lista de posts mais visualizados da plataforma"
    )
    @GetMapping("/topPosts/views")
    public ResponseEntity<List<String>> topVieweds(Authentication auth) {
        return ResponseEntity.ok(postService.topViewedPosts(auth));
    }

    @Operation(
            summary = "Listar posts mais favoritados",
            description = "Gera uma lista de posts mais favoritados da plataforma"
    )
    @GetMapping("/topPosts/favs")
    public ResponseEntity<List<String>> topFaveds(Authentication auth) {
        return ResponseEntity.ok(postService.topFavedPosts(auth));
    }

    @Operation(
            summary = "Listar posts mais curtidos",
            description = "Gera uma lista de posts mais curtidos da plataforma"
    )
    @GetMapping("/topPosts/likes")
    public ResponseEntity<List<String>> topLikeds(Authentication auth) {
        return ResponseEntity.ok(postService.topLikedPosts(auth));
    }
}
