package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.DTOs.SetPostInfoRequest;
import com.PIEC.ImobLink.Entitys.User;
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

import java.util.List;

@Service
@RequiredArgsConstructor
@Getter
@Setter
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ImageService imageService;

    @Transactional
    public String createPost(MultipartFile image, String description, double price, String street, String avenue, String number, Authentication auth) throws IOException, java.io.IOException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String filePath = imageService.saveImage(image, auth);

        Post post = new Post();
        post.setImagePath(filePath);
        post.setImageType(image.getContentType());
        post.setDescription(description);
        post.setPrice(price);
        post.setStreet(street);
        post.setAvenue(avenue);
        post.setUser(user);
        post.setNumber(number);

        postRepository.save(post);

        return "post created!";
    }

    public List<PostResponse> getFeed() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(PostResponse::new)
                .toList();
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

        postRepository.delete(get(id));
        return "post deleted!";
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
}
