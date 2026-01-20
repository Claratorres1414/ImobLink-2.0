package com.PIEC.ImobLink.Response;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ResponseUtil {
    public static <T>ResponseEntity<ApiResponse<T>> ok(String message, T data) {
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), message, data)
        );
    }

    public static <T>ResponseEntity<ApiResponse<T>> created(String message, T data) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(HttpStatus.CREATED.value(), message, data));
    }

    public static ResponseEntity<ApiResponse<Void>> noContent(String message) {
        return ResponseEntity.noContent().build();
    }
}
//git commit -m "Ref. #145 | feat: padroniza responses para casos de sucesso"