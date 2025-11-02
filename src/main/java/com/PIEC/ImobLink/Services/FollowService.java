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

        User userFollowed = userRepository.findById(followingId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        Follow alreadyFollows = followRepository.findByFollowerIdAndFollowingId(user.getId(), followingId)
                .orElse(null);

        if (alreadyFollows != null) {
            throw new IllegalArgumentException("Você já segue esse usuário.");
        }

        Follow follow = new Follow();
        follow.setFollowing(userFollowed);
        follow.setFollower(user);

        try {
            user.getFollowings().add(follow);
            userFollowed.getFollowers().add(follow);
        } catch (Exception e) {
            throw new IllegalArgumentException("Erro ao tentar dar follow: " + e.getMessage());
        }

        return followRepository.save(follow);
    }

    public void unfollow(Authentication auth, Long followingId){
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Erro ao buscar o usuario" + email));

        User following = userRepository.getReferenceById(followingId);

        Follow follow = followRepository.findByFollowerIdAndFollowingId(user.getId(), followingId)
                .orElseThrow(() -> new IllegalArgumentException("Follow não encontrado"));

        try {
            user.getFollowings().remove(follow);
            following.getFollowers().remove(follow);
            followRepository.delete(follow);
        } catch (Exception e) {
            throw new IllegalArgumentException("Erro ao tentar dar unfollow: " + e.getMessage());
        }
    }
}
