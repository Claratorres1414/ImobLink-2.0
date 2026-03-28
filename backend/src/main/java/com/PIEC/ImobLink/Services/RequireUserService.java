package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RequireUserService {
    private final UserRepository userRepository;

    public User requireUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
