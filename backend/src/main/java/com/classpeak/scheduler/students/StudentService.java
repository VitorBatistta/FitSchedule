package com.classpeak.scheduler.students;

import com.classpeak.scheduler.common.BusinessException;
import com.classpeak.scheduler.students.StudentDtos.StudentRequest;
import com.classpeak.scheduler.students.StudentDtos.StudentResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {
  private final StudentRepository repository;

  public StudentService(StudentRepository repository) {
    this.repository = repository;
  }

  @Transactional(readOnly = true)
  public List<StudentResponse> list() {
    return repository.findAllByOrderByNameAsc().stream().map(StudentResponse::from).toList();
  }

  @Transactional
  public StudentResponse create(StudentRequest request) {
    var student = new Student();
    apply(request, student);
    return StudentResponse.from(repository.save(student));
  }

  @Transactional
  public StudentResponse update(UUID id, StudentRequest request) {
    var student = find(id);
    apply(request, student);
    return StudentResponse.from(student);
  }

  @Transactional
  public void delete(UUID id) {
    if (!repository.existsById(id)) {
      throw new BusinessException(HttpStatus.NOT_FOUND, "Aluno não encontrado");
    }
    repository.deleteById(id);
  }

  public Student find(UUID id) {
    return repository.findById(id)
      .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Aluno não encontrado"));
  }

  private void apply(StudentRequest request, Student student) {
    student.setName(request.name().trim());
    student.setWhatsapp(request.whatsapp().trim());
    student.setBirthDate(request.birthDate());
  }
}
