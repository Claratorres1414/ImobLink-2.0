package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.DTOs.SetPostInfoRequest;
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
public class PostController {
    private final PostService postService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createPost(@RequestParam("description") String description, @RequestParam("price") double price, @RequestParam("street") String street, @RequestParam("avenue") String avenue, @RequestParam("number") String number, @RequestParam("type") String type, @RequestParam("images")MultipartFile[] images, Authentication auth) throws IOException {
        List<MultipartFile> imagesList = Arrays.asList(images);
        String response = postService.createPost(imagesList, description, price, street, avenue, number, type, auth);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-posts")
    public ResponseEntity<List<PostResponse>> getMyPosts(Authentication auth) {
        List<PostResponse> posts = postService.getPostsByUser(auth.getName());
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/my-favs")
    public ResponseEntity<List<PostResponse>> getMyFavs(Authentication auth) throws ServletException {
        List<PostResponse> posts = postService.getUserFavs(auth);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/getOne/{id}")
    public ResponseEntity<PostResponse> getOnePost(@PathVariable Long id, Authentication auth) throws ServletException {
        PostResponse post = postService.getPostById(id, auth);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/likedTimes/{id}")
    public ResponseEntity<Integer> likedTimes(@PathVariable Long id, Authentication auth) throws ServletException {
        int likedTimes = postService.getLikedTimesByPostId(id, auth);
        return ResponseEntity.ok(likedTimes);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePost(@PathVariable Long id,  Authentication auth) throws ServletException {
        String response = postService.deletePost(id, auth);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/edit/{id}")
    public ResponseEntity<String> editPost(@PathVariable Long id, @RequestBody SetPostInfoRequest newInfoPost, Authentication auth) throws ServletException {
        Boolean response = postService.editPost(id, newInfoPost, auth);
        if (response) {
            return ResponseEntity.ok("Editado com sucesso");
        }
        return ResponseEntity.badRequest().body("Erro ao tentar editar o post");
    }

    @PostMapping("/fav/{id}")
    public ResponseEntity<String> favPost(@PathVariable Long id, Authentication auth) throws ServletException {
        Boolean response = postService.favPost(id, auth);
        if (response) {
            return ResponseEntity.ok("Favorito com sucesso");
        }
        return ResponseEntity.badRequest().body("Erro ao tentar favoritar o post");
    }

    @DeleteMapping("/unfav/{id}")
    public ResponseEntity<String> unfavPost(@PathVariable Long id, Authentication auth) throws ServletException {
        Boolean response = postService.unfavPost(id, auth);
        if (response) {
            return ResponseEntity.ok("Desfavorito com sucesso");
        }
        return ResponseEntity.badRequest().body("Erro ao tentar desfavoritar o post");
    }

    @PostMapping("/like/{id}")
    public ResponseEntity<String> likePost(@PathVariable Long id, Authentication auth) throws ServletException {
        Boolean response = postService.likePost(id, auth);
        if (response) {
            return ResponseEntity.ok("Curtido com sucesso");
        }
        return ResponseEntity.badRequest().body("Erro ao tentar curtir o post");
    }

    @DeleteMapping("/unlike/{id}")
    public ResponseEntity<String> unlikePost(@PathVariable Long id, Authentication auth) throws ServletException {
        Boolean response = postService.unlikePost(id, auth);
        if (response) {
            return ResponseEntity.ok("Like removido com sucesso");
        }
        return ResponseEntity.badRequest().body("Erro ao tentar remover seu like do post");
    }

    //Endpoint para admin, mas pode servir para qualquer usuário visualizar

    @GetMapping("/topPosts")
    public ResponseEntity<List<String>> topPosts(Authentication auth) {
        return ResponseEntity.ok(postService.topPosts(auth));
    }
}
