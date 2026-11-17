import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  QrCode, 
  UserPlus, 
  Tag, 
  Percent, 
  CheckCircle,
  X,
  Barcode,
  ShoppingBag,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import ReceiptModal from '../components/ReceiptModal';

export default function Kasir() {
  const { products, categories, customers, createTransaction, currentShift } = useData();
  const { currentUser } = useAuth();

  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [skuInput, setSkuInput] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('cst-1');
  const [discountType, setDiscountType] = useState('nominal');
  const [discountValue, setDiscountValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [cashGiven, setCashGiven] = useState('');
  const [customerWaPhone, setCustomerWaPhone] = useState('');
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState(null);
  const [showMobileCart, setShowMobileCart] = useState(false);

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert(`Stok ${product.name} terbatas! (Sisa: ${product.stock})`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const targetProd = products.find(p => p.id === id);
        const newQty = item.qty + delta;
        if (newQty > (targetProd?.stock || 0)) {
          alert('Stok produk tidak mencukupi!');
          return item;
        }
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue('');
    setCashGiven('');
  };

  const handleSkuSubmit = (e) => {
    e.preventDefault();
    if (!skuInput.trim()) return;
    const prod = products.find(p => p.sku.toLowerCase() === skuInput.trim().toLowerCase());
    if (prod) {
      addToCart(prod);
      setSkuInput('');
    } else {
      alert(`Produk dengan SKU "${skuInput}" tidak ditemukan!`);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.sellPrice * item.qty), 0);
  const numDiscVal = Number(discountValue) || 0;
  const discountNominal = discountType === 'percent' 
    ? (subtotal * Math.min(100, numDiscVal)) / 100 
    : Math.min(subtotal, numDiscVal);

  const afterDiscount = Math.max(0, subtotal - discountNominal);
  const taxNominal = 0;
  const grandTotal = Math.round(afterDiscount + taxNominal);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalCartCount = cart.reduce((a, c) => a + c.qty, 0);

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    const currentCustObj = customers.find(c => c.id === selectedCustomer);
    setCustomerWaPhone(currentCustObj?.phone && currentCustObj.phone !== '-' ? currentCustObj.phone : '');
    setCashGiven(String(grandTotal));
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    const numCash = Number(cashGiven) || 0;
    if (paymentMethod === 'Tunai' && numCash < grandTotal) {
      alert('Uang tunai yang dimasukkan kurang dari total tagihan!');
      return;
    }

    const currentCustObj = customers.find(c => c.id === selectedCustomer);

    const txData = {
      cashierName: currentUser?.name || 'Kasir',
      customerId: selectedCustomer,
      customerName: currentCustObj?.name || 'Umum',
      customerPhone: customerWaPhone || (currentCustObj?.phone !== '-' ? currentCustObj?.phone : ''),
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.sellPrice,
        qty: item.qty,
        total: item.sellPrice * item.qty
      })),
      subtotal,
      discount: discountNominal,
      tax: taxNominal,
      grandTotal,
      paymentMethod,
      cashAmount: numCash,
      changeAmount: paymentMethod === 'Tunai' ? Math.max(0, numCash - grandTotal) : 0
    };

    const newInvoice = createTransaction(txData);
    setCompletedInvoice(newInvoice);
    setShowPaymentModal(false);
    setShowMobileCart(false);
    clearCart();
    setShowReceiptModal(true);
  };

  return (
    <div className="relative pb-24 lg:pb-0 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:h-[calc(100vh-6.5rem)]">
      {/* Left Column (Catalog) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full overflow-hidden">
        {/* Search & Barcode Bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari paket photo studio, box, booth, atau SKU..."
              className="shine-input shine-input-with-icon pr-4 py-2 text-xs"
            />
          </div>

          <form onSubmit={handleSkuSubmit} className="relative w-36 sm:w-44 flex items-center">
            <Barcode className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={skuInput}
              onChange={(e) => setSkuInput(e.target.value)}
              placeholder="Scan SKU..."
              className="shine-input pl-9 pr-3 py-2 text-xs font-mono"
            />
          </form>
        </div>

        {/* Category Pills (Shine Studio Filter Buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#ffd028] text-[#032653] border-2 border-[#032653] shadow-[2px_2px_0_#032653] scale-[1.02]'
                  : 'bg-white dark:bg-[#063b7a] text-[#5d6878] dark:text-[#e8f0ff] border-2 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653] font-bold'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 min-h-[350px]">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-16 text-[#5d6878] dark:text-white/60 font-bold text-xs">
              Belum ada layanan/produk di kategori ini.
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const isOutOfStock = prod.stock <= 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => !isOutOfStock && addToCart(prod)}
                  className={`shine-card-interactive p-4 flex flex-col justify-between select-none cursor-pointer group transition-all relative ${
                    isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-1'
                  }`}
                >
                  <div className="space-y-1.5">
                    {/* Top Row: SKU Badge & Category */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-black text-[10px] px-2 py-0.5 rounded-md bg-[#ffd028] text-[#032653] border border-[#032653] shadow-sm">
                        {prod.sku}
                      </span>
                      <span className="text-[10px] font-bold text-[#5d6878] dark:text-white/60 truncate">
                        {prod.category}
                      </span>
                    </div>

                    {/* Package Name */}
                    <h4 className="font-black text-xs sm:text-sm text-[#032653] dark:text-white group-hover:text-[#145ef3] transition-colors leading-snug line-clamp-2 pt-1">
                      {prod.name}
                    </h4>

                    {/* Description / Inclusions */}
                    {prod.description && (
                      <p className="text-[11px] text-[#5d6878] dark:text-white/70 font-medium line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Row: Price & Add Button */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#d9e1ec] dark:border-white/10">
                    <div>
                      <span className="block text-[10px] font-bold text-[#5d6878] dark:text-white/60">Tarif</span>
                      <span className="font-black text-xs sm:text-sm text-[#032653] dark:text-[#ffd028]">
                        {formatRp(prod.sellPrice)}
                      </span>
                    </div>

                    <button 
                      disabled={isOutOfStock}
                      title="Tambah ke Keranjang"
                      className="w-8 h-8 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] flex items-center justify-center font-black shadow-[2px_2px_0_#032653] group-hover:shadow-[3px_3px_0_#032653] group-hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] transition-all"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column (Cart & Checkout Panel Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col h-full shine-card overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b-2 border-[#032653] bg-[#032653] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#ffd028]" />
            <h3 className="font-black text-white text-sm">Keranjang Transaksi</h3>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#ffd028] text-[#032653] border border-[#032653]">
              {totalCartCount} Item
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-black text-rose-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan</span>
            </button>
          )}
        </div>

        {/* Customer Select */}
        <div className="p-3 border-b-2 border-[#d9e1ec] dark:border-white/10 bg-[#f4f7fb] dark:bg-[#06346b] flex items-center gap-2">
          <span className="text-xs font-black text-[#032653] dark:text-[#ffd028] whitespace-nowrap">Pelanggan:</span>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="flex-1 bg-white dark:bg-[#032653] text-[#032653] dark:text-white border-2 border-[#d9e1ec] dark:border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#063b7a]"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone !== '-' ? `(${c.phone})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#5d6878] dark:text-white/50 text-xs py-10">
              <ShoppingBag className="w-12 h-12 mb-2 text-[#063b7a] dark:text-[#ffd028] opacity-30" />
              <p className="font-black text-sm text-[#032653] dark:text-white">Keranjang masih kosong</p>
              <p className="text-[11px] mt-0.5">Klik paket di sebelah kiri untuk menambah ke transaksi</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl border-1.5 border-[#d9e1ec] dark:border-white/10 bg-[#f8fafd] dark:bg-white/5">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-black text-xs text-[#032653] dark:text-white truncate">{item.name}</p>
                  <p className="text-[11px] font-black text-[#063b7a] dark:text-[#ffd028]">{formatRp(item.sellPrice)}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 bg-white dark:bg-[#032653] border-1.5 border-[#d9e1ec] dark:border-white/20 rounded-lg p-0.5">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 rounded bg-[#f4f7fb] dark:bg-white/10 hover:bg-[#ffd028] hover:text-[#032653] text-[#032653] dark:text-white flex items-center justify-center font-black transition-colors"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                    <span className="w-6 text-center font-black text-xs text-[#032653] dark:text-white">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 rounded bg-[#ffd028] text-[#032653] hover:bg-[#ffda47] flex items-center justify-center font-black transition-colors"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Footer */}
        <div className="p-4 border-t-2 border-[#d9e1ec] dark:border-white/10 bg-[#f4f7fb] dark:bg-[#021d3f] space-y-3">
          {/* Discount Section */}
          <div className="flex items-center gap-2 text-xs">
            <Tag className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] shrink-0" />
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="bg-white dark:bg-[#032653] text-[#032653] dark:text-white border-2 border-[#d9e1ec] dark:border-white/20 rounded-xl px-2 py-1 font-bold text-xs"
            >
              <option value="nominal">Diskon (Rp)</option>
              <option value="percent">Diskon (%)</option>
            </select>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="0"
              className="flex-1 shine-input py-1 text-xs"
            />
          </div>

          {/* Pricing Totals */}
          <div className="space-y-1.5 text-xs text-[#5d6878] dark:text-white/70 pt-2 border-t border-[#d9e1ec] dark:border-white/10">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-[#032653] dark:text-white">{formatRp(subtotal)}</span>
            </div>
            {discountNominal > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Diskon:</span>
                <span>-{formatRp(discountNominal)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline text-sm font-black text-[#032653] dark:text-white pt-2 border-t-2 border-[#032653] dark:border-white/20">
              <span>Total Tagihan:</span>
              <span className="text-xl font-black text-[#032653] dark:text-[#ffd028]">
                {formatRp(grandTotal)}
              </span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handleOpenPayment}
            className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-[3px_3px_0_#032653] transition-all ${
              cart.length > 0
                ? 'bg-[#ffd028] text-[#032653] border-2 border-[#032653] hover:shadow-[4px_4px_0_#032653] active:translate-x-[1px] active:translate-y-[1px]'
                : 'bg-slate-200 text-slate-400 border-2 border-slate-300 opacity-50 cursor-not-allowed'
            }`}
          >
            <span>Bayar Transaksi Sekarang</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Floating Bottom Cart Bar for Mobile Screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-white dark:bg-[#032653] border-t-2 border-[#032653] shadow-2xl flex items-center justify-between gap-3">
        <button
          onClick={() => setShowMobileCart(true)}
          className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl bg-[#f4f7fb] dark:bg-[#06346b] border-2 border-[#d9e1ec] dark:border-white/10"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#ffd028] text-[#032653] border border-[#032653] flex items-center justify-center font-black text-xs">
              {totalCartCount}
            </div>
            <div className="text-left">
              <p className="text-[10px] text-[#5d6878] dark:text-white/70 font-bold uppercase">Keranjang</p>
              <p className="text-xs font-black text-[#032653] dark:text-[#ffd028]">{formatRp(grandTotal)}</p>
            </div>
          </div>
          <span className="text-[11px] font-black text-[#063b7a] dark:text-[#ffd028]">Lihat ↑</span>
        </button>

        <button
          disabled={cart.length === 0}
          onClick={handleOpenPayment}
          className={`px-5 py-2.5 rounded-xl font-black text-xs text-[#032653] border-2 border-[#032653] shadow-[2px_2px_0_#032653] ${
            cart.length > 0 ? 'bg-[#ffd028]' : 'bg-slate-200 text-slate-400 opacity-50'
          }`}
        >
          Bayar
        </button>
      </div>

      {/* Payment Modal (Shine Studio Theme) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#032653]/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md shine-card p-6 my-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#d9e1ec] dark:border-white/10 mb-4">
              <h3 className="font-black text-[#032653] dark:text-white text-base">Metode Pembayaran</h3>
              <button 
                onClick={() => setShowPaymentModal(false)} 
                className="p-1.5 rounded-lg bg-[#f4f7fb] dark:bg-white/10 text-[#032653] dark:text-white hover:bg-[#ffd028] hover:text-[#032653] transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="rounded-2xl p-4 text-center mb-5 bg-[#032653] text-white border-2 border-[#032653] shadow-[3px_3px_0_#ffd028]">
              <p className="text-xs text-[#ffd028] font-black uppercase tracking-wider mb-0.5">Total Tagihan Transaksi</p>
              <p className="text-3xl font-black text-white tracking-tight">
                {formatRp(grandTotal)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { id: 'Tunai', label: 'Tunai', icon: Banknote },
                { id: 'QRIS', label: 'QRIS', icon: QrCode },
                { id: 'Transfer', label: 'Transfer BRI', icon: CreditCard }
              ].map(m => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1.5 border-2 ${
                      active 
                        ? 'bg-[#ffd028] text-[#032653] border-[#032653] font-black shadow-[2px_2px_0_#032653]'
                        : 'bg-white dark:bg-[#06346b] text-[#5d6878] dark:text-white/70 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653]'
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                    <span className="text-xs font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'Tunai' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#032653] dark:text-[#ffd028] mb-1">
                    Uang Tunai dari Pelanggan (Rp)
                  </label>
                  <input
                    type="number"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    className="shine-input text-lg font-mono font-black"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[grandTotal, 50000, 100000].map(val => (
                    <button
                      key={val}
                      onClick={() => setCashGiven(String(val))}
                      className="py-2 rounded-xl bg-white dark:bg-[#06346b] border-2 border-[#d9e1ec] dark:border-white/20 text-xs font-black text-[#032653] dark:text-white hover:border-[#032653] hover:bg-[#ffd028] hover:text-[#032653] transition-colors"
                    >
                      {val === grandTotal ? 'Uang Pas' : formatRp(val)}
                    </button>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl border-2 border-[#d9e1ec] dark:border-white/10 bg-[#f4f7fb] dark:bg-[#06346b] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5d6878] dark:text-white/70">Kembalian:</span>
                  <span className={`text-lg font-mono font-black ${
                    Number(cashGiven) >= grandTotal ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                  }`}>
                    {formatRp(Math.max(0, (Number(cashGiven) || 0) - grandTotal))}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'QRIS' && (
              <div className="text-center py-2 space-y-2">
                <div className="w-52 bg-white p-3 rounded-2xl mx-auto shadow-md border-2 border-[#032653]">
                  <img 
                    src="/qris.jpg" 
                    alt="QRIS Shine Studio Photo" 
                    className="w-full h-auto rounded-xl object-contain"
                  />
                </div>
                <p className="text-[11px] text-[#063b7a] dark:text-[#ffd028] font-black">Shine Photo Studio • NMID: ID1026561875323</p>
                <p className="text-xs text-[#5d6878] dark:text-white/70 font-semibold">Tunjukkan QRIS kepada pelanggan untuk di-scan</p>
              </div>
            )}

            {paymentMethod === 'Transfer' && (
              <div className="p-4 rounded-xl bg-[#e8f0ff] dark:bg-[#06346b] border-2 border-[#063b7a] space-y-2.5 text-xs">
                <p className="text-[#032653] dark:text-[#ffd028] font-black uppercase tracking-wider">Rekening Resmi Studio:</p>
                <div className="p-3 bg-white dark:bg-[#032653] rounded-xl border-2 border-[#063b7a] flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-black text-[#032653] dark:text-white text-sm">Bank BRI</p>
                    <p className="text-[11px] text-[#5d6878] dark:text-white/70 font-semibold">a.n. Muhamad Saepi</p>
                  </div>
                  <span className="font-mono font-black text-[#063b7a] dark:text-[#ffd028] text-sm tracking-wider select-all">
                    385301091677533
                  </span>
                </div>
              </div>
            )}

            {/* Customer WhatsApp Input for Automated Receipt */}
            <div className="mt-4 pt-3 border-t-2 border-[#d9e1ec] dark:border-white/10">
              <label className="block text-xs font-black text-[#032653] dark:text-[#ffd028] mb-1">
                📱 No. WhatsApp Pelanggan (Kirim Struk Otomatis):
              </label>
              <input
                type="tel"
                value={customerWaPhone}
                onChange={(e) => setCustomerWaPhone(e.target.value)}
                placeholder="Contoh: 085121809135 (Opsional)"
                className="shine-input text-xs font-mono"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 rounded-xl bg-white dark:bg-[#06346b] border-2 border-[#032653] text-[#032653] dark:text-white font-black text-xs hover:bg-[#f4f7fb]"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-3 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-xs shadow-[2px_2px_0_#032653] hover:shadow-[3px_3px_0_#032653]"
              >
                Selesaikan Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Cart Drawer Overlay */}
      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-[#032653]/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#032653] rounded-t-3xl border-t-3 border-[#032653] max-h-[85vh] flex flex-col p-4 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#d9e1ec]">
              <h3 className="font-black text-sm text-[#032653] dark:text-white">Keranjang Transaksi ({totalCartCount})</h3>
              <button onClick={() => setShowMobileCart(false)} className="p-1 rounded-lg text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-xl border border-[#d9e1ec]">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-black text-xs text-[#032653] dark:text-white truncate">{item.name}</p>
                    <p className="text-[11px] font-black text-[#063b7a] dark:text-[#ffd028]">{formatRp(item.sellPrice)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded bg-slate-100 dark:bg-white/10 flex items-center justify-center font-black">-</button>
                    <span className="w-6 text-center font-black text-xs">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded bg-[#ffd028] text-[#032653] flex items-center justify-center font-black">+</button>
                    <button onClick={() => removeFromCart(item.id)} className="p-1 text-rose-500 ml-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t-2 border-[#d9e1ec] space-y-2">
              <div className="flex justify-between font-black text-sm text-[#032653] dark:text-white">
                <span>Total Tagihan:</span>
                <span className="text-[#032653] dark:text-[#ffd028]">{formatRp(grandTotal)}</span>
              </div>
              <button
                onClick={handleOpenPayment}
                className="w-full py-3 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-xs shadow-[2px_2px_0_#032653]"
              >
                Lanjut ke Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      <ReceiptModal
        invoice={completedInvoice}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />
    </div>
  );
}
