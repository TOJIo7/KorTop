import { connection } from "next/server";
import { getRubToSomoni } from "./rates";

// Курс или null. Вызывать внутри <Suspense>.
// connection() — первым: при сборке к API не идём. Ошибка внутри "use cache" роняет сборку
// даже через try/catch, а с серверов Vercel API может не ответить
export async function getRateOrNull() {
  await connection();
  try {
    return await getRubToSomoni();
  } catch {
    return null;
  }
}
