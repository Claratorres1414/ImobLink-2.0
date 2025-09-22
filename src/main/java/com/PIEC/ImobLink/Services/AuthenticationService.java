package com.PIEC.ImobLink.Services;

import Role.Role;
import com.PIEC.ImobLink.DTOs.AuthResponse;
import com.PIEC.ImobLink.DTOs.LoginRequest;
import com.PIEC.ImobLink.DTOs.RegisterRequest;
import com.PIEC.ImobLink.Jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        User user = new User();
        user.setCpf(request.getCpf());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        userRepository.save(user);

        return new AuthResponse("Cadastrado com sucesso!");
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate( //Quando sai do controller bate aqui
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()) //Entra aqui e volta pra linha de cima, é onde quebra toda vez
            );
        }catch (AuthenticationException e){
            System.out.println(e.getMessage());
        }

        var user = userRepository.findByEmail(request.getEmail());

        String token = jwtUtil.generateToken(user.get().getEmail());
        return new AuthResponse(token);
    }
}
