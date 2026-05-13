package com.PIEC.ImobLink.Services;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.DTOs.SetPostInfoRequest;
import com.PIEC.ImobLink.Entitys.Comment;
import com.PIEC.ImobLink.Entitys.Favs;
import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Entitys.Likes;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.FavsRepository;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
import com.PIEC.ImobLink.Repositorys.LikesRepository;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Util.FavsLimitedHeap;
import com.PIEC.ImobLink.Util.LikesLimitedHeap;
import com.PIEC.ImobLink.Util.ViewsLimitedHeap;

import Role.Role;
import lombok.RequiredArgsConstructor;
import com.PIEC.ImobLink.Entitys.Tag;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final RequireUserService requireUserService;
    private final ImageService imageService;
    private final FavsRepository favsRepository;
    private final LikesRepository likesRepository;
    private final ViewsLimitedHeap viewsHeap;
    private final FavsLimitedHeap favsHeap;
    private final LikesLimitedHeap likesHeap;
    private final ImageRepository imageRepository;
    private final UserRepository userRepository;
    private final TagService tagService;
    private boolean initializedV = false;
    private boolean initializedF = false;
    private boolean initializedL = false;

    public void initViewsHeap() {
        if (initializedV) {
            return;
        }
        if (tryPopulateRankingHeap(posts -> {
            viewsHeap.clear();
            posts.forEach(p -> viewsHeap.add(new PostResponse(p)));
        })) {
            initializedV = true;
        }
    }

    public void initFavsHeap() {
        if (initializedF) {
            return;
        }
        if (tryPopulateRankingHeap(posts -> {
            favsHeap.clear();
            posts.forEach(p -> favsHeap.add(new PostResponse(p)));
        })) {
            initializedF = true;
        }
    }

    public void initLikesHeap() {
        if (initializedL) {
            return;
        }
        if (tryPopulateRankingHeap(posts -> {
            likesHeap.clear();
            posts.forEach(p -> likesHeap.add(new PostResponse(p)));
        })) {
            initializedL = true;
        }
    }

    /**
     * Carrega todos os posts no heap informado. Retorna false se não houver posts (heap não marcado como inicializado).
     */
    private boolean tryPopulateRankingHeap(Consumer<List<Post>> fillHeap) {
        List<Post> posts = postRepository.findAll();
        if (posts.isEmpty()) {
            return false;
        }
        fillHeap.accept(posts);
        return true;
    }

    @Transactional
    public PostResponse createPost(List<MultipartFile> images, String description, double price, String street,
                                   String avenue, String number, String type, List<String> tags, Authentication auth) throws IOException {
        User user = requireUserService.requireUser(auth);

        if (images.size() > 10 || images.isEmpty()) {
            throw new IllegalArgumentException("Quantidade de imagens inválida, deve ter no mínimo 1 imagem e no máximo 10!");
        }

        Post post = new Post();
        post.setDescription(description);
        post.setPrice(price);
        post.setStreet(street);
        post.setAvenue(avenue);
        post.setUser(user);
        post.setNumber(number);
        post.setType(type);
        post.setWasUpdated(false);
        List<Tag> postTags = tagService.getOrCreateTags(tags);
        post.setTags(postTags);

        for (MultipartFile image : images) {
            Images savedImage = imageService.saveImage(image, auth);
            post.addImage(savedImage);
        }

        postRepository.save(post);
        for (Images image : post.getImages()) {
            image.setPost(post);
        }
        return new PostResponse(post);
    }

    public List<PostResponse> getFeed() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(PostResponse::new)
                .toList();
    }

    public List<PostResponse> getUserFavs(Authentication auth) {
        User user = requireUserService.requireUser(auth);
        List<PostResponse> faveds = new ArrayList<>();
        for (Favs fav : user.getFavs()) {
            Post post = fav.getPost();
            faveds.add(new PostResponse(post));
        }
        return faveds;
    }

    public List<PostResponse> searchPostByAvenue(String avenue, Authentication auth) {
        requireUserService.requireUser(auth);
        List<Post> responses = postRepository.findTop10ByAvenueContainingIgnoreCase(avenue);
        return responses.stream()
                .map(PostResponse::new)
                .toList();
    }

    public List<PostResponse> searchPostByStreet(String street, Authentication auth) {
        requireUserService.requireUser(auth);
        List<Post> responses = postRepository.findTop10ByStreetContainingIgnoreCase(street);
        return responses.stream()
                .map(PostResponse::new)
                .toList();
    }

    public PostResponse editPost(Long id, SetPostInfoRequest newInfoPost, Authentication auth) throws AccessDeniedException {
        User user = requireUserService.requireUser(auth);
        Post post = postRepository.getPostById(id);
        assertCanManagePost(post, user);
        if (newInfoPost.getDescription() != null) {
            post.setDescription(newInfoPost.getDescription());
        }
        if (newInfoPost.getPrice() != 0) {
            post.setPrice(newInfoPost.getPrice());
        }
        if (newInfoPost.getStreet() != null) {
            post.setStreet(newInfoPost.getStreet());
        }
        if (newInfoPost.getAvenue() != null) {
            post.setAvenue(newInfoPost.getAvenue());
        }
        if (newInfoPost.getNumber() != null) {
            post.setNumber(newInfoPost.getNumber());
        }
        if (newInfoPost.getType() != null) {
            post.setType(newInfoPost.getType());
        }
        if (newInfoPost.getTags() != null) {
            List<Tag> postTags = tagService.getOrCreateTags(newInfoPost.getTags());
            post.setTags(postTags);
        }

        post.setWasUpdated(true);
        postRepository.save(post);

        return new PostResponse(post);
    }

    public void deletePost(Long id, Authentication auth) throws AccessDeniedException {
        User user = requireUserService.requireUser(auth);
        Post post = get(id);
        assertCanManagePost(post, user);

        postRepository.delete(post);
        if (viewsHeap.remove(id)) {
            initializedV = false;
        }
        if (favsHeap.remove(id)) {
            initializedF = false;
        }
        if (likesHeap.remove(id)) {
            initializedL = false;
        }
    }

    public void removeImageByPostIdAndImageId(Long postId, Long imageId, Authentication auth) throws AccessDeniedException {
        User user = requireUserService.requireUser(auth);
        Post post = postRepository.getPostById(postId);
        assertCanManagePost(post, user);
        if (post.getImages().size() > 1) {
            post.removeImage(imageId);
            imageRepository.deleteById(imageId);
            return;
        }
        throw new UnsupportedOperationException("Quantidade de imagens mínima atingida");
    }

    public PostResponse addImageToPost(Long postId, MultipartFile image, Authentication auth) throws IOException, AccessDeniedException {
        User user = requireUserService.requireUser(auth);
        Post post = postRepository.getPostById(postId);
        assertCanManagePost(post, user);
        if (post.getImages().size() == 10) {
            throw new UnsupportedOperationException("Esse Post já possui o máximo de imagens permitidas!");
        }
        Images savedImage = imageService.saveImage(image, auth);
        post.addImage(savedImage);

        postRepository.save(post);
        savedImage.setPost(post);
        imageRepository.save(savedImage);

        return new PostResponse(post);
    }

    public List<PostResponse> getPostsByUser(Authentication auth) {
        User user = requireUserService.requireUser(auth);

        List<PostResponse> posts = user.getPosts().stream()
                .map(PostResponse::new)
                .toList();

        Set<Long> favPostIds = user.getFavs().stream()
                .map(f -> f.getPost().getId())
                .collect(Collectors.toSet());
        Set<Long> likedPostIds = user.getLikes().stream()
                .map(l -> l.getPost().getId())
                .collect(Collectors.toSet());

        for (PostResponse post : posts) {
            if (favPostIds.contains(post.getId())) {
                post.setWasFaved(true);
            }
            if (likedPostIds.contains(post.getId())) {
                post.setWasLiked(true);
            }
        }

        return posts;
    }

    public PostResponse getPostById(Long id, Authentication auth) {
        User user = requireUserService.requireUser(auth);

        Post post = postRepository.getPostById(id);
        post.setViews(post.getViews() + 1);
        viewsHeap.add(new PostResponse(post));
        List<User> reacheds = post.getReacheds();
        List<Post> vieweds = user.getPosts();
        boolean reached = reacheds.stream().anyMatch(u -> u.getEmail().equals(user.getEmail()));

        if (!reached) {
            reacheds.add(user);
            vieweds.add(post);
            post.setReacheds(reacheds);
        }

        postRepository.save(post);
        PostResponse postResponse = new PostResponse(post);
        applyEngagementFlags(post, postResponse, user.getEmail());
        for (Comment comment : post.getComments()) {
            postResponse.addComment(comment);
        }
        return postResponse;
    }

    private void applyEngagementFlags(Post post, PostResponse postResponse, String email) {
        for (Favs fav : post.getFavedTimes()) {
            if (fav.getUser().getEmail().equals(email)) {
                postResponse.setWasFaved(true);
                break;
            }
        }
        for (Likes like : post.getLikedTimes()) {
            if (like.getUser().getEmail().equals(email)) {
                postResponse.setWasLiked(true);
                break;
            }
        }
    }

    public Post get(Long id) {
        return postRepository.getPostById(id);
    }

    public Boolean favPost(Long id, Authentication auth) {
        User user = requireUserService.requireUser(auth);
        Post post = postRepository.getPostById(id);

        for (Favs favPosts : user.getFavs()) {
            if (favPosts.getPost().equals(post)) {
                return true;
            }
        }
        Favs favPost = new Favs();
        favPost.setUser(user);
        favPost.setAuthor(post.getUser());
        favPost.setPost(post);
        favsRepository.save(favPost);
        user.addFav(favPost);
        post.getFavedTimes().add(favPost);
        favsHeap.add(new PostResponse(post));
        return true;
    }

    public Boolean unfavPost(Long id, Authentication auth) {
        User user = requireUserService.requireUser(auth);
        Post post = postRepository.getPostById(id);

        for (Favs favPost : user.getFavs()) {
            if (favPost.getPost().equals(post)) {
                post.getFavedTimes().remove(favPost);
                user.getFavs().remove(favPost);
                favsRepository.delete(favPost);
                if (favsHeap.remove(id)) {
                    initializedF = false;
                }
                return true;
            }
        }

        return false;
    }

    public Boolean likePost(Long id, Authentication auth) {
        User user = requireUserService.requireUser(auth);
        Post post = postRepository.getPostById(id);

        for (Likes likedPosts : user.getLikes()) {
            if (likedPosts.getPost().equals(post)) {
                return true;
            }
        }
        Likes likedPost = new Likes();
        likedPost.setUser(user);
        likedPost.setAuthor(post.getUser());
        likedPost.setPost(post);
        likesRepository.save(likedPost);
        user.addLikes(likedPost);
        post.getLikedTimes().add(likedPost);
        likesHeap.add(new PostResponse(post));
        return true;
    }

    public Boolean unlikePost(Long id, Authentication auth) {
        User user = requireUserService.requireUser(auth);
        Post post = postRepository.getPostById(id);

        for (Likes likedPost : user.getLikes()) {
            if (likedPost.getPost().equals(post)) {
                post.getLikedTimes().remove(likedPost);
                user.getLikes().remove(likedPost);
                likesRepository.delete(likedPost);
                if (likesHeap.remove(id)) {
                    initializedL = false;
                }
                return true;
            }
        }
        return false;
    }

    public int getFavedTimesByPostId(Long postId) {
        Post post = postRepository.getPostById(postId);
        return post.getFavedTimes().size();
    }

    public int getLikedTimesByPostId(Long postId, Authentication auth) {
        requireUserService.requireUser(auth);
        Post post = postRepository.getPostById(postId);
        return post.getLikedTimes().size();
    }

    public List<PostResponse> getFavedPostsByUserId(Long userId) {
        User user = userRepository.getReferenceById(userId);
        List<PostResponse> faveds = new ArrayList<>();

        for (Favs fav : user.getFavs()) {
            Post post = fav.getPost();
            faveds.add(new PostResponse(post));
        }
        return faveds;
    }

    public List<String> topViewedPosts(Authentication auth) {
        requireUserService.requireUser(auth);

        initViewsHeap();
        List<String> response = new ArrayList<>();

        viewsHeap.getHeap().forEach(post -> response.add(
                "Post: " + post.getId()
                        + " | Views: " + post.getViews()
                        + " | Author: " + post.getUserId()));

        return response;
    }

    public List<String> topFavedPosts(Authentication auth) {
        requireUserService.requireUser(auth);

        initFavsHeap();
        List<String> response = new ArrayList<>();
        favsHeap.getHeap().forEach(post -> response.add(
                "Post " + post.getId()
                        + " | Faved Times: " + post.getFavedTimes()
                        + " | Author: " + post.getUserId()));
        return response;
    }

    public List<String> topLikedPosts(Authentication auth) {
        requireUserService.requireUser(auth);

        initLikesHeap();
        List<String> response = new ArrayList<>();
        likesHeap.getHeap().forEach(post -> response.add(
                "Post" + post.getId()
                        + " | Liked Times: " + post.getLikedTimes()
                        + " | Author: " + post.getUserId()));
        return response;
    }

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN;
    }

    private void assertCanManagePost(Post post, User user) throws AccessDeniedException {
        boolean isOwner = post.getUser() != null && post.getUser().getId().equals(user.getId());
        if (!isOwner && !isAdmin(user)) {
            throw new AccessDeniedException("Você não tem permissão para alterar este post");
        }
    }
    private Long getUserId(Authentication auth) {
        User user = requireUserService.requireUser(auth);
        return user.getId();
    }
    public List<PostResponse> getRecommendations(Authentication auth) {
        
        Long userId = getUserId(auth);

        List<PostResponse> allPosts = getFeed();
        List<PostResponse> favs = getUserFavs(auth);

        List<Long> interactedIds = favs.stream()
                .map(PostResponse::getId)
                .toList();

        if (interactedIds.isEmpty()) {
            return getFeed(); // ou topPosts
        }
        Map<String, Object> body = new HashMap<>();
        body.put("user_id", userId);
        body.put("posts", allPosts);
        body.put("user_interactions", interactedIds);

        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<List> response = restTemplate.postForEntity(
                "http://localhost:8000/recommend",
                body,
                List.class
        );

        List<Map<String, Object>> recs = response.getBody();

        List<Long> ids = recs.stream()
                .map(r -> Long.valueOf(r.get("id").toString()))
                .toList();

        // filtrar posts recomendados
        return allPosts.stream()
                .filter(p -> ids.contains(p.getId()))
                .toList();
    }

    public List<PostResponse> searchPostByTag(String tag, Authentication auth) {
        requireUserService.requireUser(auth);

        String normalizedTag = tagService.normalizeTagName(tag);

        if (normalizedTag.isBlank()) {
            throw new IllegalArgumentException("Tag inválida");
        }

        return postRepository.findByTagNormalizedName(normalizedTag)
                .stream()
                .map(PostResponse::new)
                .toList();
    }
}
