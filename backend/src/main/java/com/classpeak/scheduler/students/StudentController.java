package com.classpeak.scheduler.students;

import com.classpeak.scheduler.personals.PersonalAuthService;
import com.classpeak.scheduler.personals.PersonalAuthService.Permission;
import com.classpeak.scheduler.students.StudentDtos.StudentRequest;
import com.classpeak.scheduler.students.StudentDtos.StudentResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alunos")
public class StudentController {
  private final StudentService service;
  private final PersonalAuthService authService;

  public StudentController(StudentService service, PersonalAuthService authService) {
    this.service = service;
    this.authService = authService;
  }

  @GetMapping
  List<StudentResponse> list(@RequestHeader("X-Personal-Id") UUID personalId) {
    authService.requirePermission(personalId, Permission.STUDENTS);
    return service.list();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  StudentResponse create(@RequestHeader("X-Personal-Id") UUID personalId, @Valid @RequestBody StudentRequest request) {
    authService.requirePermission(personalId, Permission.STUDENTS);
    return service.create(request);
  }

  @PutMapping("/{id}")
  StudentResponse update(@RequestHeader("X-Personal-Id") UUID personalId, @PathVariable UUID id, @Valid @RequestBody StudentRequest request) {
    authService.requirePermission(personalId, Permission.STUDENTS);
    return service.update(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@RequestHeader("X-Personal-Id") UUID personalId, @PathVariable UUID id) {
    authService.requirePermission(personalId, Permission.STUDENTS);
    service.delete(id);
  }
}
