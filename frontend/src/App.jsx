import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Clock from "./pages/Clock.jsx";
import History from "./pages/History.jsx";
import Admin from "./pages/Admin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Funcionarios from "./pages/Funcionarios.jsx";
import FuncionarioForm from "./pages/FuncionarioForm.jsx";
import Relatorios from "./pages/Relatorios.jsx";
import Layout from "./components/Layout.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Clock />} />
          <Route path="/history" element={<History />} />
          <Route element={<AdminRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/funcionarios/novo" element={<FuncionarioForm />} />
            <Route path="/funcionarios/editar/:id" element={<FuncionarioForm />} />
            <Route path="/registros" element={<History />} />
            <Route path="/registros/filtrar" element={<History />} />
            <Route path="/relatorios/horas" element={<Relatorios />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
