package com.classpeak.scheduler.appointments;

import com.classpeak.scheduler.appointments.AppointmentDtos.AppointmentResponse;
import com.classpeak.scheduler.appointments.AppointmentDtos.CreateAppointmentRequest;
import com.classpeak.scheduler.personals.PersonalAuthService;
import com.classpeak.scheduler.personals.PersonalAuthService.Permission;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agendamentos")
public class AppointmentController {
  private final AppointmentService service;
  private final PersonalAuthService authService;

  public AppointmentController(AppointmentService service, PersonalAuthService authService) {
    this.service = service;
    this.authService = authService;
  }

  @GetMapping("/futuros")
  List<AppointmentResponse> listFuture(@RequestHeader("X-Personal-Id") UUID personalId) {
    authService.requirePermission(personalId, Permission.APPOINTMENTS);
    return service.listFuture();
  }

  @GetMapping
  List<AppointmentResponse> listByYear(
    @RequestHeader("X-Personal-Id") UUID personalId,
    @RequestParam int year
  ) {
    authService.requirePermission(personalId, Permission.APPOINTMENTS);
    return service.listByYear(year);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  AppointmentResponse create(@RequestHeader("X-Personal-Id") UUID personalId, @Valid @RequestBody CreateAppointmentRequest request) {
    authService.requirePermission(personalId, Permission.APPOINTMENTS);
    return service.create(request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@RequestHeader("X-Personal-Id") UUID personalId, @PathVariable UUID id) {
    authService.requirePermission(personalId, Permission.APPOINTMENTS);
    service.delete(id);
  }
}
