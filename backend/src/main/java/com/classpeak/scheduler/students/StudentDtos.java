package com.classpeak.scheduler.students;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public final class StudentDtos {
  private StudentDtos() {}

  public record StudentRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Size(max = 30) String whatsapp,
    LocalDate birthDate
  ) {}

  public record StudentResponse(UUID id, String name, String whatsapp, LocalDate birthDate) {
    static StudentResponse from(Student student) {
      return new StudentResponse(student.getId(), student.getName(), student.getWhatsapp(), student.getBirthDate());
    }
  }
}
