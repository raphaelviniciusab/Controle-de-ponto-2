import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, Clock, TrendingUp, Download, Users } from "lucide-react";
import api from "../services/api";
import { format, isValid } from "date-fns";
import StatCard from "../components/ui/StatCard";
import { formatLabel, formatDate, formatTime, getTimestamp, getEntryType } from "../utils/formatters";
import { computeTotalHours } from "../utils/timeCalculator";

export default function Relatorios() {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await api.get("/users");
      const data = res.data?.data || res.data || [];
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  }

  async function handleSearch(e) {
    e?.preventDefault();

    if (!selectedUser) {
      setError("Selecione um funcionário");
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      setError("A data de início deve ser anterior à data de fim");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get("/time/history", {
        params: { startDate, endDate },
      });
      const allData = res.data?.data || res.data || [];
      
      // Filtrar por usuário selecionado
      const filtered = allData.filter((e) => e.userId == selectedUser);
      setEntries(filtered);
    } catch (err) {
      console.error("Failed to fetch entries", err);
      setError(err?.response?.data?.error || "Erro ao buscar registros");
    } finally {
      setLoading(false);
    }
  }

  function handleExportCSV() {
    if (entries.length === 0) return;

    const csvContent = [
      ["Data", "Horário", "Tipo"],
      ...entries.map((entry) => {
        const timestamp = new Date(getTimestamp(entry));
        return [
          isValid(timestamp) ? formatDate(timestamp) : "-",
          isValid(timestamp) ? formatTime(timestamp) : "-",
          formatLabel(getEntryType(entry)),
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio-${selectedUser}-${startDate}_${endDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Cálculos
  const totalMs = useMemo(() => computeTotalHours(entries), [entries]);
  const totalHours = Math.floor(totalMs / 3600000);
  const totalMinutes = Math.floor((totalMs % 3600000) / 60000);

  // Calcular pausas
  const pauseMs = useMemo(() => {
    if (!entries || entries.length === 0) return 0;

    const sorted = [...entries].sort(
      (a, b) => new Date(getTimestamp(a)) - new Date(getTimestamp(b))
    );

    let total = 0;

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      const currentType = getEntryType(current);
      const nextType = getEntryType(next);

      if (currentType === "PAUSE" && (nextType === "RETURN" || nextType === "RESUME")) {
        const timeA = new Date(getTimestamp(current));
        const timeB = new Date(getTimestamp(next));

        if (isValid(timeA) && isValid(timeB) && timeB > timeA) {
          total += timeB - timeA;
        }
      }
    }

    return total;
  }, [entries]);

  const pauseHours = Math.floor(pauseMs / 3600000);
  const pauseMinutes = Math.floor((pauseMs % 3600000) / 60000);

  const workDays = useMemo(() => {
    const dates = new Set();
    entries.forEach((entry) => {
      const date = new Date(getTimestamp(entry));
      if (isValid(date)) {
        dates.add(date.toDateString());
      }
    });
    return dates.size;
  }, [entries]);

  const selectedUserData = users.find((u) => u.id == selectedUser);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Relatórios de Horas</h2>
        <p className="text-gray-600 mt-1">
          Visualize e exporte relatórios detalhados de horas trabalhadas
        </p>
      </div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Funcionário
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                required
              >
                <option value="">-- Selecione um funcionário --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data Fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={entries.length === 0}
              className="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? "Buscando..." : "Buscar"}</span>
            </button>
          </div>
        </form>
      </motion.div>

      {/* Stats */}
      {entries.length > 0 && selectedUserData && (
        <>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-lg">
                  {(selectedUserData.name || selectedUserData.email || "?")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedUserData.name || "Sem nome"}</h3>
                <p className="text-sm text-gray-600">{selectedUserData.email}</p>
                {selectedUserData.cargo && (
                  <p className="text-xs text-gray-500">{selectedUserData.cargo}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon={Clock}
              title="Total de Registros"
              value={entries.length}
              subtitle="pontos no período"
              color="indigo"
            />
            <StatCard
              icon={TrendingUp}
              title="Horas Trabalhadas"
              value={`${totalHours}h ${totalMinutes}m`}
              subtitle="tempo total efetivo"
              color="green"
            />
            <StatCard
              icon={Clock}
              title="Tempo em Pausa"
              value={`${pauseHours}h ${pauseMinutes}m`}
              subtitle="pausas no período"
              color="yellow"
            />
            <StatCard
              icon={Calendar}
              title="Dias Trabalhados"
              value={workDays}
              subtitle="dias no período"
              color="blue"
            />
          </div>
        </>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      Nenhum registro encontrado para o período selecionado
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Selecione um funcionário e período para visualizar os dados
                    </p>
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => {
                  const timestamp = new Date(getTimestamp(entry));
                  const dateStr = isValid(timestamp) ? formatDate(timestamp) : "-";
                  const timeStr = isValid(timestamp) ? formatTime(timestamp) : "-";
                  const type = getEntryType(entry);
                  const label = formatLabel(type);

                  const statusColors = {
                    IN: "bg-green-100 text-green-700 border-green-200",
                    PAUSE: "bg-yellow-100 text-yellow-700 border-yellow-200",
                    RETURN: "bg-blue-100 text-blue-700 border-blue-200",
                    RESUME: "bg-blue-100 text-blue-700 border-blue-200",
                    OUT: "bg-red-100 text-red-700 border-red-200",
                  };

                  return (
                    <motion.tr
                      key={entry.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{dateStr}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-mono font-semibold text-gray-900">
                            {timeStr}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                            statusColors[type] || "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
