package com.PIEC.ImobLink.ServicesTest;

import Role.Role;
import com.PIEC.ImobLink.DTOs.UserDetails;
import com.PIEC.ImobLink.Entitys.Follow;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.FollowRespository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Services.FollowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FollowServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private FollowRespository followRespository;

    @InjectMocks
    private FollowService followService;

    private User user1;
    private User user2;

    private Authentication auth;

    @BeforeEach
    void setUp() {
        user1 = new User();
        user1.setId(70L);
        user1.setCpf("123456789");
        user1.setPhoneNumber("546244526");
        user1.setEmail("email092@email.com");
        user1.setPassword("password");
        user1.setName("name");
        user1.setRole(Role.USER);

        user2 = new User();
        user2.setId(80L);
        user2.setCpf("123456700");
        user2.setPhoneNumber("546244500");
        user2.setEmail("email091@email.com");
        user2.setPassword("password");
        user2.setName("name");
        user2.setRole(Role.USER);

        auth = new UsernamePasswordAuthenticationToken(user1.getEmail(), user1.getPassword());
    }

    @Test
    void shouldFollowAnUnfollowedUser() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));

        when(userRepository.findById(anyLong()))
                .thenReturn(Optional.of(user2));

        when(followRespository.findByFollowerIdAndFollowingId(user1.getId(), user2.getId()))
                .thenReturn(Optional.empty());

        when(followRespository.save(any(Follow.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        followService.follow(auth, user2.getId());

        verify(userRepository, times(1)).findByEmail(anyString());
        verify(userRepository, times(1)).findById(anyLong());
        verify(followRespository, times(1)).findByFollowerIdAndFollowingId(anyLong(), anyLong());
        verify(followRespository, times(1)).save(any(Follow.class));
    }

    @Test
    void shouldNotFollowAnUnfollowedUserBecauseOfUserNotFoundForOfferedAuth() {
        when(userRepository.findByEmail(anyString()))
            .thenReturn(Optional.empty());

        Authentication authFake = new UsernamePasswordAuthenticationToken("aaaa", user1.getPassword());

        assertThrows(UsernameNotFoundException.class,
                () -> followService.follow(authFake, user2.getId()));
    }

    @Test
    void shouldNotFollowAnUnfollowedUserBecauseYouAreTheFollowerAndTheFollowedUser() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));

        assertThrows(IllegalArgumentException.class,
                () -> followService.follow(auth, user1.getId()));
    }

    @Test
    void shouldNotFollowAnUnfollowedUserBecauseTheFollowedUserWasNotFound() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));

        when(userRepository.findById(anyLong()))
                .thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> followService.follow(auth, 5L));
    }

    @Test
    void shouldNotFollowAnUnfollowedUserBecauseTheFollowedUserWasAlreadyFollowed() {
        Follow follow = new Follow();
        follow.setId(70L);
        follow.setFollower(user1);
        follow.setFollowing(user2);
        user1.getFollowings().add(follow);
        user2.getFollowers().add(follow);

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));

        when(userRepository.findById(anyLong()))
                .thenReturn(Optional.of(user2));

        when(followRespository.findByFollowerIdAndFollowingId(user1.getId(), user2.getId()))
                .thenReturn(Optional.of(follow));

        assertThrows(IllegalArgumentException.class,
                () -> followService.follow(auth, user2.getId()));
    }

    @Test
    void shouldUnfollowAnFollowedUser() {
        Follow follow = new Follow();
        follow.setId(70L);
        follow.setFollower(user1);
        follow.setFollowing(user2);
        user1.getFollowings().add(follow);
        user2.getFollowers().add(follow);

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));

        when(userRepository.findById(anyLong()))
                .thenReturn(Optional.of(user2));

        when(followRespository.findByFollowerIdAndFollowingId(user1.getId(), user2.getId()))
                .thenReturn(Optional.of(follow));

        followService.unfollow(auth, user2.getId());

        verify(userRepository, times(1)).findByEmail(anyString());
        verify(userRepository, times(1)).findById(anyLong());
        verify(followRespository, times(1)).findByFollowerIdAndFollowingId(anyLong(), anyLong());
        verify(followRespository, times(1)).delete(any(Follow.class));
    }

    @Test
    void shouldNotUnfollowAnFollowedUserBecauseOfUserNotFoundForOfferedAuth() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.empty());

        Authentication authFake = new UsernamePasswordAuthenticationToken("aaaa", user1.getPassword());

        assertThrows(UsernameNotFoundException.class,
                () -> followService.unfollow(authFake, user2.getId()));
    }

    @Test
    void shouldNotUnfollowAnFollowedUserBecauseTheFollowedUserWasNotFound() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));

        when(userRepository.findById(anyLong()))
                .thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> followService.unfollow(auth, 5L));
    }

    @Test
    void shouldNotUnfollowAnUnfollowedUser() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));

        when(userRepository.findById(anyLong()))
                .thenReturn(Optional.of(user2));

        when(followRespository.findByFollowerIdAndFollowingId(anyLong(), anyLong()))
                .thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> followService.unfollow(auth, user2.getId()));
    }

    @Test
    void shouldListUserFollowers() {
        Follow follow = new Follow();
        follow.setId(70L);
        follow.setFollower(user2);
        follow.setFollowing(user1);
        user2.getFollowings().add(follow);
        user1.getFollowers().add(follow);

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));

        List<UserDetails> followers = followService.getFollowers(auth);

        assert followers.size() == 1;
        verify(userRepository, times(1)).findByEmail(anyString());
    }

    @Test
    void shouldNotListUserFollowersBecauseOfUserNotFoundForOfferedAuth() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.empty());

        Authentication authFake = new UsernamePasswordAuthenticationToken("aaaa", user1.getPassword());

        assertThrows(UsernameNotFoundException.class,
                () -> followService.getFollowers(authFake));
    }

    @Test
    void shouldListUserFollowings() {
        Follow follow = new Follow();
        follow.setId(70L);
        follow.setFollower(user1);
        follow.setFollowing(user2);
        user1.getFollowings().add(follow);
        user2.getFollowers().add(follow);

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));

        List<UserDetails> followings = followService.getFollowings(auth);

        assert followings.size() == 1;
        verify(userRepository, times(1)).findByEmail(anyString());
    }

    @Test
    void shouldNotListUserFollowingsBecauseOfUserNotFoundForOfferedAuth() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.empty());

        Authentication authFake = new UsernamePasswordAuthenticationToken("aaaa", user1.getPassword());

        assertThrows(UsernameNotFoundException.class,
                () -> followService.getFollowings(authFake));
    }


    @Test
    void shouldListUserFollowersByUserId() {
        Follow follow = new Follow();
        follow.setId(70L);
        follow.setFollower(user2);
        follow.setFollowing(user1);
        user2.getFollowings().add(follow);
        user1.getFollowers().add(follow);

        when(userRepository.findById(anyLong()))
                .thenReturn(Optional.of(user1));

        when(followRespository.findFollowersByUser(any(User.class)))
                .thenReturn(List.of(user2));

        List<UserDetails> followers = followService.getFollowersById(user1.getId());

        assert followers.size() == 1;
        verify(userRepository, times(1)).findById(anyLong());
        verify(followRespository, times(1)).findFollowersByUser(any(User.class));
    }

    @Test
    void shouldNotListUserFollowersBecauseOfUserNotFoundForThatId() {
        when(userRepository.findById(anyLong()))
                .thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> followService.getFollowersById(5L));
    }


    @Test
    void shouldListUserFollowingsByUserId() {
        Follow follow = new Follow();
        follow.setId(70L);
        follow.setFollower(user1);
        follow.setFollowing(user2);
        user1.getFollowings().add(follow);
        user2.getFollowers().add(follow);

        when(userRepository.findById(anyLong()))
                .thenReturn(Optional.of(user1));

        when(followRespository.findFollowingsByUser(any(User.class)))
                .thenReturn(List.of(user2));

        List<UserDetails> followers = followService.getFollowingsById(user1.getId());

        assert followers.size() == 1;
        verify(userRepository, times(1)).findById(anyLong());
        verify(followRespository, times(1)).findFollowingsByUser(any(User.class));
    }

    @Test
    void shouldNotListUserFollowingsBecauseOfUserNotFoundForThatId() {
        when(userRepository.findById(anyLong()))
                .thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> followService.getFollowingsById(5L));
    }
}
