package com.classpeak.scheduler.personals;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonalTrainerRepository extends JpaRepository<PersonalTrainer, UUID> {
  List<PersonalTrainer> findAllByOrderByNameAsc();

  Optional<PersonalTrainer> findByEmailIgnoreCase(String email);

  boolean existsByEmailIgnoreCase(String email);
}
