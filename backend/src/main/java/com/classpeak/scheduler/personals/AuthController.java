package com.classpeak.scheduler.personals;

import com.classpeak.scheduler.personals.PersonalTrainerDtos.PersonalLoginRequest;
import com.classpeak.scheduler.personals.PersonalTrainerDtos.PersonalSessionResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final PersonalAuthService service;

  public AuthController(PersonalAuthService service) {
    this.service = service;
  }

  @PostMapping("/login")
  PersonalSessionResponse login(@Valid @RequestBody PersonalLoginRequest request) {
    return service.login(request);
  }
}
