package com.classpeak.scheduler.dashboard;

import com.classpeak.scheduler.appointments.AppointmentService;
import com.classpeak.scheduler.dashboard.DashboardDtos.DashboardResponse;
import com.classpeak.scheduler.personals.PersonalAuthService;
import com.classpeak.scheduler.students.StudentRepository;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
  private final StudentRepository studentRepository;
  private final AppointmentService appointmentService;
  private final PersonalAuthService authService;

  public DashboardController(
    StudentRepository studentRepository,
    AppointmentService appointmentService,
    PersonalAuthService authService
  ) {
    this.studentRepository = studentRepository;
    this.appointmentService = appointmentService;
    this.authService = authService;
  }

  @GetMapping
  DashboardResponse dashboard(@RequestHeader("X-Personal-Id") UUID personalId) {
    authService.requireAdmin(personalId);
    var upcoming = appointmentService.listFuture().stream().limit(8).toList();
    return new DashboardResponse(studentRepository.count(), appointmentService.countFuture(), upcoming);
  }
}
