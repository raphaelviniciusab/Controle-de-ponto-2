import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  TrendingUp,
  Calendar,
  UserPlus,
  FileText,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Funcionários",
      description: "Gerenciar funcionários cadastrados",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      path: "/funcionarios",
    },
    {
      title: "Novo Funcionário",
      description: "Cadastrar novo funcionário",
      icon: UserPlus,
      color: "from-green-500 to-green-600",
      path: "/funcionarios/novo",
    },
    {
      title: "Registros",
      description: "Visualizar registros de ponto",
      icon: Clock,
      color: "from-purple-500 to-purple-600",
      path: "/history",
    },
    {
      title: "Relatórios",
      description: "Relatórios e horas trabalhadas",
      icon: TrendingUp,
      color: "from-indigo-500 to-indigo-600",
      path: "/relatorios/horas",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Bem-vindo ao painel administrativo
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all text-left"
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-600">{action.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Sistema de Controle de Ponto</h3>
            <p className="text-indigo-100">
              Gerencie funcionários, registros e relatórios de forma simples e eficiente
            </p>
          </div>
          <Calendar className="w-20 h-20 opacity-20" />
        </div>
      </motion.div>
    </div>
  );
}
