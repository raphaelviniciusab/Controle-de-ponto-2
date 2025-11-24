import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  History,
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  Filter,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState({});
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Menu para usuários comuns
  const userMenuItems = [
    { path: "/", icon: Clock, label: "Registrar Ponto" },
    { path: "/history", icon: History, label: "Meu Histórico" },
  ];

  // Menu para administradores
  const adminMenuSections = [
    {
      label: "Registrar Ponto",
      icon: Clock,
      path: "/",
    },
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      label: "Funcionários",
      icon: Users,
      submenu: [
        { path: "/funcionarios", icon: Users, label: "Listar Funcionários" },
        { path: "/funcionarios/novo", icon: UserPlus, label: "Cadastrar Funcionário" },
      ],
    },
    {
      label: "Registros de Ponto",
      icon: Clock,
      submenu: [
        { path: "/registros", icon: FileText, label: "Visualizar Registros" },
        { path: "/registros/filtrar", icon: Filter, label: "Filtrar Registros" },
      ],
    },
    {
      label: "Relatórios",
      icon: TrendingUp,
      submenu: [
        { path: "/relatorios/horas", icon: TrendingUp, label: "Horas Trabalhadas" },
      ],
    },
    {
      label: "Configurações",
      icon: Settings,
      path: "/configuracoes",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const menuToShow = user?.role === "ADMIN" ? adminMenuSections : userMenuItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : (isOpen ? 0 : -280),
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed left-0 top-0 h-full w-[280px] bg-gradient-to-b from-indigo-600 to-indigo-800 text-white z-50 shadow-2xl lg:relative lg:translate-x-0 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-indigo-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="font-bold text-lg">PontoApp</h1>
              <p className="text-xs text-indigo-200">Controle de Ponto</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-white hover:bg-indigo-700 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-indigo-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-lg">
              {(user?.name || user?.email || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {user?.name || user?.email || "Usuário"}
              </p>
              <p className="text-xs text-indigo-200 truncate">
                {user?.email || ""}
              </p>
              {user?.role === "ADMIN" && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-500 rounded-full text-xs font-medium">
                  Administrador
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {user?.role === "ADMIN" ? (
              // Menu Admin com submenus
              adminMenuSections.map((section, idx) => {
                const Icon = section.icon;
                const isExpanded = expandedSections[section.label];
                const hasSubmenu = section.submenu && section.submenu.length > 0;

                return (
                  <li key={idx}>
                    {hasSubmenu ? (
                      <>
                        <button
                          onClick={() => toggleSection(section.label)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-indigo-100 hover:bg-indigo-700/50"
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{section.label}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4 mt-1 space-y-1 overflow-hidden"
                            >
                              {section.submenu.map((item) => {
                                const SubIcon = item.icon;
                                const active = isActive(item.path);

                                return (
                                  <li key={item.path}>
                                    <Link
                                      to={item.path}
                                      onClick={() => {
                                        if (window.innerWidth < 1024) {
                                          onToggle();
                                        }
                                      }}
                                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all text-sm ${
                                        active
                                          ? "bg-white text-indigo-600 shadow-lg"
                                          : "text-indigo-100 hover:bg-indigo-700/50"
                                      }`}
                                    >
                                      <SubIcon className="w-4 h-4" />
                                      <span>{item.label}</span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={section.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            onToggle();
                          }
                        }}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          isActive(section.path)
                            ? "bg-white text-indigo-600 shadow-lg"
                            : "text-indigo-100 hover:bg-indigo-700/50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{section.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })
            ) : (
              // Menu simples para usuários
              userMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        active
                          ? "bg-white text-indigo-600 shadow-lg"
                          : "text-indigo-100 hover:bg-indigo-700/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </nav>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-indigo-500/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-indigo-100 hover:bg-red-500/20 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 lg:hidden z-30 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
}
