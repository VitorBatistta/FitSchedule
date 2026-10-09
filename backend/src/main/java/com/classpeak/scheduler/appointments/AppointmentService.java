package com.classpeak.scheduler.appointments;

import com.classpeak.scheduler.appointments.AppointmentDtos.AppointmentResponse;
import com.classpeak.scheduler.appointments.AppointmentDtos.CreateAppointmentRequest;
import com.classpeak.scheduler.common.BusinessException;
import com.classpeak.scheduler.settings.WebhookService;
import com.classpeak.scheduler.students.StudentService;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppointmentService {
  private static final long CLASS_DURATION_MINUTES = 60;
  private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");
  private static final DateTimeFormatter LOCAL_FORMATTER =
    DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", new Locale("pt", "BR")).withZone(BUSINESS_ZONE);

  private final AppointmentRepository repository;
  private final StudentService studentService;
  private final WebhookService webhookService;

  public AppointmentService(
    AppointmentRepository repository,
    StudentService studentService,
    WebhookService webhookService
  ) {
    this.repository = repository;
    this.studentService = studentService;
    this.webhookService = webhookService;
  }

  @Transactional(readOnly = true)
  public List<AppointmentResponse> listFuture() {
    return repository.findAllByScheduledAtGreaterThanEqualOrderByScheduledAtAsc(Instant.now()).stream()
      .map(AppointmentResponse::from)
      .toList();
  }

  @Transactional(readOnly = true)
  public List<AppointmentResponse> listByYear(int year) {
    var start = ZonedDateTime.of(year, 1, 1, 0, 0, 0, 0, BUSINESS_ZONE).toInstant();
    var end = ZonedDateTime.of(year + 1, 1, 1, 0, 0, 0, 0, BUSINESS_ZONE).toInstant();
    return repository.findAllByScheduledAtGreaterThanEqualAndScheduledAtLessThanOrderByScheduledAtAsc(start, end).stream()
      .map(AppointmentResponse::from)
      .toList();
  }

  @Transactional(readOnly = true)
  public long countFuture() {
    return repository.countByScheduledAtGreaterThanEqual(Instant.now());
  }

  @Transactional
  public AppointmentResponse create(CreateAppointmentRequest request) {
    if (!request.scheduledAt().isAfter(Instant.now())) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "Não é possível agendar no passado");
    }

    var conflictWindowStart = request.scheduledAt().minusSeconds((CLASS_DURATION_MINUTES * 60) - 1);
    var conflictWindowEnd = request.scheduledAt().plusSeconds(CLASS_DURATION_MINUTES * 60);

    repository.findFirstByScheduledAtGreaterThanAndScheduledAtLessThanOrderByScheduledAtAsc(conflictWindowStart, conflictWindowEnd).ifPresent(existing -> {
      throw new BusinessException(
        HttpStatus.CONFLICT,
        "Já existe agendamento com " + existing.getStudent().getName() + " neste horário"
      );
    });

    var student = studentService.find(request.studentId());
    var appointment = new Appointment();
    appointment.setStudent(student);
    appointment.setScheduledAt(request.scheduledAt());

    try {
      var saved = repository.saveAndFlush(appointment);
      webhookService.send(Map.of(
        "event", "agendamento.criado",
        "agendamento_id", saved.getId().toString(),
        "nome", student.getName(),
        "whatsapp", student.getWhatsapp(),
        "data_hora_agendamento", saved.getScheduledAt().toString(),
        "data_hora_local", LOCAL_FORMATTER.format(saved.getScheduledAt())
      ));
      return AppointmentResponse.from(saved);
    } catch (DataIntegrityViolationException ex) {
      throw new BusinessException(HttpStatus.CONFLICT, "Já existe outro agendamento neste exato horário");
    }
  }

  @Transactional
  public void delete(UUID id) {
    if (!repository.existsById(id)) {
      throw new BusinessException(HttpStatus.NOT_FOUND, "Agendamento não encontrado");
    }
    repository.deleteById(id);
  }
}
