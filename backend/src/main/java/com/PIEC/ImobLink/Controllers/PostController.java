package com.PIEC.ImobLink.Controllers;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.Arrays;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.PIEC.ImobLink.DTOs.PostRequest;
import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.DTOs.SetPostInfoRequest;
import com.PIEC.ImobLink.Response.ApiResponse;
import com.PIEC.ImobLink.Response.ResponseUtil;
import com.PIEC.ImobLink.Services.PostService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

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
    public ResponseEntity<ApiResponse<PostResponse>> createPost(@RequestPart PostRequest data, @RequestPart("images")MultipartFile[] images, Authentication auth) throws IOException {
        List<MultipartFile> imagesList = Arrays.asList(images);
        return ResponseUtil.created(
                "Post criado com sucesso",
                postService.createPost(imagesList, data.getDescription(), data.getPrice(), data.getStreet(), data.getAvenue(), data.getNumber(), data.getType(), auth)
        );
    }

    @Operation(
            summary = "Listar meus posts",
            description = "Serve uma lista de posts realizados por você"
    )
    @GetMapping("/my-posts")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getMyPosts(Authentication auth) {
        return ResponseUtil.ok(
                "Posts buscados com sucesso",
                postService.getPostsByUser(auth)
        );
    }

    @Operation(
            summary = "Listar meus favoritos",
            description = "Serve uma lista de posts favoritados por você"
    )
    @GetMapping("/my-favs")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getMyFavs(Authentication auth) {
        return ResponseUtil.ok(
                "Posts buscados com sucesso",
                postService.getUserFavs(auth)
        );
    }

    @Operation(
            summary = "Careegar detalhes do post",
            description = "Apresenta as informações de um post por completo"
    )
    @GetMapping("/getOne/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getOnePost(@PathVariable Long id, Authentication auth) {
        return ResponseUtil.ok(
                "Post buscado com sucesso",
                postService.getPostById(id, auth)
        );
    }

    @Operation(
            summary = "Visualizar número de likes",
            description = "Apresenta a contagem de likes de um post"
    )
    @GetMapping("/likedTimes/{id}")
    public ResponseEntity<ApiResponse<Integer>> likedTimes(@PathVariable Long id, Authentication auth) {
        return ResponseUtil.ok(
                "Likes buscados com sucesso",
                postService.getLikedTimesByPostId(id, auth)
        );
    }

    @Operation(
            summary = "Buscar por bairro",
            description = "Permite filtrar a busca de posts por bairro desejado"
    )
    @GetMapping("/search/avenue")
    public ResponseEntity<ApiResponse<List<PostResponse>>> searchByAvenue(@RequestParam("avenue") String avenue, Authentication auth) {
        return ResponseUtil.ok(
            "Posts buscados com sucesso",
            postService.searchPostByAvenue(avenue, auth)
        );
    }

    @Operation(
            summary = "Buscar por rua",
            description = "Permite filtrar a busca de posts por rua desejada"
    )
    @GetMapping("/search/street")
    public ResponseEntity<ApiResponse<List<PostResponse>>> searchByStreet(@RequestParam("street") String street, Authentication auth) {
        return ResponseUtil.ok(
                "Posts buscados com sucesso",
                postService.searchPostByStreet(street, auth)
        );
    }

    @Operation(
            summary = "Deletar post",
            description = "Permite deletar uma publicação realizada por você"
    )
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id,  Authentication auth) throws AccessDeniedException {
        postService.deletePost(id, auth);
        return ResponseUtil.noContent(
            "Post deletado com sucesso"
        );
    }

    @Operation(
            summary = "Remover imagem",
            description = "Permite remover uma imagem da sua publicação"
    )
    @DeleteMapping("/deleteImage/{id}/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long id, @PathVariable Long imageId, Authentication auth) throws AccessDeniedException {
        postService.removeImageByPostIdAndImageId(id, imageId, auth);
        return ResponseUtil.noContent(
                "Imagem removida com sucesso"
        );
    }

    @Operation(
            summary = "Adicionar imagem",
            description = "Permite adicionar uma imagem à sua publicação"
    )
    @PostMapping("/addImage/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> addImage(@PathVariable Long id, @RequestParam MultipartFile image, Authentication auth) throws IOException, AccessDeniedException {
        //Remover IO com refatoração do Image
        return ResponseUtil.ok(
                "Imagem adicionada com sucesso",
                postService.addImageToPost(id, image, auth)
        );
    }

    @Operation(
            summary = "Editar post",
            description = "Permite editar as informações da sua publicação"
    )
    @PatchMapping("/edit/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> editPost(@PathVariable Long id, @RequestBody SetPostInfoRequest newInfoPost, Authentication auth) throws AccessDeniedException {
        return ResponseUtil.ok(
                "Post editado com sucesso",
                postService.editPost(id, newInfoPost, auth)
        );
    }

    @Operation(
            summary = "Favoritar post",
            description = "Adiciona o post à sua lista de favoritos"
    )
    @PostMapping("/fav/{id}")
    public ResponseEntity<ApiResponse<Boolean>> favPost(@PathVariable Long id, Authentication auth) {
        return ResponseUtil.ok(
                "Post favoritado com sucesso",
                postService.favPost(id, auth)
        );
    }

    @Operation(
            summary = "Desfavoritar post",
            description = "Remove o post da sua lista de favoritos"
    )
    @DeleteMapping("/unfav/{id}")
    public ResponseEntity<ApiResponse<Boolean>> unfavPost(@PathVariable Long id, Authentication auth) {
        return ResponseUtil.ok(
                "Post desfavoritado com sucesso",
                postService.unfavPost(id, auth)
        );
    }

    @Operation(
            summary = "Curtir post",
            description = "Adiciona seu like ao post"
    )
    @PostMapping("/like/{id}")
    public ResponseEntity<ApiResponse<Boolean>> likePost(@PathVariable Long id, Authentication auth) {
        return ResponseUtil.ok(
                "Post curtido com sucesso",
                postService.likePost(id, auth)
        );
    }

    @Operation(
            summary = "Descurtir post",
            description = "Remove seu like do post"
    )
    @DeleteMapping("/unlike/{id}")
    public ResponseEntity<ApiResponse<Boolean>> unlikePost(@PathVariable Long id, Authentication auth) {
        return ResponseUtil.ok(
                "Post descurtido com sucesso",
                postService.unlikePost(id, auth)
        );
    }

    //Endpoint para admin, mas pode servir para qualquer usuário visualizar

    @Operation(
            summary = "Listar posts mais vistos",
            description = "Gera uma lista de posts mais visualizados da plataforma"
    )
    @GetMapping("/topPosts/views")
    public ResponseEntity<ApiResponse<List<String>>> topVieweds(Authentication auth) {
        return ResponseUtil.ok(
                "Lista buscada com sucesso",
                postService.topViewedPosts(auth)
        );
    }

    @Operation(
            summary = "Listar posts mais favoritados",
            description = "Gera uma lista de posts mais favoritados da plataforma"
    )
    @GetMapping("/topPosts/favs")
    public ResponseEntity<ApiResponse<List<String>>> topFaveds(Authentication auth) {
        return ResponseUtil.ok(
                "Lista buscada com sucesso",
                postService.topFavedPosts(auth)
        );
    }

    @Operation(
            summary = "Listar posts mais curtidos",
            description = "Gera uma lista de posts mais curtidos da plataforma"
    )
    @GetMapping("/topPosts/likes")
    public ResponseEntity<ApiResponse<List<String>>> topLikeds(Authentication auth) {
        return ResponseUtil.ok(
                "Lista buscada com sucesso",
                postService.topLikedPosts(auth)
        );
    }
}
