'use client';

import { useEffect, useRef } from 'react';
import { Download, Printer } from 'lucide-react';

interface BarcodeDisplayProps {
  barcode: string;
  orderNumber: string;
  showDownload?: boolean;
  showPrint?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function BarcodeDisplay({ 
  barcode, 
  orderNumber, 
  showDownload = true, 
  showPrint = true,
  size = 'medium' 
}: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sizeConfig = {
    small: { width: 150, height: 50, fontSize: 10 },
    medium: { width: 200, height: 70, fontSize: 12 },
    large: { width: 280, height: 100, fontSize: 14 }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (canvasRef.current && barcode) {
      drawBarcode(canvasRef.current, barcode, config);
    }
  }, [barcode, config]);

  const drawBarcode = (canvas: HTMLCanvasElement, code: string, cfg: typeof config) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = cfg.width;
    canvas.height = cfg.height;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cfg.width, cfg.height);

    // Draw Code128-like barcode pattern
    const barcodeHeight = cfg.height - 20;
    const startX = 10;
    const barWidth = (cfg.width - 20) / (code.length * 11 + 35);

    ctx.fillStyle = '#000000';

    // Start pattern
    const startPattern = [2, 1, 1, 2, 3, 2];
    let x = startX;
    startPattern.forEach((width, i) => {
      if (i % 2 === 0) {
        ctx.fillRect(x, 5, width * barWidth, barcodeHeight);
      }
      x += width * barWidth;
    });

    // Encode each character
    const patterns: Record<string, number[]> = {
      '0': [2, 1, 2, 2, 2, 2], '1': [2, 2, 2, 1, 2, 2], '2': [2, 2, 2, 2, 2, 1],
      '3': [1, 2, 1, 2, 2, 3], '4': [1, 2, 1, 3, 2, 2], '5': [1, 3, 1, 2, 2, 2],
      '6': [1, 2, 2, 2, 1, 3], '7': [1, 2, 2, 3, 1, 2], '8': [1, 3, 2, 2, 1, 2],
      '9': [2, 2, 1, 2, 1, 3], 'L': [1, 1, 3, 2, 2, 2], 'P': [2, 1, 1, 2, 2, 3]
    };

    for (const char of code) {
      const pattern = patterns[char] || [2, 1, 2, 1, 2, 2];
      pattern.forEach((width, i) => {
        if (i % 2 === 0) {
          ctx.fillRect(x, 5, width * barWidth, barcodeHeight);
        }
        x += width * barWidth;
      });
    }

    // Stop pattern
    const stopPattern = [2, 3, 3, 1, 1, 1, 2];
    stopPattern.forEach((width, i) => {
      if (i % 2 === 0) {
        ctx.fillRect(x, 5, width * barWidth, barcodeHeight);
      }
      x += width * barWidth;
    });

    // Draw text below barcode
    ctx.fillStyle = '#000000';
    ctx.font = `${cfg.fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(code, cfg.width / 2, cfg.height - 3);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `barcode-${orderNumber}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode - ${orderNumber}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .barcode-container {
              text-align: center;
              padding: 20px;
              border: 2px dashed #ccc;
              border-radius: 8px;
            }
            .order-number {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
            }
            img {
              max-width: 100%;
            }
            @media print {
              .barcode-container {
                border: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            <div class="order-number">Order: ${orderNumber}</div>
            <img src="${canvasRef.current.toDataURL('image/png')}" alt="Barcode" />
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
        <canvas ref={canvasRef} className="block" />
      </div>
      
      {(showDownload || showPrint) && (
        <div className="flex gap-2">
          {showDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Download Barcode"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
          )}
          {showPrint && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Print Barcode"
            >
              <Printer className="w-3 h-3" />
              Print
            </button>
          )}
        </div>
      )}
    </div>
  );
}
