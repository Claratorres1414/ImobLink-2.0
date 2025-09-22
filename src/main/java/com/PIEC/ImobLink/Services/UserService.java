package com.PIEC.ImobLink.Services;

import Role.Role;
import com.PIEC.ImobLink.DTOs.UserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Entitys.User;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

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

    public void setBio(String bio, String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        user.setBio(bio);
        userRepository.save(user);
        System.out.println("Bio setada com sucesso para o user: " + user.getName());
    }
}
