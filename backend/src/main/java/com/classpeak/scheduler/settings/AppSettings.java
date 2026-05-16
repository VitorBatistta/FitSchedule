package com.classpeak.scheduler.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "app_settings")
public class AppSettings {
  @Id
  private Short id = 1;

  @Column(name = "webhook_url")
  private String webhookUrl;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();

  public Short getId() {
    return id;
  }

  public String getWebhookUrl() {
    return webhookUrl;
  }

  public void setWebhookUrl(String webhookUrl) {
    this.webhookUrl = webhookUrl;
    this.updatedAt = Instant.now();
  }
}
