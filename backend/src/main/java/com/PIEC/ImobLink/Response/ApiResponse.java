package com.PIEC.ImobLink.Response;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ApiResponse<T> {
    private final LocalDateTime timestamp;
    private final int status;
    private final String message;
    private final T data;

    public ApiResponse(int status, String message, T data) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.message = message;
        this.data = data;
    }
}
