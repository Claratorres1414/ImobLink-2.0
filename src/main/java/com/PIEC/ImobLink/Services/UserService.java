package com.PIEC.ImobLink.Services;

import Role.Role;
import com.PIEC.ImobLink.DTOs.DeleteProfileRequest;
import com.PIEC.ImobLink.DTOs.SetInfoRequest;
import com.PIEC.ImobLink.DTOs.SetPasswordRequest;
import com.PIEC.ImobLink.DTOs.UserDetails;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
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
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImageService imageService;
    private final ImageRepository imageRepository;

    public void promoteUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado como o email: " + email));

        if(user.getRole() == Role.ADMIN) {
            System.out.println("Usuário já é ADMIN: " + email);
            return;
        }

        user.setRole(Role.ADMIN);
        userRepository.save(user);
        System.out.println("Usuário promovido com sucesso: " + email);
    }

    public UserDetails loadUser(Authentication auth) throws UsernameNotFoundException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        return new UserDetails(user);
    }

    public UserDetails loadUserById(Long id, Authentication auth) throws UsernameNotFoundException {
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        try {
            User account = userRepository.getReferenceById(id);
            return new UserDetails(account);
        } catch (Exception e) {
            System.out.println("Erro ao tentar pegar usuário com id: " + id + " Erro: " + e.getMessage());
            return null;
        }
    }

    public List<UserDetails> loadAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDetails::new)
                .toList();
    }

    public void setInfo(SetInfoRequest newInfo, Authentication auth) throws UsernameNotFoundException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));

        if(newInfo.getName() != null) {
            user.setName(newInfo.getName());
        }if(newInfo.getPhoneNumber() != null) {
            user.setPhoneNumber(newInfo.getPhoneNumber());
        }if(newInfo.getBio() != null) {
            user.setBio(newInfo.getBio());
        }

        try {
            userRepository.save(user);
        } catch ( Exception e ) {
            System.out.println("Erro ao salvar novas informações para user: " + user.getName() + " Log: " + e.getMessage());
            return;
        }
        System.out.println("Informações setadas com sucesso para o user: " + user.getName());
    }

    public String setProfileImage(MultipartFile newProfileImage, Authentication auth) throws IOException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        if(newProfileImage != null) {
            String imagePath = imageService.saveProfileImage(newProfileImage, auth).getFilepath();
            user.setImageProfilePath(imagePath);
            return "Imagem de perfil atualizada com sucesso para: " + userRepository.save(user).getEmail();
        }
        return "Não foi possível atualizar a imagem de perfil.";
    }

    public Boolean setPassword(SetPasswordRequest setRequest, Authentication auth) throws UsernameNotFoundException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));

        if (setRequest.getNewPassword() != null && !setRequest.getNewPassword().equals(setRequest.getPassword()) && passwordEncoder.matches(setRequest.getPassword(), user.getPassword())) {
            user.setPassword(passwordEncoder.encode(setRequest.getNewPassword()));
            try{
                userRepository.save(user);
                System.out.println("Senha atualizada com sucesso!");
                return true;
            }catch ( Exception e ) {
                System.out.println("Erro ao tentar salvar nova senha: " + e.getMessage());
                return false;
            }
        }
        else {
            System.out.println("Erro ao atualizar senha!");
            return false;
        }
    }

    @Transactional
    public Boolean deleteProfile(DeleteProfileRequest delRequest, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        if(delRequest.getPassword() != null && passwordEncoder.matches(delRequest.getPassword(), user.getPassword())) {
            imageRepository.deleteByUserId(user.getId());
            userRepository.delete(user);
            return true;
        }
        return false;
    }

    public int calcFavedTimes(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        int favTimes = 0;
        try{
            List<Post> posts = user.getPosts();
            for (Post post : posts) {
                favTimes += post.getFavedTimes().size();
            }
        } catch ( Exception e ) {
            System.out.println("Erro ao tentar calcular favoritos: " + e.getMessage());
            return 0;
        }
        return favTimes;
    }
}
