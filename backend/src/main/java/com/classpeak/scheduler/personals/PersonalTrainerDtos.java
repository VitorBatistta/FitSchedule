package com.classpeak.scheduler.personals;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public final class PersonalTrainerDtos {
  private PersonalTrainerDtos() {}

  public record PersonalTrainerRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Email @Size(max = 160) String email,
    @NotBlank @Size(max = 30) String whatsapp,
    @Size(min = 6, max = 80) String password,
    boolean canManageStudents,
    boolean canManageAppointments,
    boolean admin,
    boolean active
  ) {}

  public record PersonalLoginRequest(
    @NotBlank @Email @Size(max = 160) String email,
    @NotBlank @Size(max = 80) String password
  ) {}

  public record PersonalTrainerResponse(
    UUID id,
    String name,
    String email,
    String whatsapp,
    boolean canManageStudents,
    boolean canManageAppointments,
    boolean admin,
    boolean active
  ) {
    static PersonalTrainerResponse from(PersonalTrainer personal) {
      return new PersonalTrainerResponse(
        personal.getId(),
        personal.getName(),
        personal.getEmail(),
        personal.getWhatsapp(),
        personal.isCanManageStudents(),
        personal.isCanManageAppointments(),
        personal.isAdmin(),
        personal.isActive()
      );
    }
  }

  public record PersonalSessionResponse(
    @NotNull UUID id,
    String name,
    String email,
    boolean canManageStudents,
    boolean canManageAppointments,
    boolean admin
  ) {
    static PersonalSessionResponse from(PersonalTrainer personal) {
      return new PersonalSessionResponse(
        personal.getId(),
        personal.getName(),
        personal.getEmail(),
        personal.isCanManageStudents(),
        personal.isCanManageAppointments(),
        personal.isAdmin()
      );
    }
  }
}
