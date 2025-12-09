package com.PIEC.ImobLink.Repositorys;

import com.PIEC.ImobLink.Entitys.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m " +
            "WHERE (m.sender.id = :user1 AND m.receiver.id = :user2) " +
            "   OR (m.sender.id = :user2 AND m.receiver.id = :user1) " +
            "ORDER BY m.sendedAt ASC")
    List<Message> findConversation(Long user1, Long user2);

    @Query("""
    SELECT DISTINCT
        CASE
            WHEN m.sender.id = :userId THEN m.receiver.id
            ELSE m.sender.id
        END
    FROM Message m
    WHERE m.sender.id = :userId
       OR m.receiver.id = :userId
    """)
    List<Long> findContacts(Long userId);

}