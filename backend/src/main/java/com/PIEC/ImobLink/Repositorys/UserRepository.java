package com.PIEC.ImobLink.Repositorys;

import com.PIEC.ImobLink.Entitys.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findTop10ByNameContainingIgnoreCase(String search);
}
