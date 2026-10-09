package com.classpeak.scheduler.personals;

import com.classpeak.scheduler.common.BusinessException;
import com.classpeak.scheduler.personals.PersonalTrainerDtos.PersonalLoginRequest;
import com.classpeak.scheduler.personals.PersonalTrainerDtos.PersonalSessionResponse;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PersonalAuthService {
  private final PersonalTrainerRepository repository;
  private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  public PersonalAuthService(PersonalTrainerRepository repository) {
    this.repository = repository;
  }

  @Transactional(readOnly = true)
  public PersonalSessionResponse login(PersonalLoginRequest request) {
    var personal = repository.findByEmailIgnoreCase(request.email().trim().toLowerCase())
      .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos"));

    if (!personal.isActive()) {
      throw new BusinessException(HttpStatus.FORBIDDEN, "Cadastro do personal está inativo");
    }

    if (personal.getPasswordHash() == null || !passwordEncoder.matches(request.password(), personal.getPasswordHash())) {
      throw new BusinessException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos");
    }

    return PersonalSessionResponse.from(personal);
  }

  @Transactional(readOnly = true)
  public PersonalTrainer requirePermission(UUID personalId, Permission permission) {
    if (personalId == null) {
      throw new BusinessException(HttpStatus.UNAUTHORIZED, "Sessão inválida");
    }

    var personal = repository.findById(personalId)
      .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "Sessão inválida"));

    if (!personal.isActive()) {
      throw new BusinessException(HttpStatus.FORBIDDEN, "Cadastro do personal está inativo");
    }

    if (personal.isAdmin()) {
      return personal;
    }

    if (permission == Permission.STUDENTS && !personal.isCanManageStudents()) {
      throw new BusinessException(HttpStatus.FORBIDDEN, "Personal não tem permissão para gerenciar alunos");
    }

    if (permission == Permission.APPOINTMENTS && !personal.isCanManageAppointments()) {
      throw new BusinessException(HttpStatus.FORBIDDEN, "Personal não tem permissão para gerenciar agendamentos");
    }

    return personal;
  }

  @Transactional(readOnly = true)
  public PersonalTrainer requireAdmin(UUID personalId) {
    if (personalId == null) {
      throw new BusinessException(HttpStatus.UNAUTHORIZED, "Sessão inválida");
    }

    var personal = repository.findById(personalId)
      .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "Sessão inválida"));

    if (!personal.isActive()) {
      throw new BusinessException(HttpStatus.FORBIDDEN, "Cadastro do personal está inativo");
    }

    if (!personal.isAdmin()) {
      throw new BusinessException(HttpStatus.FORBIDDEN, "Apenas administradores podem realizar esta ação");
    }

    return personal;
  }

  public enum Permission {
    STUDENTS,
    APPOINTMENTS
  }
}
