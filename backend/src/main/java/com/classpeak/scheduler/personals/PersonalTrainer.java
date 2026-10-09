package com.classpeak.scheduler.personals;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "personal_trainers")
public class PersonalTrainer {
  @Id
  @GeneratedValue
  @UuidGenerator
  private UUID id;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(nullable = false, length = 160, unique = true)
  private String email;

  @Column(nullable = false, length = 30)
  private String whatsapp;

  @Column(name = "password_hash", length = 100)
  private String passwordHash;

  @Column(name = "can_manage_students", nullable = false)
  private boolean canManageStudents = true;

  @Column(name = "can_manage_appointments", nullable = false)
  private boolean canManageAppointments = true;

  @Column(nullable = false)
  private boolean active = true;

  @Column(nullable = false)
  private boolean admin = false;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  void onCreate() {
    var now = Instant.now();
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = Instant.now();
  }

  public UUID getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getWhatsapp() {
    return whatsapp;
  }

  public void setWhatsapp(String whatsapp) {
    this.whatsapp = whatsapp;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public boolean isCanManageStudents() {
    return canManageStudents;
  }

  public void setCanManageStudents(boolean canManageStudents) {
    this.canManageStudents = canManageStudents;
  }

  public boolean isCanManageAppointments() {
    return canManageAppointments;
  }

  public void setCanManageAppointments(boolean canManageAppointments) {
    this.canManageAppointments = canManageAppointments;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  public boolean isAdmin() {
    return admin;
  }

  public void setAdmin(boolean admin) {
    this.admin = admin;
  }
}
