package com.classpeak.scheduler.settings;

import com.classpeak.scheduler.personals.PersonalAuthService;
import com.classpeak.scheduler.settings.SettingsDtos.WebhookUrlRequest;
import com.classpeak.scheduler.settings.SettingsDtos.WebhookUrlResponse;
import com.classpeak.scheduler.settings.WebhookService.WebhookResult;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/configuracoes/webhook")
public class SettingsController {
  private final WebhookService webhookService;
  private final PersonalAuthService authService;

  public SettingsController(WebhookService webhookService, PersonalAuthService authService) {
    this.webhookService = webhookService;
    this.authService = authService;
  }

  @GetMapping
  WebhookUrlResponse getWebhookUrl(@RequestHeader("X-Personal-Id") UUID personalId) {
    authService.requireAdmin(personalId);
    return new WebhookUrlResponse(webhookService.getWebhookUrl());
  }

  @PutMapping
  WebhookUrlResponse setWebhookUrl(@RequestHeader("X-Personal-Id") UUID personalId, @Valid @RequestBody WebhookUrlRequest request) {
    authService.requireAdmin(personalId);
    webhookService.setWebhookUrl(request.webhookUrl());
    return new WebhookUrlResponse(webhookService.getWebhookUrl());
  }

  @PostMapping("/teste")
  WebhookResult testWebhook(@RequestHeader("X-Personal-Id") UUID personalId) {
    authService.requireAdmin(personalId);
    return webhookService.sendTest();
  }
}
