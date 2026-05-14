package com.PIEC.ImobLink.Services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    private final String FASTAPI_URL = "http://127.0.0.1:8000/recommend";

    // ----------------------------
    // 🔥 REGISTRAR INTERAÇÃO
    // ----------------------------
    public void registrarInteracao(Long userId, Long postId) {
        System.out.println("USER ID: " + userId);
        System.out.println("POST ID: " + postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("POST NÃO ENCONTRADO"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("USER NÃO ENCONTRADO"));

        if (post.getReacheds() == null) {
            throw new RuntimeException("REACHEDS NULL");
        }

        if (!post.getReacheds().contains(user)) {
            post.getReacheds().add(user);
        }

        postRepository.save(post);

        System.out.println("INTERAÇÃO SALVA COM SUCESSO");
    }

    public Boolean questionnaireStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("USER NÃO ENCONTRADO"));

        return user.getQuestionnaireCompleted();
    }
    
    public List<Post> recomendar(Long userId) {

        List<Post> posts = postRepository.findAll();
        User user = userRepository.findById(userId).orElseThrow();

        // pega interações do usuário (views)
        Set<Long> interagidos = posts.stream()
                .filter(p -> p.getReacheds().contains(user))
                .map(Post::getId)
                .collect(Collectors.toSet());

        // monta payload pro FastAPI
        Map<String, Object> payload = new HashMap<>();

        List<Map<String, Object>> postsPayload = posts.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("description", p.getDescription());
            map.put("type", p.getType());
            map.put("avenue", p.getAvenue());
            return map;
        }).toList();

        payload.put("posts", postsPayload);
        payload.put("user_interactions", interagidos);
        payload.put("user_id", userId);

        // chama FastAPI
        RestTemplate restTemplate = new RestTemplate();

        List<Map<String, Object>> response = restTemplate.postForObject(
                FASTAPI_URL,
                payload,
                List.class
        );

        if (response == null || response.isEmpty()) {
            return posts; // fallback
        }

        // ordena baseado no score
        Map<Long, Double> scoreMap = new HashMap<>();
        for (Map<String, Object> r : response) {
            Long id = Long.valueOf(r.get("id").toString());
            Double score = Double.valueOf(r.get("score").toString());
            scoreMap.put(id, score);
        }

        return posts.stream()
                .sorted((p1, p2) -> Double.compare(
                        scoreMap.getOrDefault(p2.getId(), 0.0),
                        scoreMap.getOrDefault(p1.getId(), 0.0)
                ))
                .collect(Collectors.toList());
    }
}