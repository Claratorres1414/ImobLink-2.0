package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.DTOs.SetPostInfoRequest;
import com.PIEC.ImobLink.Entitys.Favs;
import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.FavsRepository;
import io.jsonwebtoken.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Getter
@Setter
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ImageService imageService;
    private final FavsRepository favsRepository;

    @Transactional
    public String createPost(List<MultipartFile> images, String description, double price, String street, String avenue, String number, Authentication auth) throws IOException, java.io.IOException {
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
            return "post deleted!";
        } catch (Exception e){
            throw new ServletException("Erro ao excluir post: " + e);
        }
    }

    public List<PostResponse> getPostsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found " + email));

        return user.getPosts().stream()
                .map(PostResponse::new)
                .toList();
    }

    public PostResponse getPostById(Long id, Authentication auth) throws ServletException {
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found " + email));
        try {
            Post post = postRepository.getPostById(id);
            return new PostResponse(post);
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
            return true;
        } catch (Exception e){
            throw new ServletException("Erro ao tentar buscar post: " + e);
        }
    }
}
