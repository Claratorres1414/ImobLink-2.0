package com.PIEC.ImobLink.Services;

import java.util.ArrayList;
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
    private final RestTemplate restTemplate = new RestTemplate();

    // 📡 URLs apontando diretamente para o seu novo deploy unificado no Render
    private final String FASTAPI_BASE_URL = System.getenv("FASTAPI_IA_URL") != null 
            ? System.getenv("FASTAPI_IA_URL") 
            : "https://imoblink-ml-service.onrender.com";

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

    // =====================================================================
    // 🧠 NOVO: MÉTODO PARA MANDAR OS DADOS DO BANCO PARA TREINO NA IA
    // =====================================================================
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 4 * * *")
    public Map<String, String> executarTreinamentoCompleto() {
        System.out.println("⏰ [CRON] Iniciando rotina automática de treino da IA...");
        
        List<Post> todosOsPosts = postRepository.findAll();
        Map<String, String> resultados = new HashMap<>();

        // ---- 1. Treino de Popularidade ----
        List<Map<String, Object>> postsPayload = todosOsPosts.stream()
                .map(this::converterPostParaMap)
                .toList();

        try {
            String resPop = restTemplate.postForObject(
                FASTAPI_BASE_URL + "/treinar-popularidade", 
                postsPayload, 
                String.class
            );
            resultados.put("popularidade", resPop);
        } catch (Exception e) {
            resultados.put("popularidade", "Erro: " + e.getMessage());
        }

        // ---- 2. Treino do Recomendador Personalizado ----
        // Monta o histórico de pares (User Profile + Post) baseado em quem deu LIKE ou REACHED
        List<Map<String, Object>> recomendadorPayload = new ArrayList<>();

        for (Post post : todosOsPosts) {
            Map<String, Object> postMap = converterPostParaMap(post);

            // Coleta todos os usuários que interagiram com esse post específico
            List<User> usuariosInteragiram = new ArrayList<>();
            if (post.getReacheds() != null) usuariosInteragiram.addAll(post.getReacheds());
            
            // Se houver uma entidade ou mapeamento de likes, você pode adicionar aqui também
            if (post.getLikedTimes() != null) {
                post.getLikedTimes().forEach(like -> usuariosInteragiram.add(like.getUser()));
            }

            // Remove duplicados de usuários no mesmo post
            List<User> usuariosUnicos = usuariosInteragiram.stream().distinct().toList();

            for (User u : usuariosUnicos) {
                Map<String, Object> perfilMap = new HashMap<>();
                perfilMap.put("objective", u.getObjective());
                perfilMap.put("propertyType", u.getPropertyType());
                perfilMap.put("priceRange", u.getPriceRange());

                Map<String, Object> parInteracao = new HashMap<>();
                parInteracao.put("user_profile", perfilMap);
                parInteracao.put("post", postMap);

                recomendadorPayload.add(parInteracao);
            }
        }

        try {
            String resRec = restTemplate.postForObject(
                FASTAPI_BASE_URL + "/treinar-recomendador", 
                recomendadorPayload, 
                String.class
            );
            resultados.put("recomendador", resRec);
        } catch (Exception e) {
            resultados.put("recomendador", "Erro: " + e.getMessage());
        }

        return resultados;
    }

    // =====================================================================
    // 🎯 MOTOR DE RECOMENDAÇÃO (BUSCA DO FEED ORDENADO)
    // =====================================================================
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

        Set<Long> curtidos = posts.stream()
            .filter(post -> post.getLikedTimes() != null &&
                post.getLikedTimes().stream()
                    .anyMatch(like -> like.getUser().getId().equals(user.getId()))
            )
            .map(Post::getId)
            .collect(Collectors.toSet());

        Map<String, Object> payload = new HashMap<>();
        List<Map<String, Object>> postsPayload = posts.stream().map(this::converterPostParaMap).toList();

        payload.put("user_id", userId);
        payload.put("posts", postsPayload);
        payload.put("user_interactions", curtidos);
        payload.put("user_profile", userProfile);

        List<Map<String, Object>> response;

        try {
            response = restTemplate.postForObject(
                    FASTAPI_BASE_URL + "/recommend",
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
                .filter(post -> !curtidos.contains(post.getId()))
                .sorted((p1, p2) -> Double.compare(
                        scoreMap.getOrDefault(p2.getId(), 0.0),
                        scoreMap.getOrDefault(p1.getId(), 0.0)
                ))
                .limit(10)
                .map(post -> toDTO(post, user))
                .toList();
    }

    // 🛠️ Método utilitário para evitar código duplicado ao montar o JSON do Post
    private Map<String, Object> converterPostParaMap(Post post) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", post.getId());
        map.put("description", post.getDescription());
        map.put("type", post.getType());
        map.put("propertyType", post.getPropertyType());
        map.put("avenue", post.getAvenue());
        map.put("street", post.getStreet());
        map.put("price", post.getPrice());
        map.put("likedTimes", post.getLikedTimes() != null ? post.getLikedTimes().size() : 0);
        map.put("views", post.getViews());
        return map;
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