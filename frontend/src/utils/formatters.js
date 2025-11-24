/**
 * Utilitários de formatação
 */

export function formatLabel(type) {
  const labels = {
    IN: "Entrada",
    PAUSE: "Pausa",
    RESUME: "Retorno",
    RETURN: "Retorno",
    OUT: "Saída",
  };
  return labels[type] || type;
}

export function msToHoursMinutes(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function getTimestamp(entry) {
  return entry.createdAt || entry.created_at || entry.date || entry.timestamp;
}

export function getEntryType(entry) {
  return (entry.type || entry.typeName || "").toUpperCase();
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
