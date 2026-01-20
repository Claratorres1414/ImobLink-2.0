package com.PIEC.ImobLink.Exceptions;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ApiError {
    private final LocalDateTime timestamp;
    private final int status;
    private final String error;
    private final String message;
    private final String path;
    private final boolean success;

    public ApiError(int status, String error, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.success = false;
    }
}
