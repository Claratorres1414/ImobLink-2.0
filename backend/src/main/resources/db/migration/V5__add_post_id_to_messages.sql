ALTER TABLE messages
    ADD COLUMN post_id BIGINT;

ALTER TABLE messages
    ADD CONSTRAINT fk_messages_post
        FOREIGN KEY (post_id) REFERENCES posts(id);