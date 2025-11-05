package com.PIEC.ImobLink.Repositorys;

import com.PIEC.ImobLink.Entitys.Follow;
import com.PIEC.ImobLink.Entitys.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface FollowRespository extends JpaRepository<Follow, Long> {
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    @Query("SELECT f.follower FROM Follow f WHERE f.following = :user")
    List<User> findFollowersByUser(User user);

    // 🔽 Usuários que o determinado usuário está seguindo
    @Query("SELECT f.following FROM Follow f WHERE f.follower = :user")
    List<User> findFollowingsByUser(User user);
}
