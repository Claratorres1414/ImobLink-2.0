package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.UserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.PIEC.ImobLink.Entitys.Follow;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Repositorys.FollowRespository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FollowService {
    private final UserRepository userRepository;
    private final FollowRespository followRepository;
    private final RequireUserService requireUserService;

    public void follow(Authentication auth, Long followingId) {
        User user = requireUserService.requireUser(auth);
        Long userId = user.getId();
        if (userId.equals(followingId)){
            throw new IllegalArgumentException("Você não pode seguir a si mesmo.");
        }

        User userFollowed = userRepository.findById(followingId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado."));

        Optional<Follow> alreadyFollows = followRepository.findByFollowerIdAndFollowingId(user.getId(), followingId);
        if (alreadyFollows.isPresent()){
            throw new IllegalArgumentException("Você já segue esse usuário");
        }

        Follow follow = new Follow();
        follow.setFollowing(userFollowed);
        follow.setFollower(user);

        user.getFollowings().add(follow);
        userFollowed.getFollowers().add(follow);

        followRepository.save(follow);
    }

    public void unfollow(Authentication auth, Long followingId) {
        User user = requireUserService.requireUser(auth);

        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado."));

        Follow follow = followRepository.findByFollowerIdAndFollowingId(user.getId(), followingId)
                .orElseThrow(() -> new IllegalArgumentException("Follow não encontrado"));

        user.getFollowings().remove(follow);
        following.getFollowers().remove(follow);
        followRepository.delete(follow);
    }

    public List<UserDetails> getFollowers(Authentication auth) {
        User user = requireUserService.requireUser(auth);

        List<Follow> followers = user.getFollowers();
        List<UserDetails> followerList = new ArrayList<>();

        for (Follow follow : followers) {
            followerList.add(new UserDetails(follow.getFollower()));
        }

        return followerList;
    }

    public List<UserDetails> getFollowings(Authentication auth) {
        User user = requireUserService.requireUser(auth);

        List<Follow> followings = user.getFollowings();
        List<UserDetails> followingList = new ArrayList<>();

        for (Follow follow : followings) {
            followingList.add(new UserDetails(follow.getFollowing()));
        }

        return followingList;
    }

    public List<UserDetails> getFollowersById(Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
        return followRepository.findFollowersByUser(user)
                .stream()
                .map(UserDetails::new)
                .toList();
    }

    public List<UserDetails> getFollowingsById(Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
        return followRepository.findFollowingsByUser(user)
                .stream()
                .map(UserDetails::new)
                .toList();
    }
}
