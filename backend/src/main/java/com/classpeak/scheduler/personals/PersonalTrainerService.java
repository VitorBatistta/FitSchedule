package com.classpeak.scheduler.personals;

import com.classpeak.scheduler.common.BusinessException;
import com.classpeak.scheduler.personals.PersonalTrainerDtos.PersonalTrainerRequest;
import com.classpeak.scheduler.personals.PersonalTrainerDtos.PersonalTrainerResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PersonalTrainerService {
  private final PersonalTrainerRepository repository;
  private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  public PersonalTrainerService(PersonalTrainerRepository repository) {
    this.repository = repository;
  }

  @Transactional(readOnly = true)
  public List<PersonalTrainerResponse> list() {
    return repository.findAllByOrderByNameAsc().stream().map(PersonalTrainerResponse::from).toList();
  }

  @Transactional
  public PersonalTrainerResponse create(PersonalTrainerRequest request) {
    var email = normalizedEmail(request.email());
    if (repository.existsByEmailIgnoreCase(email)) {
      throw new BusinessException(HttpStatus.CONFLICT, "Já existe personal cadastrado com este e-mail");
    }

    var personal = new PersonalTrainer();
    apply(request, personal);
    if (repository.count() == 0) {
      personal.setAdmin(true);
      personal.setCanManageStudents(true);
      personal.setCanManageAppointments(true);
    }
    return PersonalTrainerResponse.from(repository.save(personal));
  }

  @Transactional
  public PersonalTrainerResponse update(UUID id, PersonalTrainerRequest request) {
    var personal = find(id);
    var email = normalizedEmail(request.email());
    repository.findByEmailIgnoreCase(email)
      .filter(existing -> !existing.getId().equals(id))
      .ifPresent(existing -> {
        throw new BusinessException(HttpStatus.CONFLICT, "Já existe personal cadastrado com este e-mail");
      });

    apply(request, personal);
    return PersonalTrainerResponse.from(personal);
  }

  @Transactional
  public void delete(UUID id) {
    if (!repository.existsById(id)) {
      throw new BusinessException(HttpStatus.NOT_FOUND, "Personal não encontrado");
    }
    repository.deleteById(id);
  }

  private PersonalTrainer find(UUID id) {
    return repository.findById(id)
      .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Personal não encontrado"));
  }

  private void apply(PersonalTrainerRequest request, PersonalTrainer personal) {
    personal.setName(request.name().trim());
    personal.setEmail(normalizedEmail(request.email()));
    personal.setWhatsapp(request.whatsapp().trim());
    if (request.password() != null && !request.password().isBlank()) {
      personal.setPasswordHash(passwordEncoder.encode(request.password()));
    } else if (personal.getPasswordHash() == null) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "Senha é obrigatória para novo personal");
    }
    personal.setCanManageStudents(request.canManageStudents());
    personal.setCanManageAppointments(request.canManageAppointments());
    personal.setAdmin(request.admin());
    personal.setActive(request.active());
  }

  @Transactional(readOnly = true)
  public boolean hasAnyPersonal() {
    return repository.count() > 0;
  }

  private String normalizedEmail(String email) {
    return email.trim().toLowerCase();
  }
}
