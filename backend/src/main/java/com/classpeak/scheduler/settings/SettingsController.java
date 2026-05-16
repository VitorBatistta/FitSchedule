package com.classpeak.scheduler.settings;

import com.classpeak.scheduler.settings.SettingsDtos.WebhookUrlRequest;
import com.classpeak.scheduler.settings.SettingsDtos.WebhookUrlResponse;
import com.classpeak.scheduler.settings.WebhookService.WebhookResult;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/configuracoes/webhook")
public class SettingsController {
  private final WebhookService webhookService;

  public SettingsController(WebhookService webhookService) {
    this.webhookService = webhookService;
  }

  @GetMapping
  WebhookUrlResponse getWebhookUrl() {
    return new WebhookUrlResponse(webhookService.getWebhookUrl());
  }

  @PutMapping
  WebhookUrlResponse setWebhookUrl(@Valid @RequestBody WebhookUrlRequest request) {
    webhookService.setWebhookUrl(request.webhookUrl());
    return new WebhookUrlResponse(webhookService.getWebhookUrl());
  }

  @PostMapping("/teste")
  WebhookResult testWebhook() {
    return webhookService.sendTest();
  }
}
