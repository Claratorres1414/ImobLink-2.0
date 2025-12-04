package com.PIEC.ImobLink.Repositorys;

import com.PIEC.ImobLink.Entitys.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> searchMessageBySenderAndReceiverId(Long senderId, Long receiverId);
}