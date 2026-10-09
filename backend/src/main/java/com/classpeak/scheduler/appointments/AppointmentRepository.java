package com.classpeak.scheduler.appointments;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
  boolean existsByScheduledAt(Instant scheduledAt);

  Optional<Appointment> findByScheduledAt(Instant scheduledAt);

  @EntityGraph(attributePaths = "student")
  Optional<Appointment> findFirstByScheduledAtGreaterThanAndScheduledAtLessThanOrderByScheduledAtAsc(
    Instant start,
    Instant end
  );

  long countByScheduledAtGreaterThanEqual(Instant scheduledAt);

  @EntityGraph(attributePaths = "student")
  List<Appointment> findAllByScheduledAtGreaterThanEqualOrderByScheduledAtAsc(Instant scheduledAt);

  @EntityGraph(attributePaths = "student")
  List<Appointment> findAllByScheduledAtGreaterThanEqualAndScheduledAtLessThanOrderByScheduledAtAsc(
    Instant start,
    Instant end
  );
}
