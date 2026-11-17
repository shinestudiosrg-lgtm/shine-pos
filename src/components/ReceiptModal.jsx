import React, { useState, useEffect } from 'react';
import { X, Printer, CheckCircle2, MessageCircle, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { sendWhatsAppReceipt, normalizePhoneNumber } from '../services/whatsappService';

export default function ReceiptModal({ invoice, isOpen, onClose }) {
  const { settings } = useData();

  const [customerPhone, setCustomerPhone] = useState('');
  const [isSendingWa, setIsSendingWa] = useState(false);
  const [waStatus, setWaStatus] = useState(null); // { type: 'success' | 'error', text: '' }

  useEffect(() => {
    if (invoice && isOpen) {
      const initialPhone = invoice.customerPhone || invoice.phone || '';
      setCustomerPhone(initialPhone);
      setWaStatus(null);

      // Auto-send via API if enabled in Settings and phone number exists
      if (settings?.waAutoSend && settings?.waApiUrl && initialPhone) {
        handleSendWa(initialPhone);
      }
    }
  }, [invoice, isOpen, settings?.waAutoSend, settings?.waApiUrl]);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWa = async (phoneToSend) => {
    const target = phoneToSend || customerPhone;
    if (!target) {
      setWaStatus({ type: 'error', text: 'Masukkan nomor WhatsApp pelanggan terlebih dahulu!' });
      return;
    }
    if (!settings?.waApiUrl) {
      setWaStatus({ 
        type: 'error', 
        text: 'URL API WhatsApp belum diatur. Masukkan link API di menu Pengaturan.' 
      });
      return;
    }

    setIsSendingWa(true);
    setWaStatus(null);
    const result = await sendWhatsAppReceipt(invoice, target, settings);
    setIsSendingWa(false);

    if (result.success) {
      setWaStatus({ type: 'success', text: result.message });
    } else {
      setWaStatus({ type: 'error', text: result.message });
    }
  };

  const formatRp = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#032653]/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md shine-card overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="p-4 bg-[#032653] text-white border-b-2 border-[#032653] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#ffd028] stroke-[2.5]" />
            <h3 className="font-black text-white text-sm">Bukti Pembayaran / Struk</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 text-white hover:bg-[#ffd028] hover:text-[#032653] transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div className="p-6 bg-white text-slate-900 font-mono text-xs shadow-inner select-text" id="thermal-receipt">
          {/* Store Info Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <h2 className="font-black text-base uppercase text-[#032653] tracking-wider">{settings?.storeName}</h2>
            <p className="text-[11px] text-slate-600 leading-tight mt-0.5">{settings?.address}</p>
            <p className="text-[11px] text-slate-600">Telp: {settings?.phone}</p>
          </div>

          {/* Invoice Metadata */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Faktur:</span>
              <span className="font-bold">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal:</span>
              <span>{new Date(invoice.date).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kasir:</span>
              <span>{invoice.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pelanggan:</span>
              <span>{invoice.customerName || 'Umum'}</span>
            </div>
            {invoice.customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">No. WA:</span>
                <span>{invoice.customerPhone}</span>
              </div>
            )}
          </div>

          {/* Purchased Items List */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
            {(Array.isArray(invoice.items) ? invoice.items : []).map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-semibold text-slate-900">{item.name}</div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>{item.qty} x {formatRp(item.price)}</span>
                  <span className="font-semibold text-slate-900">{formatRp(item.total)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Breakdown */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-slate-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatRp(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Diskon</span>
                <span>-{formatRp(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between">
                <span>Pajak (PPN {settings?.taxRate || 0}%)</span>
                <span>+{formatRp(invoice.tax || 0)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-[#032653] pt-1.5 border-t border-slate-200">
              <span>TOTAL</span>
              <span>{formatRp(invoice.grandTotal)}</span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-slate-700">
            <div className="flex justify-between">
              <span>Metode Pembayaran</span>
              <span className="font-bold text-slate-900 uppercase">{invoice.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Dibayar ({invoice.paymentMethod})</span>
              <span>{formatRp(invoice.cashAmount || invoice.grandTotal)}</span>
            </div>
            {invoice.changeAmount > 0 && (
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Kembalian</span>
                <span>{formatRp(invoice.changeAmount)}</span>
              </div>
            )}
          </div>

          {/* Struk Footer */}
          <div className="text-center pt-4 text-[10px] text-slate-500 leading-tight">
            <p className="italic">{settings?.receiptFooter}</p>
            <p className="mt-2 font-mono font-bold text-[#063b7a]">=== SHINE PHOTO STUDIO ===</p>
          </div>
        </div>

        {/* WhatsApp Receipt Automated Dispatch Panel */}
        <div className="p-4 bg-[#f8fafc] dark:bg-[#021833] border-t-2 border-[#d9e1ec] dark:border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-[#032653] dark:text-[#ffd028] flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
              <span>Kirim Struk Otomatis ke WhatsApp:</span>
            </label>
            {settings?.waAutoSend && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Auto-Send Aktif
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Contoh: 085121809135"
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#06346b] border-2 border-[#d9e1ec] dark:border-white/20 text-xs font-mono font-bold focus:border-[#032653] dark:focus:border-[#ffd028] focus:outline-none"
            />
            <button
              onClick={() => handleSendWa()}
              disabled={isSendingWa}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:translate-x-[1px] active:translate-y-[1px] text-white border-2 border-emerald-800 font-black text-xs shadow-[2px_2px_0_#064e3b] flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Kirim struk otomatis via WhatsApp Gateway API"
            >
              {isSendingWa ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span>{isSendingWa ? 'Mengirim...' : 'Kirim WA'}</span>
            </button>
          </div>

          {/* WA Dispatch Status Alert */}
          {waStatus && (
            <div
              className={`p-2.5 rounded-xl text-xs font-bold flex items-start gap-2 ${
                waStatus.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {waStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span className="flex-1 leading-snug">{waStatus.text}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#f4f7fb] dark:bg-[#032653] border-t-2 border-[#d9e1ec] dark:border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-black bg-white dark:bg-[#063b7a] border-2 border-[#032653] text-[#032653] dark:text-white hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-xs shadow-[2px_2px_0_#032653] hover:shadow-[3px_3px_0_#032653] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Cetak Struk Thermal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
