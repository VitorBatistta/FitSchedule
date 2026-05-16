package com.classpeak.scheduler.common;

import java.time.OffsetDateTime;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(BusinessException.class)
  ResponseEntity<Map<String, Object>> handleBusiness(BusinessException ex) {
    return ResponseEntity.status(ex.status()).body(error(ex.status(), ex.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
    var message = ex.getBindingResult().getFieldErrors().stream()
      .findFirst()
      .map(error -> error.getField() + ": " + error.getDefaultMessage())
      .orElse("Dados inválidos");
    return ResponseEntity.badRequest().body(error(HttpStatus.BAD_REQUEST, message));
  }

  private Map<String, Object> error(HttpStatus status, String message) {
    return Map.of(
      "timestamp", OffsetDateTime.now(),
      "status", status.value(),
      "error", status.getReasonPhrase(),
      "message", message
    );
  }
}
