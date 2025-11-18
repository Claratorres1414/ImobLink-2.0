package com.PIEC.ImobLink.Initializer;

import Role.Role;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UsersInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final String[] nomes = {"Clara", "Pedro", "Mateus", "Fulano", "Beltrano", "Prego", "Parafuso", "Ste", "Carlos", "Edgar",
            "Ygor", "Tiago", "André", "Breno", "Neto", "Mariana", "Tatiana", "Carla", "Aline", "Agatha",
            "Oliver", "Olivia", "Helio", "Paulo", "João", "Sergio", "Lobo", "Julio", "Martin", "Professor",
            "Denver", "Moscow", "Tokyo", "Oslo", "Berlim", "Rio", "Palermo", "Marcelo", "Marcela", "Andreia",
            "Andersson", "Santos", "Torres", "Júlia", "Thainá", "Peter", "Lara", "Henrique", "Jorge", "Rodrigo",
            "Marília", "Iara", "Chico", "Bento", "Mônica", "Emili", "George", "Kitten", "Sinsinate", "Daniel"};
    @Override
    public void run (String... args) {
        for (int i = 0; i < 60; i++) {
            if (userRepository.findByEmail("user" + i + "@gmail.com").isEmpty()) {
                User user = new User();
                if (i < 10) {
                    user.setCpf("000.000.000-0" + i);
                    user.setPhoneNumber("99000-000" + i);
                } else {
                    user.setCpf("000.000.000-" + i);
                    user.setPhoneNumber("99000-00" + i);
                }
                user.setName(nomes[i]);
                user.setEmail("user" + i + "@gmail.com");
                user.setPassword(passwordEncoder.encode("123456"));
                user.setImageProfilePath("/uploads/holder.jpeg");
                user.setRole(Role.USER);
                userRepository.save(user);
            }
        }
    }
}
