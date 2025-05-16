import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import "./index.css"

const QRCodeScanner = () => {
  const [scannedId, setScannedId] = useState('');
  const [status, setStatus] = useState('');
  const [isPaused, setIsPaused] = useState(false);  // Optional: to control scanner pause

  const handleScan = async (data) => {
  if (data && data.length > 0) {
    const qrData = data[0];  // Access the first element in the array
    const registrationId = qrData.rawValue || '';  // Use `rawValue` from the first item in the array
    setScannedId(registrationId);  // Set the scanned ID to state

    if (!registrationId) {
      setStatus('❌ Invalid QR code');
      return;
    }

    try {
      // Send the registrationId to the API for verification
const res = await axios.get(`http://localhost:3001/api/registration/verify/${registrationId}`);
      setStatus(`✅ Verified: ${res.data.message}`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setStatus('❌ Invalid or unapproved registration');
      } else {
        setStatus('❌ QR scan error');
      }
    }
  }
};


  const handleError = (err) => {
    console.error(err);
    setStatus('❌ QR scan error');
  };

  const handleVerify = async () => {
    if (scannedId) {
      // Trigger any additional verification logic here if needed
      alert(`Verifying ID: ${scannedId}`);
    }
  };

  return (
    <div className="qr-scanner-container">
      <h2 className="qr-scanner-title">Scan Registration QR Code</h2>
      <div className="qr-reader-box">
        <Scanner
          onScan={handleScan}
          onError={handleError}
          scanDelay={300}  // Optional: Delay between scans
          sound={true}     // Optional: Play sound on successful scan
          paused={isPaused}  // Optional: Pause scanning if true
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
      <div className="qr-status-text">
        {scannedId && <p><strong>Scanned ID:</strong> {scannedId}</p>}
        <p>
          <strong>Status:</strong>
          <span className={status.includes('❌') ? 'qr-status-error' : 'qr-status-success'}>
            {status}
          </span>
        </p>
      </div>
      <button
        className="qr-verify-button"
        onClick={handleVerify}
        disabled={!scannedId}
      >
        Verify
      </button>
    </div>
  );
};

export default QRCodeScanner;
