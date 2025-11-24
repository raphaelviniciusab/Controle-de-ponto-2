import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Check,
  X as XIcon,
} from "lucide-react";
import api from "../services/api";
import StatCard from "../components/ui/StatCard";

export default function Funcionarios() {
  const navigate = useNavigate();
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadFuncionarios();
  }, []);

  async function loadFuncionarios() {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/users");
      const data = res.data?.data || res.data || [];
      setFuncionarios(data);
    } catch (err) {
      console.error("Failed to load funcionarios", err);
      setError("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja realmente desativar este funcionário?")) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      setFuncionarios((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Failed to delete funcionario", err);
      alert("Erro ao desativar funcionário");
    }
  }

  const filteredFuncionarios = funcionarios.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = funcionarios.filter((f) => f.status !== "INATIVO").length;
  const inactiveCount = funcionarios.length - activeCount;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Funcionários</h2>
          <p className="text-gray-600 mt-1">
            Gerencie todos os funcionários cadastrados
          </p>
        </div>
        <button
          onClick={() => navigate("/funcionarios/novo")}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg"
        >
          <UserPlus className="w-5 h-5" />
          <span>Novo Funcionário</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          title="Total de Funcionários"
          value={funcionarios.length}
          subtitle="cadastrados"
          color="indigo"
        />
        <StatCard
          icon={Check}
          title="Ativos"
          value={activeCount}
          subtitle="funcionários ativos"
          color="green"
        />
        <StatCard
          icon={XIcon}
          title="Inativos"
          value={inactiveCount}
          subtitle="funcionários inativos"
          color="red"
        />
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
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
                  Funcionário
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : filteredFuncionarios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      {searchTerm
                        ? "Nenhum funcionário encontrado"
                        : "Nenhum funcionário cadastrado"}
                    </p>
                    <button
                      onClick={() => navigate("/funcionarios/novo")}
                      className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Cadastrar primeiro funcionário
                    </button>
                  </td>
                </tr>
              ) : (
                filteredFuncionarios.map((funcionario, idx) => (
                  <motion.tr
                    key={funcionario.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-indigo-600 font-semibold">
                            {(funcionario.name || funcionario.email || "?")[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {funcionario.name || "Sem nome"}
                          </div>
                          {funcionario.cpf && (
                            <div className="text-xs text-gray-500">
                              CPF: {funcionario.cpf}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {funcionario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {funcionario.cargo || "Não definido"}
                      </span>
                      {funcionario.horarioPadrao && (
                        <div className="text-xs text-gray-500">
                          {funcionario.horarioPadrao}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                          funcionario.status === "INATIVO"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : funcionario.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : "bg-green-100 text-green-700 border-green-200"
                        }`}
                      >
                        {funcionario.status === "INATIVO"
                          ? "Inativo"
                          : funcionario.role === "ADMIN"
                          ? "Admin"
                          : "Ativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => navigate(`/funcionarios/editar/${funcionario.id}`)}
                        className="inline-flex items-center px-3 py-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(funcionario.id)}
                        className="inline-flex items-center px-3 py-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Desativar
                      </button>
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
