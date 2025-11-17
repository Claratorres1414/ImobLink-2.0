package com.PIEC.ImobLink.Exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    //Exceções genéricas
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllExceptions(Exception ex, WebRequest request) {
        return buildResponse("Erro interno: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    //Usuário não encontrado
    @ExceptionHandler({UsernameNotFoundException.class})
    public ResponseEntity<Object> handleUsernameNotFoundException(Exception ex) {
        return buildResponse("Usuário não encontrado: " + ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    //Token ou cred. inválidas
    @ExceptionHandler({BadCredentialsException.class})
    public ResponseEntity<Object> handleBadCredentialsException(Exception ex) {
        return buildResponse("Credênciais inválidas: " + ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    //Erro na validação de argumento
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    //Token inválido
    @ExceptionHandler(io.jsonwebtoken.JwtException.class)
    public ResponseEntity<Object> handleJwtException(Exception ex) {
        return buildResponse("Token inválido ou expirado: " + ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    private ResponseEntity<Object> buildResponse(String msg, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("menssagem", msg);
        body.put("status", status.value());
        body.put("sucesso", false);
        return new ResponseEntity<>(body, status);
    }
}
