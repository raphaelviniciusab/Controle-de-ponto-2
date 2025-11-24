import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, User, Mail, CreditCard, Briefcase, Clock, Key } from "lucide-react";
import api from "../services/api";

export default function FuncionarioForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    cargo: "",
    horarioPadrao: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });

  useEffect(() => {
    if (isEdit) {
      loadFuncionario();
    }
  }, [id]);

  async function loadFuncionario() {
    setLoading(true);
    try {
      const res = await api.get(`/users/${id}`);
      const data = res.data?.data || res.data;
      setFormData({
        name: data.name || "",
        email: data.email || "",
        cpf: data.cpf || "",
        cargo: data.cargo || "",
        horarioPadrao: data.horarioPadrao || "",
        password: "",
        confirmPassword: "",
        role: data.role || "USER",
      });
    } catch (err) {
      console.error("Failed to load funcionario", err);
      setError("Erro ao carregar dados do funcionário");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validações
    if (!formData.name || !formData.email) {
      setError("Nome e email são obrigatórios");
      return;
    }

    if (!isEdit && !formData.password) {
      setError("Senha é obrigatória para novo funcionário");
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Email inválido");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        cpf: formData.cpf || null,
        cargo: formData.cargo || null,
        horarioPadrao: formData.horarioPadrao || null,
        role: formData.role,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEdit) {
        await api.put(`/users/${id}`, payload);
      } else {
        await api.post("/users", payload);
      }

      navigate("/funcionarios");
    } catch (err) {
      console.error("Save failed", err);
      setError(
        err?.response?.data?.error ||
          `Erro ao ${isEdit ? "atualizar" : "cadastrar"} funcionário`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/funcionarios")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {isEdit ? "Editar Funcionário" : "Novo Funcionário"}
          </h2>
          <p className="text-gray-600 mt-1">
            {isEdit
              ? "Atualize as informações do funcionário"
              : "Preencha os dados para cadastrar um novo funcionário"}
          </p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
      >
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome Completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Nome Completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ex: João da Silva"
            />
          </div>

          {/* Email e CPF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-1" />
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          {/* Cargo e Horário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Cargo
              </label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ex: Desenvolvedor, Gerente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Horário Padrão
              </label>
              <input
                type="text"
                name="horarioPadrao"
                value={formData.horarioPadrao}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ex: 08:00 - 17:00"
              />
            </div>
          </div>

          {/* Função */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Função no Sistema
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="USER">Usuário</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Administradores têm acesso completo ao sistema
            </p>
          </div>

          {/* Senha */}
          {!isEdit && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Definir Senha Inicial
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Key className="w-4 h-4 inline mr-1" />
                    Senha *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEdit}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Senha inicial"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Key className="w-4 h-4 inline mr-1" />
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isEdit}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Confirme a senha"
                  />
                </div>
              </div>
            </div>
          )}

          {isEdit && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Para alterar a senha, deixe os campos em branco.
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/funcionarios")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? "Salvando..." : isEdit ? "Atualizar" : "Cadastrar"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
