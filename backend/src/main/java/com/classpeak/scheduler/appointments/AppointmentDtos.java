package com.classpeak.scheduler.appointments;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public final class AppointmentDtos {
  private AppointmentDtos() {}

  public record CreateAppointmentRequest(
    @NotNull UUID studentId,
    @NotNull @Future Instant scheduledAt
  ) {}

  public record AppointmentResponse(
    UUID id,
    Instant scheduledAt,
    AppointmentStatus status,
    StudentSummary student
  ) {
    static AppointmentResponse from(Appointment appointment) {
      var student = appointment.getStudent();
      return new AppointmentResponse(
        appointment.getId(),
        appointment.getScheduledAt(),
        appointment.getStatus(),
        new StudentSummary(student.getId(), student.getName(), student.getWhatsapp())
      );
    }
  }

  public record StudentSummary(UUID id, String name, String whatsapp) {}
}
