'use client';

import React, { useEffect, useState } from 'react';
import { Download, QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  bookingId: string;
  tripId: string;
  boardingToken: string;
  /** compact = smaller size for cards, default = full size for modal */
  compact?: boolean;
}

export function QRCodeDisplay({ bookingId, tripId, boardingToken, compact = false }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const payload = JSON.stringify({ bookingId, tripId, boardingToken });

    // Dynamic import keeps qrcode out of the SSR bundle
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(payload, {
        width: compact ? 160 : 256,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      })
        .then((url) => { if (!cancelled) setQrDataUrl(url); })
        .catch(() => { if (!cancelled) setError(true); });
    });

    return () => { cancelled = true; };
  }, [bookingId, tripId, boardingToken, compact]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `mashaweer-qr-${bookingId.slice(0, 8)}.png`;
    link.click();
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
        <QrCode className="h-4 w-4" />
        تعذّر إنشاء رمز QR
      </div>
    );
  }

  if (!qrDataUrl) {
    return (
      <div
        className={`animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800 ${compact ? 'h-[160px] w-[160px]' : 'h-[256px] w-[256px]'}`}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src={qrDataUrl}
        alt="Boarding QR Code"
        className={`rounded-xl border border-zinc-200 shadow-sm ${compact ? 'h-[160px] w-[160px]' : 'h-[256px] w-[256px]'}`}
      />
      {!compact && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          <Download className="h-4 w-4" />
          حفظ رمز QR
        </button>
      )}
    </div>
  );
}
