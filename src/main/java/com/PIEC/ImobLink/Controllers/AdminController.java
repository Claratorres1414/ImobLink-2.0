package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.PromoteRequest;
import com.PIEC.ImobLink.Services.PostService;
import com.PIEC.ImobLink.Services.UserService;
import jakarta.persistence.Index;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final PostService postService;

    @PostMapping("/promote")
    public ResponseEntity<?> promoteUser(@RequestBody PromoteRequest request) {
        try{
            userService.promoteUser(request.getEmail());
        }catch (Exception e){
            System.out.println(e.getMessage());
        }
        return ResponseEntity.ok("Usuário promovido a ADMIN com sucecsso!");
    }

    @GetMapping("/info/number/favedPosts/{userId}")
    public ResponseEntity<Integer> getFavedPostsByUser(@PathVariable Long userId) {
        Integer faveds = userService.calcNumberOfFavedsByUserId(userId);
        return ResponseEntity.ok(faveds);
    }

    @GetMapping("/info/number/allPosts/favedTimes/{userId}")
    public ResponseEntity<Integer> getFavedTimesByUser(@PathVariable Long userId) {
        Integer favedTimes = userService.calcAllPostsFavedTimesByUserId(userId);
        return ResponseEntity.ok(favedTimes);
    }

    @GetMapping("/info/number/favedTimes/{postId}")
    public ResponseEntity<Integer> getFavedTimesByPost(@PathVariable Long postId) {
        Integer favedTimes = postService.getFavedTimesByPostId(postId);
        return ResponseEntity.ok(favedTimes);
    }
}
