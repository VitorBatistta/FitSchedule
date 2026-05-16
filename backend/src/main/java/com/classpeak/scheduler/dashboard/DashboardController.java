package com.classpeak.scheduler.dashboard;

import com.classpeak.scheduler.appointments.AppointmentService;
import com.classpeak.scheduler.dashboard.DashboardDtos.DashboardResponse;
import com.classpeak.scheduler.students.StudentRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
  private final StudentRepository studentRepository;
  private final AppointmentService appointmentService;

  public DashboardController(StudentRepository studentRepository, AppointmentService appointmentService) {
    this.studentRepository = studentRepository;
    this.appointmentService = appointmentService;
  }

  @GetMapping
  DashboardResponse dashboard() {
    var upcoming = appointmentService.listFuture().stream().limit(8).toList();
    return new DashboardResponse(studentRepository.count(), appointmentService.countFuture(), upcoming);
  }
}
