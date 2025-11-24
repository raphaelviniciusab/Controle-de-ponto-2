import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Bem-vindo, {user?.name || user?.email?.split("@")[0] || "Usuário"}!
          </h2>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Badge */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {user?.email}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
