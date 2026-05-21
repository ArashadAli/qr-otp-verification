import React, { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { verifyByQRApi, verifyByOTPApi, makeDecisionApi } from "../api/adminApi";
import QRScanner from "../components/qr/QRScanner";
import Navbar from "../components/common/Navbar";
import {
  ScanLine,
  KeyRound,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Clock,
  RotateCcw,
  ChevronRight,
  Pencil,
  AlertCircle,
  CheckCheck,
} from "lucide-react";

// ─── Sub-components ──────────────────────────────────────────────────────────

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
      active
        ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
        : "text-surface-500 hover:text-surface-700 hover:bg-surface-100"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const AlertBox = ({ type, message }) => {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
  };
  const icons = {
    error: <AlertCircle className="w-4 h-4 flex-shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 flex-shrink-0" />,
    info: <AlertCircle className="w-4 h-4 flex-shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 flex-shrink-0" />,
  };
  return (
    <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm ${styles[type]}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
};

const VerifiedUserCard = ({ user, onApprove, onReject, loading }) => (
  <div className="animate-slide-up">
    {/* Verified banner */}
    <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500 rounded-t-2xl">
      <CheckCheck className="w-5 h-5 text-white" />
      <span className="text-white font-semibold text-sm">Identity Verified — Take Action</span>
    </div>

    <div className="card rounded-t-none p-5 border-t-0 shadow-lg">
      {/* User info */}
      <div className="flex items-start gap-4 mb-5 pb-5 border-b border-surface-100">
        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-xl flex-shrink-0">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-surface-900 text-lg truncate">{user.name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-surface-500 text-sm">
            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-surface-500 text-sm">
            <User className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="capitalize">{user.role}</span>
          </div>
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm text-surface-600 font-medium">Current Status</span>
        <span className="badge-pending">
          <Clock className="w-3.5 h-3.5" />
          Pending
        </span>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onApprove(user._id)}
          disabled={loading}
          className="btn-success py-3 text-base"
        >
          {loading === "approved" ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          Approve
        </button>
        <button
          onClick={() => onReject(user._id)}
          disabled={loading}
          className="btn-danger py-3 text-base"
        >
          {loading === "rejected" ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          Reject
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS = { QR: "qr", OTP: "otp" };

const AdminVerification = () => {
  const { user: admin } = useAuth();

  const [tab, setTab] = useState(TABS.QR);
  const [scannerActive, setScannerActive] = useState(true);

  // OTP input
  const [otpInput, setOtpInput] = useState("");

  // Manual QR input fallback
  const [manualQR, setManualQR] = useState("");
  const [showManualQR, setShowManualQR] = useState(false);

  // Verified user state
  const [verifiedUser, setVerifiedUser] = useState(null);

  // UI state
  const [verifying, setVerifying] = useState(false);
  const [deciding, setDeciding] = useState(null); // "approved" | "rejected" | null
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── Reset everything back to scan/OTP mode ──
  const resetPage = useCallback(() => {
    setVerifiedUser(null);
    setOtpInput("");
    setManualQR("");
    setError("");
    setSuccessMsg("");
    setVerifying(false);
    setDeciding(null);
    // Re-enable scanner if QR tab is active
    if (tab === TABS.QR) {
      setScannerActive(false);
      setTimeout(() => setScannerActive(true), 300);
    }
  }, [tab]);

  // ── Handle tab switch ──
  const switchTab = (newTab) => {
    setTab(newTab);
    setError("");
    setSuccessMsg("");
    if (newTab === TABS.QR) {
      setScannerActive(true);
    } else {
      setScannerActive(false);
    }
  };

  // ── QR scan success ──
  const handleQRScanned = async (rawData) => {
    setScannerActive(false);
    setVerifying(true);
    setError("");
    try {
      const res = await verifyByQRApi(rawData);
      setVerifiedUser(res.data.user);
    } catch (err) {
      setError(err.message);
      // Re-enable scanner after error
      setTimeout(() => setScannerActive(true), 1000);
    } finally {
      setVerifying(false);
    }
  };

  // ── Manual QR submit ──
  const handleManualQRSubmit = async (e) => {
    e.preventDefault();
    if (!manualQR.trim()) return;
    setVerifying(true);
    setError("");
    try {
      const res = await verifyByQRApi(manualQR.trim());
      setVerifiedUser(res.data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  // ── OTP submit ──
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (otpInput.length !== 4) {
      setError("Please enter a 4-digit OTP.");
      return;
    }
    setVerifying(true);
    setError("");
    try {
      const res = await verifyByOTPApi(otpInput.trim());
      setVerifiedUser(res.data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  // ── Decision (approve / reject) ──
  const handleDecision = async (userId, decision) => {
    setDeciding(decision);
    setError("");
    try {
      await makeDecisionApi(userId, decision, admin._id);
      setSuccessMsg(
        `User has been ${decision === "approved" ? "✅ approved" : "❌ rejected"} successfully.`
      );
      setTimeout(() => resetPage(), 2000);
    } catch (err) {
      setError(err.message);
      setDeciding(null);
    }
  };

  // ─── OTP digit-only input ──
  const handleOTPChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setOtpInput(val);
    setError("");
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-surface-900">
            Admin Verification
          </h1>
          <p className="text-surface-500 mt-1.5 text-sm">
            Scan a user's QR code or enter their OTP to verify identity.
          </p>
        </div>

        {/* Success banner */}
        {successMsg && (
          <div className="mb-6 animate-slide-up">
            <AlertBox type="success" message={successMsg} />
          </div>
        )}

        {/* Verified user card (shown after QR/OTP match) */}
        {verifiedUser ? (
          <div className="space-y-4">
            <VerifiedUserCard
              user={verifiedUser}
              onApprove={(id) => handleDecision(id, "approved")}
              onReject={(id) => handleDecision(id, "rejected")}
              loading={deciding}
            />
            {error && <AlertBox type="error" message={error} />}
            <button
              onClick={resetPage}
              className="btn-secondary w-full gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Cancel &amp; Scan Next User
            </button>
          </div>
        ) : (
          /* Scan / OTP panel */
          <div className="card p-5 sm:p-6 shadow-sm animate-slide-up">
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-surface-100 rounded-xl mb-6">
              <TabButton
                active={tab === TABS.QR}
                onClick={() => switchTab(TABS.QR)}
                icon={ScanLine}
                label="QR Scanner"
              />
              <TabButton
                active={tab === TABS.OTP}
                onClick={() => switchTab(TABS.OTP)}
                icon={KeyRound}
                label="OTP Input"
              />
            </div>

            {/* Error / info messages */}
            {error && (
              <div className="mb-4">
                <AlertBox type="error" message={error} />
              </div>
            )}

            {/* ── QR Tab ── */}
            {tab === TABS.QR && (
              <div className="space-y-4">
                {verifying ? (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-surface-500">Verifying QR code…</p>
                  </div>
                ) : (
                  <QRScanner
                    active={scannerActive}
                    onScanSuccess={handleQRScanned}
                    onScanError={() => setShowManualQR(true)}
                  />
                )}

                {/* Manual QR fallback toggle */}
                <div className="pt-2 border-t border-surface-100">
                  <button
                    onClick={() => setShowManualQR((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-brand-600 transition-colors font-medium"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {showManualQR ? "Hide manual input" : "Camera not working? Enter QR data manually"}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${showManualQR ? "rotate-90" : ""}`}
                    />
                  </button>

                  {showManualQR && (
                    <form onSubmit={handleManualQRSubmit} className="mt-3 space-y-3 animate-slide-up">
                      <textarea
                        value={manualQR}
                        onChange={(e) => setManualQR(e.target.value)}
                        placeholder='Paste QR payload here — e.g. {"type":"USER_VERIFY","token":"..."}'
                        rows={3}
                        className="input-field font-mono text-xs resize-none"
                      />
                      <button
                        type="submit"
                        disabled={verifying || !manualQR.trim()}
                        className="btn-primary w-full"
                      >
                        {verifying ? (
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ScanLine className="w-4 h-4" />
                        )}
                        Verify QR Data
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* ── OTP Tab ── */}
            {tab === TABS.OTP && (
              <form onSubmit={handleOTPSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Enter 4-Digit OTP
                  </label>
                  {/* Large OTP input boxes */}
                  <div className="flex gap-3 justify-center">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-16 h-16 sm:w-18 sm:h-18 rounded-xl border-2 flex items-center justify-center transition-all duration-150 ${
                          otpInput[i]
                            ? "border-brand-500 bg-brand-50"
                            : "border-surface-200 bg-surface-50"
                        }`}
                      >
                        <span className="font-mono text-2xl font-bold text-surface-900">
                          {otpInput[i] || ""}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Hidden single input for keyboard */}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{4}"
                    value={otpInput}
                    onChange={handleOTPChange}
                    maxLength={4}
                    placeholder="Type OTP here"
                    className="input-field mt-3 text-center text-2xl font-mono tracking-[0.5em]"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying || otpInput.length !== 4}
                  className="btn-primary w-full py-3"
                >
                  {verifying ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  Verify OTP
                </button>
              </form>
            )}
          </div>
        )}

        {/* Admin info strip */}
        <div className="mt-6 card p-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center font-semibold text-white text-sm">
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-800">{admin?.name}</p>
              <p className="text-xs text-surface-500">{admin?.email}</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 font-semibold">
            admin
          </span>
        </div>
      </main>
    </div>
  );
};

export default AdminVerification;