/**
 * QR Service - generates secure QR tokens and QR code images
 */

const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

/**
 * Generate a secure random token (UUID v4)
 */
const generateQRToken = () => {
  return uuidv4();
};

/**
 * Generate a QR code data URL from a qrToken
 * Payload: { type: "USER_VERIFY", token: "<qrToken>" }
 */
const generateQRCode = async (qrToken) => {
  const payload = JSON.stringify({ type: "USER_VERIFY", token: qrToken });

  const qrDataURL = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    type: "image/png",
    quality: 0.95,
    margin: 2,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
    width: 300,
  });

  return qrDataURL;
};

/**
 * Parse scanned QR data string into payload object
 * Returns null if invalid
 */
const parseQRData = (rawData) => {
  try {
    const payload = JSON.parse(rawData);
    if (payload.type === "USER_VERIFY" && payload.token) {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
};

module.exports = { generateQRToken, generateQRCode, parseQRData };