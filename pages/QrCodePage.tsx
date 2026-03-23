import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, QrCode, ArrowLeft, Download, Smartphone, Loader2, Eye, X } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';

const PosterPreviewModal: React.FC<{ isOpen: boolean, onClose: () => void, businessName: string, qrUrl: string, logoUrl?: string | null }> = ({ isOpen, onClose, businessName, qrUrl, logoUrl }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
          >
            <X size={20} className="text-gray-500" />
          </button>

          <div className="p-6 sm:p-8 md:p-12 flex flex-col items-center text-center space-y-6 sm:space-y-8">
            {logoUrl && (
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-white -mb-4">
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">
                {businessName}
              </h3>
              <div className="flex justify-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={24} className="fill-current" />)}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48 md:w-64 md:h-64 object-contain" />
            </div>

            <div className="space-y-4">
              <p className="text-2xl font-bold text-blue-600 leading-tight">
                Enjoyed our service?<br />
                Scan and leave a review!
              </p>
              <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                Powered by Scanzo
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Star = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const QrCodePage: React.FC = () => {
  const { ownerData } = useAuth();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const publicSlug = ownerData?.public_slug || 'demo-business';
  const businessName = ownerData?.business_name || 'Our Business';
  
  const publicLink = `${window.location.origin}/scan/${publicSlug}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(publicLink)}`;

  const handleSimulateScan = () => {
    window.open(`/#/scan/${publicSlug}?preview=true`, '_blank');
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(qrApiUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'image/png'
        }
      });

      if (!response.ok) throw new Error('Network error');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `smartreview-${publicSlug}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Auto-download failed (CORS/Network), opening new tab fallback.", error);
      window.open(qrApiUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintPoster = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print the poster.");
      return;
    }

    const logoHtml = ownerData?.avatar_url 
      ? `<img src="${ownerData.avatar_url}" class="logo" />` 
      : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print QR Poster - ${businessName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .poster-canvas {
            width: 210mm;
            height: 297mm;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            box-sizing: border-box;
            position: relative;
          }
          .main-card {
            width: 100%;
            height: 100%;
            background: #ffffff;
            border-radius: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 80px 40px;
            box-sizing: border-box;
            box-shadow: 0 50px 100px -20px rgba(0,0,0,0.05);
            border: 1px solid #f1f5f9;
          }
          .header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
          }
          .logo {
            width: 140px;
            height: 140px;
            object-fit: cover;
            border-radius: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          }
          .business-name {
            font-size: 64px;
            font-weight: 900;
            letter-spacing: -0.04em;
            color: #0f172a;
            margin: 0;
            text-align: center;
          }
          .stars {
            display: flex;
            gap: 8px;
            color: #fbbf24;
            font-size: 48px;
          }
          .qr-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 32px;
          }
          .qr-container {
            background: #ffffff;
            padding: 40px;
            border-radius: 50px;
            box-shadow: 0 30px 60px -12px rgba(0,0,0,0.08);
            border: 1px solid #f1f5f9;
          }
          .qr-image {
            width: 450px;
            height: 450px;
            display: block;
          }
          .cta-text {
            font-size: 48px;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #2563eb;
            margin: 0;
            line-height: 1.1;
          }
          .footer {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
          .instruction {
            font-size: 24px;
            font-weight: 600;
            color: #64748b;
          }
          .branding {
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            color: #cbd5e1;
          }
        </style>
      </head>
      <body>
        <div class="poster-canvas">
          <div class="main-card">
            <div class="header">
              ${logoHtml}
              <h1 class="business-name">${businessName}</h1>
              <div class="stars">★★★★★</div>
            </div>

            <div class="qr-section">
              <h2 class="cta-text">Scan to Review</h2>
              <div class="qr-container">
                <img src="${qrApiUrl}" class="qr-image" onload="window.print(); window.onafterprint = function(){ window.close(); }" />
              </div>
            </div>

            <div class="footer">
              <p class="instruction">Point your camera at the QR code</p>
              <div class="branding">Powered by Scanzo</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 p-4 md:p-6">
      <PosterPreviewModal 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
        businessName={businessName} 
        qrUrl={qrApiUrl} 
        logoUrl={ownerData?.avatar_url}
      />

      <div className="flex items-center gap-4">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)} 
          className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400"
        >
          <ArrowLeft size={24} />
        </motion.button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QR Code Poster</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Get your custom review poster ready for your customers.</p>
        </div>
      </div>

      {/* Print Your Review Poster Section */}
      <GlassCard className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Printer className="text-blue-500" />
              Print Your Review Poster
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                <p className="text-gray-600 dark:text-gray-300">Download or print the QR poster.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                <p className="text-gray-600 dark:text-gray-300">Place it near the billing counter or reception.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                <p className="text-gray-600 dark:text-gray-300">Ask customers to scan after their visit.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handlePrintPoster}
                className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
              >
                <Printer size={20} />
                Print Poster
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPreview(true)}
                className="flex-1 px-6 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Eye size={20} />
                Preview
              </motion.button>
            </div>
          </div>

          <div className="w-full md:w-64 shrink-0 flex justify-center">
             <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 md:rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer max-w-[240px] w-full" onClick={() => setShowPreview(true)}>
                <div className="aspect-[1/1.4] bg-gray-50 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 border border-dashed border-gray-200">
                   <QrCode size={48} className="text-gray-300 mb-2" />
                   <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Poster Preview</p>
                </div>
             </div>
          </div>
        </div>
      </GlassCard>

      {/* QR Display & Actions */}
      <GlassCard className="p-6 sm:p-8 flex flex-col items-center text-center">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 mb-8 inline-block">
          <img 
            src={qrApiUrl} 
            alt="Your Business QR Code" 
            className="w-48 h-48 md:w-64 md:h-64 object-contain"
            crossOrigin="anonymous" 
          />
        </div>
        
        <div className="flex flex-col w-full md:w-auto gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {downloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
              {downloading ? 'Downloading...' : 'Download QR'}
            </motion.button>
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleSimulateScan}
              className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Smartphone size={20} />
              Simulate Scan
            </motion.button>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          Generates a high-quality A4 printable poster or download the QR code directly.
        </p>
      </GlassCard>
      {/* Footer */}
    </div>
  );
};

export default QrCodePage;