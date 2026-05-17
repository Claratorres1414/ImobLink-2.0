package com.PIEC.ImobLink.Services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.PIEC.ImobLink.DTOs.PostRecommendationDTO;
import com.PIEC.ImobLink.DTOs.QuestionnaireRequest;
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

    public void saveQuestionnaire(Long userId, QuestionnaireRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("USER NÃO ENCONTRADO"));

        user.setObjective(request.getObjective());
        user.setPropertyType(request.getPropertyType());
        user.setPriceRange(request.getPriceRange());
        user.setQuestionnaireCompleted(true);

        userRepository.save(user);
    }

    public void registrarInteracao(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("POST NÃO ENCONTRADO"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("USER NÃO ENCONTRADO"));

        if (post.getReacheds() == null) {
            throw new RuntimeException("REACHEDS NULL");
        }

        if (!post.getReacheds().contains(user)) {
            post.getReacheds().add(user);
            postRepository.save(post);
        }
    }

    public Boolean questionnaireStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("USER NÃO ENCONTRADO"));

        return user.getQuestionnaireCompleted();
    }

    public List<PostRecommendationDTO> recomendar(Long userId) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("USER NÃO ENCONTRADO"));

        List<Post> posts = postRepository.findAll()
                .stream()
                .filter(post -> !post.getUser().getId().equals(user.getId()))
                .toList();

        Map<String, Object> userProfile = new HashMap<>();
        userProfile.put("objective", user.getObjective());
        userProfile.put("propertyType", user.getPropertyType());
        userProfile.put("priceRange", user.getPriceRange());

        Set<Long> interagidos = posts.stream()
            .filter(post ->
                (post.getReacheds() != null &&
                post.getReacheds().stream()
                    .anyMatch(u -> u.getId().equals(user.getId()))) ||

                (post.getLikedTimes() != null &&
                post.getLikedTimes().stream()
                    .anyMatch(like -> like.getUser().getId().equals(user.getId()))) ||

                (post.getFavedTimes() != null &&
                post.getFavedTimes().stream()
                    .anyMatch(fav -> fav.getUser().getId().equals(user.getId())))
            )
            .map(Post::getId)
            .collect(Collectors.toSet());
        Map<String, Object> payload = new HashMap<>();

        List<Map<String, Object>> postsPayload = posts.stream().map(post -> {
            Map<String, Object> map = new HashMap<>();

            map.put("id", post.getId());
            map.put("description", post.getDescription());
            map.put("type", post.getType());
            map.put("propertyType", post.getPropertyType());
            map.put("avenue", post.getAvenue());
            map.put("street", post.getStreet());
            map.put("price", post.getPrice());
            map.put("likedTimes",
                    post.getLikedTimes() != null ? post.getLikedTimes().size() : 0);
            map.put("views", post.getViews());

            return map;
        }).toList();

        payload.put("user_id", userId);
        payload.put("posts", postsPayload);
        payload.put("user_interactions", interagidos);
        payload.put("user_profile", userProfile);

        RestTemplate restTemplate = new RestTemplate();

        List<Map<String, Object>> response;

        try {
            response = restTemplate.postForObject(
                    FASTAPI_URL,
                    payload,
                    List.class
            );
        } catch (Exception e) {
            System.out.println("FastAPI indisponível: " + e.getMessage());
            return posts.stream()
                    .limit(10)
                    .map(post -> toDTO(post, user))
                    .toList();
        }

        Map<Long, Double> scoreMap = new HashMap<>();

        for (Map<String, Object> item : response) {
            Long id = Long.valueOf(item.get("id").toString());
            Double score = Double.valueOf(item.get("score").toString());
            scoreMap.put(id, score);
        }

        return posts.stream()
                
                .filter(post -> !interagidos.contains(post.getId()))
                .sorted((p1, p2) -> Double.compare(
                        scoreMap.getOrDefault(p2.getId(), 0.0),
                        scoreMap.getOrDefault(p1.getId(), 0.0)
                ))
                .limit(10)
                .map(post -> toDTO(post, user))
                .toList();
    }

    private PostRecommendationDTO toDTO(Post post, User user) {
        boolean wasLiked = post.getLikedTimes() != null &&
            post.getLikedTimes()
                .stream()
                .anyMatch(like -> like.getUser().getId().equals(user.getId()));

        return new PostRecommendationDTO(
            post.getId(),
            post.getUser().getId(),
            wasLiked,
            post.getDescription(),
            post.getPrice(),
            post.getStreet(),
            post.getAvenue(),
            post.getNumber(),
            post.getType(),
            post.getLikedTimes() != null ? post.getLikedTimes().size() : 0,
            post.getViews()
        );
    }
}