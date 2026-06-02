package com.PIEC.ImobLink.Services;

import Role.Role;
import com.PIEC.ImobLink.DTOs.DeleteProfileRequest;
import com.PIEC.ImobLink.DTOs.SetInfoRequest;
import com.PIEC.ImobLink.DTOs.SetPasswordRequest;
import com.PIEC.ImobLink.DTOs.UserDetails;
import com.PIEC.ImobLink.Entitys.Favs;
import com.PIEC.ImobLink.Entitys.Images;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
import com.PIEC.ImobLink.Services.Images.FileStorageService;
import com.PIEC.ImobLink.Services.Images.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Entitys.User;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImageService imageService;
    private final ImageRepository imageRepository;
    private final RequireUserService requireUserService;
    private final FileStorageService fileStorageService;

    public Boolean promoteUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado como o email: " + email));

        if(user.getRole() == Role.ADMIN) {
            return false;
        }

        user.setRole(Role.ADMIN);
        userRepository.save(user);
        return true;
    }

    public UserDetails loadUser(Authentication auth) {
        User user = requireUserService.requireUser(auth);
        return new UserDetails(user);
    }

    public UserDetails loadUserById(Long id, Authentication auth) {
        requireUserService.requireUser(auth);

        User account = userRepository.getReferenceById(id);

        return new UserDetails(account);
    }

    public List<UserDetails> loadAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDetails::new)
                .toList();
    }

    public List<UserDetails> searchUsers(String search, Authentication auth) {
        requireUserService.requireUser(auth);
        List<User> users = userRepository.findTop10ByEmailContainingIgnoreCase(search);

        return users.stream()
                .map(UserDetails::new)
                .toList();
    }

    public Boolean setInfo(SetInfoRequest newInfo, Authentication auth) {
        User user = requireUserService.requireUser(auth);

        if(newInfo.getName() != null) {
            user.setName(newInfo.getName());
        }if(newInfo.getPhoneNumber() != null) {
            user.setPhoneNumber(newInfo.getPhoneNumber());
        }if(newInfo.getBio() != null) {
            user.setBio(newInfo.getBio());
        }

        userRepository.save(user);

        return true;
    }

    public String setProfileImage(MultipartFile newProfileImage, Authentication auth) throws IOException {
        User user = requireUserService.requireUser(auth);

        if(newProfileImage != null) {
            if (user.getImageProfileId() != null) {
                Images oldImage = imageRepository.findById(user.getImageProfileId())
                        .orElseThrow();
                fileStorageService.delete(oldImage);
            }
            String imagePath = imageService.saveProfileImage(newProfileImage, auth).getFilepath();
            user.setImageProfilePath(imagePath);
            userRepository.save(user);

            return imagePath;
        }

        throw new IllegalArgumentException("Arquivos vazios não suportados");
    }

    public Boolean setPassword(SetPasswordRequest setRequest, Authentication auth) throws AccessDeniedException {
        User user = requireUserService.requireUser(auth);

        if (setRequest.getNewPassword() != null && !setRequest.getNewPassword().equals(setRequest.getPassword()) && passwordEncoder.matches(setRequest.getPassword(), user.getPassword())) {
            user.setPassword(passwordEncoder.encode(setRequest.getNewPassword()));
            userRepository.save(user);
            return true;
        }
        throw new AccessDeniedException("Alteração de senha negada");
    }

    @Transactional
    public void deleteProfile(DeleteProfileRequest delRequest, Authentication auth) throws IOException {
        User user = requireUserService.requireUser(auth);

        if(delRequest.getPassword() != null && passwordEncoder.matches(delRequest.getPassword(), user.getPassword())) {
            if (user.getImageProfileId() != null) {
                Images profileImage = imageRepository.findById(user.getImageProfileId())
                        .orElseThrow();
                fileStorageService.delete(profileImage);
            }
            imageRepository.deleteByUserId(user.getId());
            for (Post post : user.getViewedPosts()) {
                post.getReacheds().remove(user);
            }

            user.getViewedPosts().clear();
            userRepository.delete(user);
            return;
        }

        throw new AccessDeniedException("Credênciais inválidas para deleção do perfil");
    }

    public int calcFavedTimes(Authentication auth) {
        User user = requireUserService.requireUser(auth);
        int favTimes = 0;

        List<Post> posts = user.getPosts();
        if (posts != null) {
            for (Post post : posts) {
                favTimes += post.getFavedTimes().size();
            }
        }

        return favTimes;
    }

    //Para ADMINS
    public int calcNumberOfFavedsByUserId(Long id) {
        User user = userRepository.getReferenceById(id);
        List<Favs> favs = user.getFavs();
        if (favs != null) {
            return favs.size();
        }
        return 0;
    }

    public int calcAllPostsFavedTimesByUserId(Long id) {
        User user = userRepository.getReferenceById(id);

        int favTimes = 0;

        List<Post> posts = user.getPosts();

        if (posts != null) {
            for (Post post : posts) {
                favTimes += post.getFavedTimes().size();
            }
        }

        return favTimes;
    }
}
