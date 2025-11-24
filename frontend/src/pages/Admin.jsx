import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Users, FileSpreadsheet } from "lucide-react";
import api from "../services/api";
import StatCard from "../components/ui/StatCard";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await api.get("/users");
      const userData = res.data || [];
      setUsers(userData);
      if (userData && userData.length) {
        setUserId(
          userData[0].id || userData[0].userId || userData[0].id.toString()
        );
      }
    } catch (err) {
      console.error("Failed to load users", err);
      setError("Erro ao carregar usuários");
    }
  }

  async function handleExport(e) {
    e.preventDefault();
    
    if (!userId) {
      setError("Selecione um usuário");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await api.get("/reports/csv", {
        params: { userId, startDate, endDate },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-${userId}-${startDate}_ate_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      setError("Erro ao exportar CSV. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Painel Administrativo</h2>
        <p className="text-gray-600 mt-1">
          Gerencie usuários e exporte relatórios de ponto
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          title="Total de Usuários"
          value={users.length}
          subtitle="usuários cadastrados"
          color="indigo"
        />
        <StatCard
          icon={FileSpreadsheet}
          title="Relatórios"
          value="CSV"
          subtitle="formato de exportação"
          color="green"
        />
        <StatCard
          icon={Download}
          title="Exportar"
          value="Dados"
          subtitle="relatório personalizado"
          color="blue"
        />
      </div>

      {/* Export Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6">Exportar Relatório</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleExport} className="space-y-6">
          {/* User Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Selecione o Usuário
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">-- Selecione um usuário --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email || `Usuário ${u.id}`}
                  {u.email && u.name && ` (${u.email})`}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={loading || !userId}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
            >
              <Download className="w-5 h-5" />
              <span>{loading ? "Exportando..." : "Exportar CSV"}</span>
            </button>
          </div>
        </form>
      </motion.div>

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Usuários Cadastrados</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Função
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Nenhum usuário cadastrado
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-indigo-600 font-semibold text-sm">
                            {(user.name || user.email || "U")[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {user.name || "Sem nome"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {user.role || "USER"}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
