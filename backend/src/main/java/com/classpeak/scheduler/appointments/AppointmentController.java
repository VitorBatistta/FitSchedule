package com.classpeak.scheduler.appointments;

import com.classpeak.scheduler.appointments.AppointmentDtos.AppointmentResponse;
import com.classpeak.scheduler.appointments.AppointmentDtos.CreateAppointmentRequest;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agendamentos")
public class AppointmentController {
  private final AppointmentService service;

  public AppointmentController(AppointmentService service) {
    this.service = service;
  }

  @GetMapping("/futuros")
  List<AppointmentResponse> listFuture() {
    return service.listFuture();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  AppointmentResponse create(@Valid @RequestBody CreateAppointmentRequest request) {
    return service.create(request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@PathVariable UUID id) {
    service.delete(id);
  }
}
