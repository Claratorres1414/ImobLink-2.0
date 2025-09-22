package com.PIEC.ImobLink.Services;

import lombok.RequiredArgsConstructor;
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

    public Follow follow(Long followerId, Long followingId){
        if (followerId.equals(followingId)){
            throw new IllegalArgumentException("Você não pode seguir a si mesmo.");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new IllegalArgumentException("Seguidor não encontrado."));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        boolean alreadyFollows = followRepository
                .findByFollowerId(followerId).stream()
                .anyMatch(f -> f.getFollowing().getId().equals(followingId));

        if (alreadyFollows){
            throw new IllegalArgumentException("Você já segue esse usuário.");
        }

        Follow follow = new Follow();
        follow.setFollowing(following);
        follow.setFollower(follower);
        return followRepository.save(follow);
    }

    public void unfollow(Long followerId, Long followingId){
        var follows = followRepository.findByFollowerId(followerId);
        follows.stream()
                .filter(f -> f.getFollowing().getId().equals(followingId))
                .findFirst()
                .ifPresent(followRepository::delete);
    }
}
