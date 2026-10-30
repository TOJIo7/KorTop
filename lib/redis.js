// Upstash Redis через REST API: https://upstash.com/docs/redis/features/restapi
// Бесплатного тарифа хватает. Адрес и токен только из process.env
const TIMEOUT_MS = 10_000;

export function hasRedis() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// Одна команда: redis("SET", "key", "value", "EX", 3600) → result
export async function redis(...command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN не заданы");

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(command.map(String)),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = await res.json();
  if (!res.ok || body.error) throw new Error(`redis: ${body.error ?? res.status}`);
  return body.result;
}
