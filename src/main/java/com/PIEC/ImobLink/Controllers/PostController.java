package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.PostRequest;
import com.PIEC.ImobLink.DTOs.PostResponse;
import jakarta.servlet.ServletException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.PIEC.ImobLink.Services.PostService;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createPost(@RequestParam("description") String description, @RequestParam("price") double price, @RequestParam("street") String street, @RequestParam("avenue") String avenue, @RequestParam("number") String number, @RequestParam("image")MultipartFile image, Authentication auth) throws IOException {
        System.out.println("Recebi a imagem: " + image.getOriginalFilename());
        String response = postService.createPost(image, description, price, street, avenue, number, auth);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-posts")
    public ResponseEntity<List<PostResponse>> getMyPosts(Authentication auth) {
        List<PostResponse> posts = postService.getPostsByUser(auth.getName());
        return ResponseEntity.ok(posts);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePost(@PathVariable Long id,  Authentication auth) throws ServletException {
        String response = postService.deletePost(id, auth);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/edit/{id}")
    public ResponseEntity<String> editPost(@PathVariable Long id, @RequestBody PostRequest newInfoPost, Authentication auth) throws ServletException {
        postService.editPost(id, newInfoPost, auth);
        return ResponseEntity.ok("Editado com sucesso");
    }
}
