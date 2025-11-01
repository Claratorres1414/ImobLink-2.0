package com.PIEC.ImobLink.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import com.PIEC.ImobLink.Entitys.Follow;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Repositorys.FollowRespository;

@Service
@RequiredArgsConstructor
public class FollowService {
    private final UserRepository userRepository;
    private final FollowRespository followRepository;

    public Follow follow(Authentication auth, Long followingId){
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Erro ao buscar o usuario" + email));
        Long userId = user.getId();
        if (userId.equals(followingId)){
            throw new IllegalArgumentException("Você não pode seguir a si mesmo.");
        }

        User follower = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Seguidor não encontrado."));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        boolean alreadyFollows = followRepository
                .findByFollowerId(userId).stream()
                .anyMatch(f -> f.getFollowing().getId().equals(followingId));

        if (alreadyFollows){
            throw new IllegalArgumentException("Você já segue esse usuário.");
        }

        Follow follow = new Follow();
        follow.setFollowing(following);
        follow.setFollower(follower);
        return followRepository.save(follow);
    }

    public void unfollow(Authentication auth, Long followingId){
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Erro ao buscar o usuario" + email));
        var follows = followRepository.findByFollowerId(user.getId());
        follows.stream()
                .filter(f -> f.getFollowing().getId().equals(followingId))
                .findFirst()
                .ifPresent(followRepository::delete);
    }
}
