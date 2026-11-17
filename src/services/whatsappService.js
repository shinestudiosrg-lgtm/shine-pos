/**
 * Service to send receipts automatically via WhatsApp Gateway API
 * (Supports Fonnte, Starsender, Wablas, Waba, custom webhook, etc.)
 */

export const formatReceiptTextMessage = (invoice, settings) => {
  const formatRp = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  const dateFormatted = new Date(invoice.date || new Date()).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  let itemsListText = '';
  items.forEach((item, index) => {
    itemsListText += `${index + 1}. *${item.name}*\n   ${item.qty} x ${formatRp(item.price)} = ${formatRp(item.total)}\n`;
  });

  let message = `*${(settings?.storeName || 'SHINE PHOTO STUDIO & PHOTOBOOTH').toUpperCase()}*\n`;
  if (settings?.address) message += `📍 ${settings.address}\n`;
  if (settings?.phone) message += `📞 Telp/WA: ${settings.phone}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🧾 *STRUK PEMBAYARAN RESMI*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `• No. Faktur : *${invoice.invoiceNumber || 'INV-000'}*\n`;
  message += `• Tanggal    : ${dateFormatted}\n`;
  message += `• Kasir      : ${invoice.cashierName || 'Kasir'}\n`;
  message += `• Pelanggan  : ${invoice.customerName || 'Umum'}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*RINCIAN TRANSAKSI:*\n`;
  message += itemsListText;
  message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Subtotal  : ${formatRp(invoice.subtotal)}\n`;
  if (invoice.discount > 0) {
    message += `Diskon    : -${formatRp(invoice.discount)}\n`;
  }
  if (invoice.tax > 0) {
    message += `Pajak     : +${formatRp(invoice.tax)}\n`;
  }
  message += `*TOTAL     : ${formatRp(invoice.grandTotal)}*\n`;
  message += `Pembayaran: ${invoice.paymentMethod || 'Tunai'} (${formatRp(invoice.cashAmount || invoice.grandTotal)})\n`;
  if (invoice.changeAmount > 0) {
    message += `Kembalian : ${formatRp(invoice.changeAmount)}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `_${settings?.receiptFooter || 'Terima kasih telah berkunjung ke Shine Photo Studio! Abadikan setiap momen terbaik Anda.'}_\n`;

  return message;
};

export const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('+62')) {
    clean = '62' + clean.slice(3);
  } else if (!clean.startsWith('62') && clean.length >= 9) {
    clean = '62' + clean;
  }
  return clean;
};

export const sendWhatsAppReceipt = async (invoice, targetPhone, settings) => {
  if (!settings?.waApiUrl) {
    return {
      success: false,
      message: 'URL API WhatsApp belum diatur. Silakan atur di menu Pengaturan.'
    };
  }

  const cleanPhone = normalizePhoneNumber(targetPhone);
  if (!cleanPhone || cleanPhone.length < 9) {
    return {
      success: false,
      message: 'Nomor WhatsApp pelanggan tidak valid atau kosong.'
    };
  }

  const messageText = formatReceiptTextMessage(invoice, settings);

  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (settings.waApiKey) {
      headers['Authorization'] = settings.waApiKey;
      headers['apikey'] = settings.waApiKey;
      headers['token'] = settings.waApiKey;
    }

    // Universal payload structure accepted by Fonnte, Starsender, Wablas, Waba, Node Webhooks
    const payload = {
      target: cleanPhone,
      phone: cleanPhone,
      number: cleanPhone,
      to: cleanPhone,
      recipient: cleanPhone,
      message: messageText
    };

    const response = await fetch(settings.waApiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (response.ok) {
      return {
        success: true,
        message: '✅ Struk berhasil dikirim otomatis ke nomor WhatsApp pelanggan!',
        data: result
      };
    } else {
      return {
        success: false,
        message: `Gagal mengirim WhatsApp (Status ${response.status}): ${result.message || result.error || 'Periksa API Key / URL Endpoint Anda'}`
      };
    }
  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return {
      success: false,
      message: `Koneksi ke API WhatsApp gagal: ${error.message}`
    };
  }
};
