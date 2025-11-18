package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.DTOs.SetPostInfoRequest;
import com.PIEC.ImobLink.Entitys.*;
import com.PIEC.ImobLink.Repositorys.FavsRepository;
import com.PIEC.ImobLink.Repositorys.LikesRepository;
import com.PIEC.ImobLink.Util.FavsLimitedHeap;
import com.PIEC.ImobLink.Util.LikesLimitedHeap;
import com.PIEC.ImobLink.Util.ViewsLimitedHeap;
import io.jsonwebtoken.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Getter
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ImageService imageService;
    private final FavsRepository favsRepository;
    private final LikesRepository likesRepository;
    private final ViewsLimitedHeap viewsHeap;
    private final FavsLimitedHeap favsHeap;
    private final LikesLimitedHeap likesHeap;
    private boolean initializedV = false;
    private boolean initializedF = false;
    private boolean initializedL = false;

    public void initViewsHeap() {
        if (initializedV) return;

        List<Post> posts = postRepository.findAll();
        if (!posts.isEmpty()) {
            viewsHeap.clear();
            for (Post post : posts) {
                viewsHeap.add(new PostResponse(post));
            }
            initializedV = true;
        }
        System.out.println("Heap de Views inicializado com sucesso");
    }

    public void initFavsHeap() {
        if (initializedF) return;

        List<Post> posts = postRepository.findAll();
        if (!posts.isEmpty()) {
            favsHeap.clear();
            for (Post post : posts) {
                favsHeap.add(new PostResponse(post));
            }
            initializedF = true;
        }
        System.out.println("Heap de Favs inicializado com sucesso");
    }

    public void initLikesHeap() {
        if (initializedL) return;

        List<Post> posts = postRepository.findAll();
        if (!posts.isEmpty()) {
            likesHeap.clear();
            for (Post post : posts) {
                likesHeap.add(new PostResponse(post));
            }
            initializedL = true;
        }
        System.out.println("Heap de Likes inicializado com sucesso");
    }

    @Transactional
    public String createPost(List<MultipartFile> images, String description, double price, String street, String avenue, String number, String type, Authentication auth) throws IOException, java.io.IOException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (images.size() > 10 || images.isEmpty()){
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

        for (MultipartFile image : images) {
            Images savedImage = imageService.saveImage(image,auth);
            post.addImage(savedImage);
        }

        try{
            postRepository.save(post);
            for(Images image: post.getImages()){
                image.setPost(post);
            }
            return "post created!";
        }catch (Exception e){
            return "post creation failed!";
        }
    }

    public List<PostResponse> getFeed() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(PostResponse::new)
                .toList();
    }

    public List<PostResponse> getUserFavs(Authentication auth) throws ServletException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<PostResponse> faveds = new ArrayList<>();
        try {
            for (Favs fav : user.getFavs()) {
                Post post = fav.getPost();
                faveds.add(new PostResponse(post));
            }
            return faveds;
        } catch (Exception e) {
            throw new ServletException("Erro ao obter os favoritos" + e.getMessage());
        }
    }

    public Boolean editPost(Long id, SetPostInfoRequest newInfoPost, Authentication auth) throws ServletException {
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            Post post = postRepository.getPostById(id);
            if (newInfoPost.getDescription() != null) {
                post.setDescription(newInfoPost.getDescription());
            }
            if (newInfoPost.getPrice() != 0){
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

            postRepository.save(post);
            return true;
        }catch (Exception e){
            throw new ServletException("Erro ao tentar editar publicação: " + e);
        }
    }

   public String deletePost(Long id, Authentication auth) throws IOException, ServletException {
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try{
            postRepository.delete(get(id));
            boolean viewsResp = viewsHeap.remove(id);
            boolean favsResp = favsHeap.remove(id);
            boolean likesResp = likesHeap.remove(id);
            if (viewsResp){
                initializedV = false;
            }
            if (favsResp){
                initializedF = false;
            }
            if (likesResp){
                initializedL = false;
            }
            return "post deleted!";
        } catch (Exception e){
            throw new ServletException("Erro ao excluir post: " + e);
        }
    }

    public List<PostResponse> getPostsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found " + email));

        List<PostResponse> posts = user.getPosts().stream()
                .map(PostResponse::new)
                .toList();

        List<Favs> favs = user.getFavs();
        List<Likes> likes = user.getLikes();

        for (PostResponse post : posts) {
            for (Favs fav : favs) {
                if (fav.getPost().getId().equals(post.getId())) {
                    post.setWasFaved(true);
                }
            }
            for (Likes like : likes) {
                if (like.getPost().getId().equals(post.getId())) {
                    post.setWasLiked(true);
                }
            }
        }

        return posts;
    }

    public PostResponse getPostById(Long id, Authentication auth) throws ServletException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found " + email));
        try {
            Post post = postRepository.getPostById(id);
            post.setViews(post.getViews() + 1);
            viewsHeap.add(new PostResponse(post));
            List<User> reacheds = post.getReacheds();
            List<Post> vieweds = user.getPosts();
            boolean reached = false;
            for (User u : reacheds) {
                if (u.getEmail().equals(email)) {
                    reached = true;
                    break;
                }
            }

            if (!reached) {
                reacheds.add(user);
                vieweds.add(post);
                post.setReacheds(reacheds);
            }

            postRepository.save(post);
            List<Favs> favs = post.getFavedTimes();
            List<Likes> likes = post.getLikedTimes();
            List<Comment> comments = post.getComments();
            PostResponse postResponse = new PostResponse(post);
            for (Favs fav : favs) {
                if (fav.getUser().getEmail().equals(email)) {
                    postResponse.setWasFaved(true);
                    break;
                }
            }
            for (Likes like : likes) {
                if (like.getUser().getEmail().equals(email)) {
                    postResponse.setWasLiked(true);
                    break;
                }
            }
            for (Comment comment : comments) {
                postResponse.addComment(comment);
            }
            return postResponse;
        } catch (Exception e){
            throw new ServletException("Erro ao tentar buscar post: " + e);
        }
    }

    public Post get(Long id) {
        try{
            return postRepository.getPostById(id);
        }catch (Exception e){
            return null;
        }
    }

    public Boolean favPost(Long id, Authentication auth) throws ServletException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found " + email));
        Post post;
        try {
            post = postRepository.getPostById(id);
        } catch (Exception e) {
            throw new ServletException("Erro ao tentar buscar post: " + e);
        }
        try {
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
        } catch (Exception e){
            throw new ServletException("Erro ao tentar favoritar post: " + e);
        }
    }

    public Boolean unfavPost(Long id, Authentication auth) throws ServletException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found " + email));
        Post post;
        try {
            post = postRepository.getPostById(id);
        } catch (Exception e) {
            throw new ServletException("Erro ao tentar buscar post: " + e);
        }
        try {
            for (Favs favPost : user.getFavs()) {
                if (favPost.getPost().equals(post)) {
                    post.getFavedTimes().remove(favPost);
                    user.getFavs().remove(favPost);
                    favsRepository.delete(favPost);
                    boolean favsResp = favsHeap.remove(id);
                    if (favsResp) {
                        initializedF = false;
                    }
                    return true;
                }
            }
        } catch (Exception e){
            throw new ServletException("Erro ao tentar remover favoritos: " + e);
        }
        return false;
    }

    public Boolean likePost(Long id, Authentication auth) throws ServletException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found " + email));
        Post post;
        try {
            post = postRepository.getPostById(id);
        } catch (Exception e) {
            throw new ServletException("Erro ao tentar buscar post: " + e);
        }
        try {
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
        } catch (Exception e){
            throw new ServletException("Erro ao tentar dar like no post: " + e);
        }
    }

    public Boolean unlikePost(Long id, Authentication auth) throws ServletException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found " + email));
        Post post;
        try {
            post = postRepository.getPostById(id);
        } catch (Exception e) {
            throw new ServletException("Erro ao tentar buscar post: " + e);
        }
        try {
            for (Likes likedPost : user.getLikes()) {
                if (likedPost.getPost().equals(post)) {
                    post.getLikedTimes().remove(likedPost);
                    user.getLikes().remove(likedPost);
                    likesRepository.delete(likedPost);
                    boolean likeResp = likesHeap.remove(id);
                    if (likeResp) {
                        initializedL = false;
                    }
                    return true;
                }
            }
        } catch (Exception e){
            throw new ServletException("Erro ao tentar remover like: " + e);
        }
        return false;
    }

    //Funcionalidades ADM
    public int getFavedTimesByPostId(Long postId) {
        Post post = postRepository.getPostById(postId);
        return post.getFavedTimes().size();
    }

    public int getLikedTimesByPostId(Long postId, Authentication auth) throws ServletException {
        userRepository.findByEmail(auth.getName()).orElseThrow(() -> new ServletException("User not found " + auth.getName()));
        Post post = postRepository.getPostById(postId);
        return post.getLikedTimes().size();
    }

    public List<PostResponse> getFavedPostsByUserId(Long userId) throws ServletException {
        User user = userRepository.getReferenceById(userId);
        List<PostResponse> faveds = new ArrayList<>();
        try {
            for (Favs fav : user.getFavs()) {
                Post post = fav.getPost();
                faveds.add(new PostResponse(post));
            }
            return faveds;
        } catch (Exception e) {
            throw new ServletException("Erro ao obter os favoritos" + e.getMessage());
        }
    }

    public List<String> topViewedPosts(Authentication auth) {
        String email = auth.getName();
        userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found " + email));

        initViewsHeap();
        List<String> response = new ArrayList<>();

        viewsHeap.getHeap().forEach(post -> response.add(
                    "Post: " + post.getId() +
                    " | Views: " + post.getViews() +
                    " | Author: " + post.getUserId()));

        return response;
    }

    public List<String> topFavedPosts(Authentication auth) {
        String email = auth.getName();
        userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found " + email));

        initFavsHeap();
        List<String> response = new ArrayList<>();
        favsHeap.getHeap().forEach(post -> response.add(
                "Post " + post.getId() +
                        " | Faved Times: " + post.getFavedTimes() +
                        " | Author: " + post.getUserId()));
        return response;
    }

    public List<String> topLikedPosts(Authentication auth) {
        String email = auth.getName();
        userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found " + email));

        initLikesHeap();
        List<String> response = new ArrayList<>();
        likesHeap.getHeap().forEach(post -> response.add(
                "Post" + post.getId() +
                        " | Liked Times: " + post.getLikedTimes() +
                        " | Author: " + post.getUserId()));
        return response;
    }
}