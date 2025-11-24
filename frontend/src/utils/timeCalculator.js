import { isValid } from "date-fns";
import { getTimestamp, getEntryType } from "./formatters";

/**
 * Calcula o total de horas trabalhadas baseado nos registros
 * @param {Array} entries - Lista de registros de ponto
 * @returns {number} Total em milissegundos
 */
export function computeTotalHours(entries) {
  if (!entries || entries.length === 0) return 0;

  const sorted = [...entries].sort(
    (a, b) => new Date(getTimestamp(a)) - new Date(getTimestamp(b))
  );

  let total = 0;
  const startTypes = ["IN", "RETURN", "RESUME"];
  const endTypes = ["PAUSE", "OUT"];

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const currentType = getEntryType(current);
    const nextType = getEntryType(next);

    if (startTypes.includes(currentType) && endTypes.includes(nextType)) {
      const timeA = new Date(getTimestamp(current));
      const timeB = new Date(getTimestamp(next));

      if (isValid(timeA) && isValid(timeB) && timeB > timeA) {
        total += timeB - timeA;
      }
    }
  }

  return total;
}

/**
 * Filtra registros do dia atual
 * @param {Array} entries - Lista de registros
 * @returns {Array} Registros do dia
 */
export function filterTodayEntries(entries) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return entries
    .filter((e) => {
      const t = new Date(getTimestamp(e));
      return t >= start && t <= end;
    })
    .sort((a, b) => new Date(getTimestamp(a)) - new Date(getTimestamp(b)));
}
