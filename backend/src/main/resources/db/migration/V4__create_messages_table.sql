CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    content VARCHAR(1500) NOT NULL,
    sended_at TIMESTAMP DEFAULT NOW(),

    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,

    CONSTRAINT fk_messages_sender
                      FOREIGN KEY (sender_id) REFERENCES users(id),

    CONSTRAINT fk_messages_receiver
                      FOREIGN KEY (receiver_id) REFERENCES users(id)
);