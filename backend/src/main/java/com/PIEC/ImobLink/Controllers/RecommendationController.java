package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Services.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserRepository userRepository;
    
    // ----------------------------
    // 👆 REGISTRAR INTERAÇÃO
    // ----------------------------
    @PostMapping("/interact")
    public void interact(@RequestBody Map<String, Long> body, Authentication auth) {
        Long userId = getUserId(auth);
        Long postId = body.get("postId");
        
        recommendationService.registrarInteracao(userId, postId);
    }

    // ----------------------------
    // 🤖 BUSCAR RECOMENDAÇÕES
    // ----------------------------
    @GetMapping("/recommendations")
    public List<PostResponse> getRecommendations(Authentication auth) {
        Long userId = getUserId(auth);

        List<Post> posts = recommendationService.recomendar(userId);

        return posts.stream().map(PostResponse::new).toList();
    }

    // ----------------------------
    // 🔑 PEGAR USER ID DO TOKEN
    // ----------------------------
    private Long getUserId(Authentication auth) {
        String email = auth.getName(); // vem do token
        return userRepository.findByEmail(email)
                .orElseThrow()
                .getId();
    }
}