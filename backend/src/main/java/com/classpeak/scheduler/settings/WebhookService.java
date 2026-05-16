package com.classpeak.scheduler.settings;

import com.classpeak.scheduler.common.BusinessException;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

@Service
public class WebhookService {
  private static final short SETTINGS_ID = 1;

  private final AppSettingsRepository repository;
  private final RestClient restClient;

  public WebhookService(AppSettingsRepository repository, RestClient.Builder builder) {
    this.repository = repository;
    this.restClient = builder.build();
  }

  @Transactional(readOnly = true)
  public String getWebhookUrl() {
    return settings().getWebhookUrl();
  }

  @Transactional
  public void setWebhookUrl(String url) {
    settings().setWebhookUrl(url == null ? "" : url.trim());
  }

  @Transactional(readOnly = true)
  public WebhookResult send(Map<String, Object> payload) {
    var url = getWebhookUrl();
    if (url == null || url.isBlank()) {
      return new WebhookResult(false, "no_webhook_configured");
    }

    try {
      restClient.post()
        .uri(url)
        .contentType(MediaType.APPLICATION_JSON)
        .body(payload)
        .retrieve()
        .toBodilessEntity();
      return new WebhookResult(true, null);
    } catch (RuntimeException ex) {
      return new WebhookResult(false, "fetch_failed");
    }
  }

  public WebhookResult sendTest() {
    return send(Map.of(
      "event", "test",
      "message", "Teste do FitSchedule",
      "at", java.time.Instant.now().toString()
    ));
  }

  private AppSettings settings() {
    return repository.findById(SETTINGS_ID)
      .orElseThrow(() -> new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "Configuração da aplicação não encontrada"));
  }

  public record WebhookResult(boolean sent, String reason) {}
}
