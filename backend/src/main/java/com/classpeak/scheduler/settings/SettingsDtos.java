package com.classpeak.scheduler.settings;

import jakarta.validation.constraints.Size;

public final class SettingsDtos {
  private SettingsDtos() {}

  public record WebhookUrlRequest(@Size(max = 2000) String webhookUrl) {}

  public record WebhookUrlResponse(String webhookUrl) {}
}
