import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck, User } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-700 text-lg text-surface-900 tracking-tight">
            VerifyPass
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-100 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                  <User className="w-3 h-3 text-brand-600" />
                </div>
                <span className="text-sm font-medium text-surface-700">{user.name}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    user.role === "admin"
                      ? "bg-brand-100 text-brand-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-surface-600 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;