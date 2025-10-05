package com.PIEC.ImobLink.Services;

import Role.Role;
import com.PIEC.ImobLink.DTOs.SetInfoRequest;
import com.PIEC.ImobLink.DTOs.SetPasswordRequest;
import com.PIEC.ImobLink.DTOs.UserDetails;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Entitys.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImageService imageService;

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

    public UserDetails loadUser(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        return new UserDetails(user);
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
        userRepository.save(user);
        System.out.println("Informações setadas com sucesso para o user: " + user.getName());
    }

    public String setProfileImage(MultipartFile newProfileImage, Authentication auth) throws IOException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        if(newProfileImage != null) {
            String imagePath = imageService.saveImage(newProfileImage, auth);
            user.setProfileImageUrl(imagePath);
        }
    }

    public Boolean setPassword(SetPasswordRequest setRequest, String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));

        if (setRequest.getNewPassword() != null && !setRequest.getNewPassword().equals(setRequest.getPassword()) && passwordEncoder.matches(setRequest.getPassword(), user.getPassword())) {
            user.setPassword(passwordEncoder.encode(setRequest.getNewPassword()));
            userRepository.save(user);
            System.out.println("Senha atualizada com sucesso!");
            return true;
        }
        else {
            System.out.println("Erro ao atualizar senha!");
            return false;
        }
    }
}
