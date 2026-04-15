import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export default function BarcodeScanner({ open, onClose, onScan }: Props) {
  const scannerRef = useRef<any>(null);
  const containerId = 'barcode-reader';
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const stopScanner = async () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (!scanner) return;
      try { await scanner.stop(); } catch {}
      try { await scanner.clear(); } catch {}
    };

    if (!open) {
      void stopScanner();
      setError('');
      return () => { mounted = false; };
    }

    setError('');

    const timeout = setTimeout(async () => {
      if (!mounted) return;
      const el = document.getElementById(containerId);
      if (!el) { setError('Scanner element not found.'); return; }
      el.innerHTML = '';

      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

      const scanner = new Html5Qrcode(containerId, {
        verbose: false,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
      });
      scannerRef.current = scanner;

      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 180 }, aspectRatio: 1.777778 },
        (decodedText: string) => {
          if (!mounted) return;
          onScan(decodedText.trim());
          void stopScanner();
          onClose();
        },
        () => {}
      ).catch(() => {
        if (mounted) setError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
      });
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      void stopScanner();
    };
  }, [open, onScan, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Camera className="h-4 w-4" />
            Scan Barcode
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <div id={containerId} className="w-full rounded-lg overflow-hidden" />
          {error && <div className="text-destructive text-sm text-center py-4">{error}</div>}
        </div>
        <Button variant="outline" onClick={onClose} className="w-full gap-2">
          <X className="h-4 w-4" /> Tutup
        </Button>
      </DialogContent>
    </Dialog>
  );
}
