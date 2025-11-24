import React from "react";
import { motion } from "framer-motion";
import { Clock, Pause, Play, LogOut } from "lucide-react";

function getIcon(type) {
  switch (type) {
    case "IN":
      return Clock;
    case "PAUSE":
      return Pause;
    case "RETURN":
    case "RESUME":
      return Play;
    case "OUT":
      return LogOut;
    default:
      return Clock;
  }
}

function getColors(type) {
  switch (type) {
    case "IN":
      return {
        bg: "from-green-500 to-green-600",
        hover: "hover:from-green-600 hover:to-green-700",
        shadow: "shadow-green-200",
      };
    case "PAUSE":
      return {
        bg: "from-yellow-500 to-yellow-600",
        hover: "hover:from-yellow-600 hover:to-yellow-700",
        shadow: "shadow-yellow-200",
      };
    case "RETURN":
    case "RESUME":
      return {
        bg: "from-blue-500 to-blue-600",
        hover: "hover:from-blue-600 hover:to-blue-700",
        shadow: "shadow-blue-200",
      };
    case "OUT":
      return {
        bg: "from-red-500 to-red-600",
        hover: "hover:from-red-600 hover:to-red-700",
        shadow: "shadow-red-200",
      };
    default:
      return {
        bg: "from-gray-500 to-gray-600",
        hover: "hover:from-gray-600 hover:to-gray-700",
        shadow: "shadow-gray-200",
      };
  }
}

export default function ClockButton({
  type = "IN",
  label = "Entrada",
  onClick,
  disabled = false,
}) {
  const Icon = getIcon(type);
  const colors = getColors(type);

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        px-6 py-6 rounded-xl
        bg-gradient-to-br ${colors.bg}
        text-white font-semibold text-lg
        shadow-lg ${colors.shadow}
        transition-all duration-200
        ${!disabled && colors.hover}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        flex flex-col items-center justify-center
        min-h-[140px] w-full
      `}
    >
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: disabled ? 1 : [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon className="w-12 h-12 mb-3" />
      </motion.div>
      <span className="text-xl">{label}</span>
      
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}
    </motion.button>
  );
}
