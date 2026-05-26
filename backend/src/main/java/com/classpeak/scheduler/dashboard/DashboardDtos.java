package com.classpeak.scheduler.dashboard;

import com.classpeak.scheduler.appointments.AppointmentDtos.AppointmentResponse;
import java.util.List;

public final class DashboardDtos {
  private DashboardDtos() {}

  public record DashboardResponse(long students, long futureAppointments, List<AppointmentResponse> upcoming) {}
}
