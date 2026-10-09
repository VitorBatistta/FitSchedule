package com.classpeak.scheduler.personals;

import com.classpeak.scheduler.personals.PersonalTrainerDtos.PersonalTrainerRequest;
import com.classpeak.scheduler.personals.PersonalTrainerDtos.PersonalTrainerResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/personais")
public class PersonalTrainerController {
  private final PersonalTrainerService service;
  private final PersonalAuthService authService;

  public PersonalTrainerController(PersonalTrainerService service, PersonalAuthService authService) {
    this.service = service;
    this.authService = authService;
  }

  @GetMapping
  List<PersonalTrainerResponse> list(@RequestHeader(value = "X-Personal-Id", required = false) UUID personalId) {
    if (service.hasAnyPersonal()) {
      authService.requireAdmin(personalId);
    }
    return service.list();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  PersonalTrainerResponse create(
    @RequestHeader(value = "X-Personal-Id", required = false) UUID personalId,
    @Valid @RequestBody PersonalTrainerRequest request
  ) {
    if (service.hasAnyPersonal()) {
      authService.requireAdmin(personalId);
    }
    return service.create(request);
  }

  @PutMapping("/{id}")
  PersonalTrainerResponse update(
    @RequestHeader("X-Personal-Id") UUID personalId,
    @PathVariable UUID id,
    @Valid @RequestBody PersonalTrainerRequest request
  ) {
    authService.requireAdmin(personalId);
    return service.update(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@RequestHeader("X-Personal-Id") UUID personalId, @PathVariable UUID id) {
    authService.requireAdmin(personalId);
    service.delete(id);
  }
}
