import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginApi } from "../api/authApi";
import { ShieldCheck, Eye, EyeOff, LogIn, ChevronRight } from "lucide-react";

const DEMO_CREDS = [
  { label: "Admin", email: "admin@example.com", password: "admin123", role: "admin" },
  { label: "User 1", email: "user1@example.com", password: "user123", role: "user" },
  { label: "User 2", email: "user2@example.com", password: "user123", role: "user" },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await loginApi(form.email.trim(), form.password.trim());
      login(res.data);
      if (res.data.role === "admin") {
        navigate("/admin/verify");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillCred = (cred) => {
    setForm({ email: cred.email, password: cred.password });
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-brand-50/30 to-surface-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-surface-900 tracking-tight">
            VerifyPass
          </h1>
          <p className="text-surface-500 mt-1.5 text-sm">QR & OTP Verification System</p>
        </div>

        {/* Card */}
        <div className="card p-6 sm:p-8 shadow-xl shadow-surface-200/60">
          <h2 className="text-lg font-semibold text-surface-800 mb-6">Sign in to continue</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 card p-4 sm:p-5">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
            Demo Credentials — click to fill
          </p>
          <div className="space-y-2">
            {DEMO_CREDS.map((cred) => (
              <button
                key={cred.email}
                onClick={() => fillCred(cred)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-50 hover:bg-brand-50 border border-surface-200 hover:border-brand-200 transition-all duration-150 group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      cred.role === "admin"
                        ? "bg-brand-100 text-brand-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {cred.label}
                  </span>
                  <span className="text-sm font-mono text-surface-600">{cred.email}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-brand-500 transition-colors" />
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-surface-400">
            Users 1–50 available · All users use password{" "}
            <span className="font-mono bg-surface-100 px-1.5 py-0.5 rounded">user123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;