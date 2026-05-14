package com.PIEC.ImobLink.Controllers;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Services.RecommendationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserRepository userRepository;

    @PostMapping("/interact")
    public void interact(@RequestBody Map<String, Long> body, Authentication auth) {
        Long userId = getUserId(auth);
        Long postId = body.get("postId");
        
        recommendationService.registrarInteracao(userId, postId);
    }
    @GetMapping("/questionnaire/status")
    public Map<String, Boolean> questionnaireStatus(Authentication auth) {
        Long userId = getUserId(auth);

        return Map.of(
            "completed",
            recommendationService.questionnaireStatus(userId)
        );
    }
   
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