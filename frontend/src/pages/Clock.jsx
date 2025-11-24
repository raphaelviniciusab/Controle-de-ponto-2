import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Clock as ClockIcon, Activity } from "lucide-react";
import ClockButton from "../components/ClockButton";
import StatCard from "../components/ui/StatCard";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { formatTime, formatLabel, getTimestamp, getEntryType } from "../utils/formatters";
import { filterTodayEntries, computeTotalHours } from "../utils/timeCalculator";

export default function Clock() {
  const { user } = useAuth();
  const [todaysEntries, setTodaysEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get("/time/history");
      const data = res.data?.data || res.data || [];
      const filtered = filterTodayEntries(data);
      setTodaysEntries(filtered);
    } catch (err) {
      console.error("Failed to fetch today entries", err);
      setError("Erro ao carregar registros. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  async function handleClock(type) {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.post("/time/clock-in", { type });
      
      if (res.data?.success) {
        await fetchToday();
      } else {
        setError(res.data?.error || "Erro ao registrar ponto");
      }
    } catch (err) {
      console.error("Clock-in failed", err);
      const errorMsg = err?.response?.data?.error || "Erro ao registrar ponto. Tente novamente.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  // Determinar qual botão habilitar
  const last = todaysEntries[todaysEntries.length - 1] || null;
  const lastType = last ? getEntryType(last) : null;

  const enabled = useMemo(() => ({
    IN: !lastType || lastType === "OUT",
    PAUSE: lastType === "IN" || lastType === "RETURN" || lastType === "RESUME",
    RETURN: lastType === "PAUSE",
    OUT: lastType === "IN" || lastType === "RETURN" || lastType === "RESUME",
  }), [lastType]);

  // Calcular estatísticas
  const totalMs = useMemo(() => computeTotalHours(todaysEntries), [todaysEntries]);
  const totalHours = Math.floor(totalMs / 3600000);
  const totalMinutes = Math.floor((totalMs % 3600000) / 60000);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={ClockIcon}
          title="Registros Hoje"
          value={todaysEntries.length}
          subtitle="pontos registrados"
          color="indigo"
        />
        <StatCard
          icon={Activity}
          title="Horas Trabalhadas"
          value={`${totalHours}h ${totalMinutes}m`}
          subtitle="tempo total"
          color="green"
        />
        <StatCard
          icon={ClockIcon}
          title="Status Atual"
          value={lastType ? formatLabel(lastType) : "Início"}
          subtitle={last ? formatTime(getTimestamp(last)) : "Registre seu ponto"}
          color={
            lastType === "IN" || lastType === "RETURN" || lastType === "RESUME"
              ? "green"
              : lastType === "PAUSE"
              ? "yellow"
              : "blue"
          }
        />
      </div>

      {/* Clock Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Registrar Ponto</h3>
          <button
            onClick={fetchToday}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Atualizar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ClockButton
            type="IN"
            label="Entrada"
            onClick={() => handleClock("IN")}
            disabled={!enabled.IN || loading}
          />
          <ClockButton
            type="PAUSE"
            label="Pausa"
            onClick={() => handleClock("PAUSE")}
            disabled={!enabled.PAUSE || loading}
          />
          <ClockButton
            type="RETURN"
            label="Retorno"
            onClick={() => handleClock("RETURN")}
            disabled={!enabled.RETURN || loading}
          />
          <ClockButton
            type="OUT"
            label="Saída"
            onClick={() => handleClock("OUT")}
            disabled={!enabled.OUT || loading}
          />
        </div>
      </motion.div>

      {/* Today's Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Registros de Hoje</h3>
        
        {todaysEntries.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum registro hoje ainda.</p>
            <p className="text-sm text-gray-400 mt-1">Registre sua entrada para começar.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todaysEntries.map((entry, idx) => {
              const timestamp = new Date(getTimestamp(entry));
              const time = formatTime(timestamp);
              const type = getEntryType(entry);
              const label = formatLabel(type);

              const colorClasses = {
                IN: "bg-green-50 border-green-200 text-green-700",
                PAUSE: "bg-yellow-50 border-yellow-200 text-yellow-700",
                RETURN: "bg-blue-50 border-blue-200 text-blue-700",
                RESUME: "bg-blue-50 border-blue-200 text-blue-700",
                OUT: "bg-red-50 border-red-200 text-red-700",
              };

              return (
                <motion.div
                  key={entry.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    colorClasses[type] || "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-current" />
                    <span className="font-semibold text-lg">{label}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl font-bold">{time}</div>
                    <div className="text-xs opacity-75">
                      {timestamp.toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
