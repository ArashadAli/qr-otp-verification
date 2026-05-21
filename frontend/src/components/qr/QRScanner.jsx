import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, RefreshCw } from "lucide-react";

const QR_READER_ID = "qr-reader-container";

const QRScanner = ({ onScanSuccess, onScanError, active }) => {
  const html5QrRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (active) {
      startScanner();
    } else {
      stopScanner();
    }
  }, [active]);

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        const state = html5QrRef.current.getState();
        // state 2 = SCANNING
        if (state === 2) {
          await html5QrRef.current.stop();
        }
      } catch (_) {}
      try {
        await html5QrRef.current.clear();
      } catch (_) {}
      html5QrRef.current = null;
    }
    if (mountedRef.current) setScanning(false);
  };

  const startScanner = async () => {
    if (scanning) return;
    setError("");

    try {
      const qr = new Html5Qrcode(QR_READER_ID);
      html5QrRef.current = qr;

      await qr.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          // Stop immediately after successful scan
          await stopScanner();
          onScanSuccess(decodedText);
        },
        () => {
          // scan failure is normal — suppress
        }
      );

      if (mountedRef.current) {
        setScanning(true);
        setPermissionDenied(false);
      }
    } catch (err) {
      const msg = err?.message || String(err);
      if (
        msg.toLowerCase().includes("permission") ||
        msg.toLowerCase().includes("notallowed") ||
        msg.toLowerCase().includes("denied")
      ) {
        if (mountedRef.current) setPermissionDenied(true);
      } else {
        if (mountedRef.current)
          setError("Could not start camera. Use manual input below.");
      }
      if (onScanError) onScanError(msg);
    }
  };

  const handleRetry = () => {
    setError("");
    setPermissionDenied(false);
    startScanner();
  };

  if (permissionDenied) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <CameraOff className="w-7 h-7 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-surface-800">Camera Access Denied</p>
          <p className="text-sm text-surface-500 mt-1">
            Allow camera permission in your browser settings, then retry.
          </p>
        </div>
        <button onClick={handleRetry} className="btn-secondary gap-2 mt-1">
          <RefreshCw className="w-4 h-4" />
          Retry Camera
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="relative">
        {/* Scanner mount point */}
        <div
          id={QR_READER_ID}
          className="w-full rounded-xl overflow-hidden bg-surface-900"
        />

        {/* Overlay when not scanning */}
        {!scanning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-900 rounded-xl min-h-[240px]">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white/70" />
            </div>
            <p className="text-white/60 text-sm">Starting camera…</p>
          </div>
        )}
      </div>

      {scanning && (
        <p className="mt-2 text-xs text-center text-surface-500 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
          Scanner active — point at a user QR code
        </p>
      )}
    </div>
  );
};

export default QRScanner;