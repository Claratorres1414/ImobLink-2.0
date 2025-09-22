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
public class AdminInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if(userRepository.findByEmail("supreme@gmail.com").isEmpty()){
            User superAdmin = new User();
            superAdmin.setCpf("000");
            superAdmin.setPhoneNumber("000");
            superAdmin.setName("Super Admin");
            superAdmin.setEmail("supreme@gmail.com");
            superAdmin.setPassword(passwordEncoder.encode("123456"));
            superAdmin.setRole(Role.SUPER_ADMIN);

            userRepository.save(superAdmin);
            System.out.println("A SUPREMACIA ENTROU NO CHAT");
        }
    }
}
