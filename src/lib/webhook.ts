import { supabase } from "@/integrations/supabase/client";

export async function getWebhookUrl(): Promise<string> {
  const { data } = await supabase.from("app_config").select("webhook_url").eq("id", 1).maybeSingle();
  return data?.webhook_url ?? "";
}

export async function setWebhookUrl(url: string) {
  const { error } = await supabase
    .from("app_config")
    .upsert({ id: 1, webhook_url: url, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function sendToWebhook(payload: Record<string, unknown>) {
  const url = await getWebhookUrl();
  if (!url) return { sent: false, reason: "no_webhook_configured" as const };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: "no-cors",
    });
    return { sent: true, status: res.status };
  } catch (err) {
    console.error("Webhook error:", err);
    return { sent: false, reason: "fetch_failed" as const };
  }
}
