package com.PIEC.ImobLink.Repositorys;

import com.PIEC.ImobLink.Entitys.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
}