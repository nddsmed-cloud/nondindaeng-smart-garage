import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ url, size = 128 }) => {
  return (
    <div className="qr-section">
      <div className="qr-title">QR Code</div>
      <QRCodeCanvas value={url} size={size} className="qr-image" />
    </div>
  );
};
