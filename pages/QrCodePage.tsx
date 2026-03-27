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
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto relative border border-white/10"
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10 backdrop-blur-sm"
          >
            <X size={20} className="text-white" />
          </button>

          <div className="p-10 md:p-16 flex flex-col items-center text-center">
            {/* Logo Section */}
            {logoUrl && (
              <div className="mb-8">
                <img src={logoUrl} alt="Business Logo" className="w-24 h-24 rounded-full object-cover border-4 border-white/10 shadow-lg" />
              </div>
            )}

            {/* Top Section */}
            <div className="space-y-4 mb-12">
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {businessName}
              </h3>
              <p className="text-lg text-slate-300 font-medium">
                Scan to explore our services
              </p>
            </div>

            {/* QR Code Section */}
            <div className="relative group mb-12">
              <div className="absolute -inset-4 bg-white/5 rounded-[3rem] blur-2xl group-hover:opacity-100 transition-opacity opacity-0" />
              <div className="relative bg-white p-8 rounded-[3rem] shadow-2xl border border-white/10">
                <img src={qrUrl} alt="QR Code" className="w-56 h-56 md:w-72 md:h-72 object-contain" />
              </div>
            </div>

            {/* Features Section */}
            <div className="space-y-4 mb-12 w-full max-w-xs">
              <div className="flex items-center gap-4 text-slate-200 font-medium justify-center text-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                <span>View Menu / Website</span>
              </div>
              <div className="flex items-center gap-4 text-slate-200 font-medium justify-center text-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                <span>Leave Feedback</span>
              </div>
              <div className="flex items-center gap-4 text-slate-200 font-medium justify-center text-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                <span>Connect With Us</span>
              </div>
            </div>

            {/* Footer */}
            <p className="text-sm font-medium text-slate-400">
              Thank you for visiting ✨
            </p>
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
  const businessId = ownerData?.business_id;
  const businessName = ownerData?.business_name || 'Our Business';
  
  // Use the new public QR route if business_id is available, otherwise fallback to slug
  const publicLink = businessId 
    ? `${window.location.origin}/q/${businessId}`
    : `${window.location.origin}/scan/${publicSlug}`;
    
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(publicLink)}`;

  const handleSimulateScan = () => {
    const simulateUrl = businessId ? `/q/${businessId}` : `/scan/${publicSlug}`;
    window.open(`${simulateUrl}?preview=true`, '_blank');
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
  };  const handlePrintPoster = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print the poster.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print QR Poster - ${businessName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f172a;
            color: #ffffff;
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
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px;
            box-sizing: border-box;
            position: relative;
          }
          .logo-container {
            margin-bottom: 40px;
          }
          .logo-img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid rgba(255,255,255,0.1);
          }
          .content-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            text-align: center;
            padding: 40px 0;
          }
          .header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }
          .business-name {
            font-size: 84px;
            font-weight: 900;
            letter-spacing: -0.05em;
            color: #ffffff;
            margin: 0;
            line-height: 1;
          }
          .subtext {
            font-size: 32px;
            font-weight: 500;
            color: #cbd5e1;
            margin: 0;
          }
          .qr-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .qr-container {
            background: #ffffff;
            padding: 50px;
            border-radius: 80px;
            box-shadow: 0 40px 80px -15px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.1);
          }
          .qr-image {
            width: 500px;
            height: 500px;
            display: block;
          }
          .features-list {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            margin-top: 40px;
          }
          .feature-item {
            font-size: 28px;
            font-weight: 500;
            color: #e2e8f0;
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .dot {
            width: 8px;
            height: 8px;
            background-color: rgba(255,255,255,0.5);
            border-radius: 50%;
          }
          .footer {
            font-size: 20px;
            font-weight: 500;
            color: #64748b;
            margin-top: 40px;
          }
        </style>
      </head>
      <body>
        <div class="poster-canvas">
          <div class="content-wrapper">
            <div class="header">
              ${ownerData?.logo_url ? `<div class="logo-container"><img src="${ownerData.logo_url}" class="logo-img" /></div>` : ''}
              <h1 class="business-name">${businessName}</h1>
              <p class="subtext">Scan to explore our services</p>
            </div>

            <div class="qr-section">
              <div class="qr-container">
                <img src="${qrApiUrl}" class="qr-image" onload="window.print(); window.onafterprint = function(){ window.close(); }" />
              </div>
            </div>

            <div class="features-list">
              <div class="feature-item"><div class="dot"></div> View Menu / Website</div>
              <div class="feature-item"><div class="dot"></div> Leave Feedback</div>
              <div class="feature-item"><div class="dot"></div> Connect With Us</div>
            </div>

            <div class="footer">
              Thank you for visiting ✨
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
        logoUrl={ownerData?.logo_url}
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