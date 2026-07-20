"use client";

import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeDisplayProps {
  url: string;
}

export default function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  return (
    <div className="qr-code-wrapper" style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
      <QRCodeCanvas value={url} size={128} bgColor="#ffffff" fgColor="#000000" level="M" includeMargin={false} />
    </div>
  );
}
