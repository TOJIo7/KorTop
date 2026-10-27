import { connection } from "next/server";
import { getRubToSomoni } from "./rates";

// Курс или null. Если API курса не ответил во время сборки, connection() откладывает
// этот кусок страницы до настоящего запроса — ошибка не «застынет» в готовом HTML.
// Вызывать внутри <Suspense>.
export async function getRateOrNull() {
  try {
    return await getRubToSomoni();
  } catch {
    await connection();
    return null;
  }
}
