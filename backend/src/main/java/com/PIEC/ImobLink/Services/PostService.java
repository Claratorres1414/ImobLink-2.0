package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.DTOs.SetPostInfoRequest;
import com.PIEC.ImobLink.Entitys.*;
import com.PIEC.ImobLink.Repositorys.*;
import com.PIEC.ImobLink.Util.FavsLimitedHeap;
import com.PIEC.ImobLink.Util.LikesLimitedHeap;
import com.PIEC.ImobLink.Util.ViewsLimitedHeap;
import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
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
    private final ImageRepository imageRepository;
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
    public PostResponse createPost(List<MultipartFile> images, String description, double price, String street, String avenue, String number, String type, Authentication auth) throws java.io.IOException {
        //Remover IO ao refatorar Image
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

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
        post.setWasUpdated(false);

        for (MultipartFile image : images) {
            Images savedImage = imageService.saveImage(image,auth);
            post.addImage(savedImage);
        }

        postRepository.save(post);
        for(Images image: post.getImages()){
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
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        List<PostResponse> faveds = new ArrayList<>();
        for (Favs fav : user.getFavs()) {
            Post post = fav.getPost();
            faveds.add(new PostResponse(post));
        }
        return faveds;
    }

    public List<PostResponse> searchPostByAvenue(String avenue, Authentication auth) {
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        List<Post> responses = postRepository.findTop10ByAvenueContainingIgnoreCase(avenue);
        List<PostResponse> postResponses = new ArrayList<>();
        for (Post post : responses) {
            postResponses.add(new PostResponse(post));
        }
        return postResponses;
    }

    public List<PostResponse> searchPostByStreet(String street, Authentication auth) {
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        List<Post> responses = postRepository.findTop10ByStreetContainingIgnoreCase(street);
        List<PostResponse> postResponses = new ArrayList<>();
        for (Post post : responses) {
            postResponses.add(new PostResponse(post));
        }
        return postResponses;
    }

    public PostResponse editPost(Long id, SetPostInfoRequest newInfoPost, Authentication auth) {
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
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

        post.setWasUpdated(true);
        postRepository.save(post);

        return new PostResponse(post);
    }

   public void deletePost(Long id, Authentication auth) {
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

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
    }

    public void removeImageByPostIdAndImageId(Long postId, Long imageId, Authentication auth) {
        String email = auth.getName();
        userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Post post = postRepository.getPostById(postId);
        if (post.getImages().size() > 1){
            post.removeImage(imageId);
            imageRepository.deleteById(imageId);
            new PostResponse(post);
            return;
        }
        throw new UnsupportedOperationException("Quantidade de imagens mínima atingida");
    }

    public PostResponse addImageToPost(Long postId, MultipartFile image, Authentication auth) throws java.io.IOException {
        String email = auth.getName();
        userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("Erro ao buscar usuário"));
        Post post = postRepository.getPostById(postId);
        if (post.getImages().size() == 10){
            throw new UnsupportedOperationException("Esse Post já possui o máximo de imagens permitidas!");
        }
        Images savedImage = imageService.saveImage(image,auth);
        post.addImage(savedImage);

        postRepository.save(post);
        savedImage.setPost(post);
        imageRepository.save(savedImage);

        return new PostResponse(post);
    }

    public List<PostResponse> getPostsByUser(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found " + email));

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

    public PostResponse getPostById(Long id, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found " + email));

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
    }

    public Post get(Long id) {
        return postRepository.getPostById(id);
    }

    public Boolean favPost(Long id, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found " + email));
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
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found " + email));
        Post post;

        post = postRepository.getPostById(id);

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

        return false;
    }

    public Boolean likePost(Long id, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found " + email));
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
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found " + email));
        Post post = postRepository.getPostById(id);

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
        return false;
    }

    //Funcionalidades ADM
    public int getFavedTimesByPostId(Long postId) {
        Post post = postRepository.getPostById(postId);
        return post.getFavedTimes().size();
    }

    public int getLikedTimesByPostId(Long postId, Authentication auth) {
        userRepository.findByEmail(auth.getName()).orElseThrow(() -> new UsernameNotFoundException("User not found " + auth.getName()));
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
        String email = auth.getName();
        userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found " + email));

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
        userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found " + email));

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
        userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found " + email));

        initLikesHeap();
        List<String> response = new ArrayList<>();
        likesHeap.getHeap().forEach(post -> response.add(
                "Post" + post.getId() +
                        " | Liked Times: " + post.getLikedTimes() +
                        " | Author: " + post.getUserId()));
        return response;
    }
}