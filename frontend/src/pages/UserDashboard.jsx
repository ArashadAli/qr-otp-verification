import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserMeApi } from "../api/userApi";
import Navbar from "../components/common/Navbar";
import {
  QrCode,
  KeyRound,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Info,
} from "lucide-react";

const StatusBadge = ({ status }) => {
  if (status === "approved")
    return (
      <span className="badge-approved">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="badge-rejected">
        <XCircle className="w-3.5 h-3.5" />
        Rejected
      </span>
    );
  return (
    <span className="badge-pending">
      <Clock className="w-3.5 h-3.5" />
      Pending Verification
    </span>
  );
};

const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const [userData, setUserData] = useState(user);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getUserMeApi(user._id);
      const updated = { ...user, ...res.data.user };
      setUserData(updated);
      updateUser(res.data.user);
      setLastRefresh(new Date());
    } catch (_) {}
  }, [user._id]);

  // Poll every 8 seconds to auto-update status
  useEffect(() => {
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchStatus();
    setRefreshing(false);
  };

  const otpDigits = (userData?.otp || "----").split("");

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-surface-900">
            Your Verification Pass
          </h1>
          <p className="text-surface-500 mt-1.5 text-sm sm:text-base">
            Show your QR code or OTP to the admin for verification.
          </p>
        </div>

        {/* Status card */}
        <div
          className={`card p-5 mb-6 flex items-center justify-between animate-slide-up ${
            userData?.verificationStatus === "approved"
              ? "border-emerald-200 bg-emerald-50/50"
              : userData?.verificationStatus === "rejected"
              ? "border-red-200 bg-red-50/50"
              : "border-amber-200 bg-amber-50/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <StatusBadge status={userData?.verificationStatus} />
            <span className="text-sm text-surface-600 hidden sm:inline">
              {userData?.verificationStatus === "approved" && "Your entry has been approved!"}
              {userData?.verificationStatus === "rejected" && "Your entry was not approved."}
              {userData?.verificationStatus === "pending" && "Waiting for admin to verify you."}
            </span>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            title="Refresh status"
            className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-brand-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">
              {refreshing ? "Refreshing…" : `Updated ${lastRefresh.toLocaleTimeString()}`}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* QR Code Card */}
          <div className="card p-6 flex flex-col items-center gap-4 animate-slide-up">
            <div className="flex items-center gap-2 self-start">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                <QrCode className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-800">QR Code</p>
                <p className="text-xs text-surface-500">Scan to verify</p>
              </div>
            </div>

            {userData?.qrCode ? (
              <div className="p-3 bg-white rounded-xl border-2 border-surface-100 shadow-sm">
                <img
                  src={userData.qrCode}
                  alt="Your QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-surface-100 rounded-xl flex items-center justify-center">
                <QrCode className="w-12 h-12 text-surface-300" />
              </div>
            )}

            <p className="text-xs text-surface-400 text-center leading-relaxed">
              Show this QR code to the admin for scanning.
            </p>
          </div>

          {/* OTP Card */}
          <div className="card p-6 flex flex-col gap-4 animate-slide-up [animation-delay:80ms]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-800">One-Time Password</p>
                <p className="text-xs text-surface-500">Tell this to admin</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center mt-2">
              {otpDigits.map((digit, i) => (
                <div
                  key={i}
                  className="w-14 h-16 sm:w-16 sm:h-18 bg-surface-900 rounded-xl flex items-center justify-center"
                >
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-white">
                    {digit}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-surface-100">
              <div className="flex items-start gap-2 text-xs text-surface-500">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-brand-400" />
                <p>
                  OTP refreshes each time you log in. Keep this confidential.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User info strip */}
        <div className="mt-6 card p-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center font-semibold text-brand-700 text-sm">
              {userData?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-800">{userData?.name}</p>
              <p className="text-xs text-surface-500">{userData?.email}</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 font-semibold">
            user
          </span>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;