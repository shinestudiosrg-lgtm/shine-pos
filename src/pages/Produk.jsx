import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Image as ImageIcon,
  CheckCircle,
  X,
  Layers,
  TrendingUp,
  Sparkles,
  RefreshCw,
  UploadCloud,
  DownloadCloud
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function Produk() {
  const { products, categories, addProduct, updateProduct, deleteProduct, adjustStock, cloudSyncing, pullCloudData, syncProductsToCloud } = useData();
  const { currentUser } = useAuth();
  const isOwner = currentUser?.role === 'owner';

  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: categories[1] || 'Photo Studio',
    buyPrice: '',
    sellPrice: '',
    stock: 100,
    minStock: 5,
    image: '',
    description: ''
  });

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      category: categories[1] || 'Photo Studio',
      buyPrice: '',
      sellPrice: '',
      stock: 100,
      minStock: 5,
      image: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      category: prod.category,
      buyPrice: prod.buyPrice,
      sellPrice: prod.sellPrice,
      stock: prod.stock,
      minStock: prod.minStock,
      image: prod.image || '',
      description: prod.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setShowModal(false);
  };

  const handleDelete = (id, name) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      deleteProduct(id);
    }
  };

  const handlePullFromCloud = async () => {
    setSyncStatusMsg('Sedang menarik produk dari Google Sheets...');
    await pullCloudData();
    setSyncStatusMsg('✅ Produk berhasil disinkronkan dari Google Sheets!');
    setTimeout(() => setSyncStatusMsg(''), 4000);
  };

  const handlePushToCloud = async () => {
    setSyncStatusMsg('Sedang mengunggah produk ke Google Sheets...');
    const res = await syncProductsToCloud();
    if (res.success) {
      setSyncStatusMsg('✅ Seluruh produk berhasil diunggah ke Google Sheets!');
    } else {
      setSyncStatusMsg(`⚠️ Gagal sync: ${res.message || 'Koneksi error'}`);
    }
    setTimeout(() => setSyncStatusMsg(''), 4000);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#032653] dark:text-white tracking-tight">Katalog Layanan & Stok Studio</h1>
          <p className="text-xs text-[#5d6878] dark:text-white/70 font-semibold">Kelola daftar harga jual, paket photo studio, photo box, dan photobooth</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pull from Cloud Button */}
          <button
            onClick={handlePullFromCloud}
            disabled={cloudSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#063b7a] text-[#032653] dark:text-[#ffd028] border-2 border-[#032653] dark:border-[#ffd028] font-black text-xs shadow-[2px_2px_0_#032653] dark:shadow-[2px_2px_0_#ffd028] hover:bg-[#e8f0ff] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Ambil data produk terbaru dari Google Sheets"
          >
            <DownloadCloud className={`w-4 h-4 stroke-[2.5] ${cloudSyncing ? 'animate-bounce' : ''}`} />
            <span>Tarik dari Sheets</span>
          </button>

          {/* Push to Cloud Button (Owner only) */}
          {isOwner && (
            <button
              onClick={handlePushToCloud}
              disabled={cloudSyncing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#063b7a] text-[#032653] dark:text-[#ffd028] border-2 border-[#032653] dark:border-[#ffd028] font-black text-xs shadow-[2px_2px_0_#032653] dark:shadow-[2px_2px_0_#ffd028] hover:bg-[#e8f0ff] active:translate-x-[1px] active:translate-y-[1px] transition-all"
              title="Kirim katalog produk ini ke Google Sheets"
            >
              <UploadCloud className="w-4 h-4 stroke-[2.5]" />
              <span>Upload ke Sheets</span>
            </button>
          )}

          {isOwner && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-xs shadow-[3px_3px_0_#032653] hover:shadow-[4px_4px_0_#032653] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Layanan / Produk</span>
            </button>
          )}
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatusMsg && (
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-[#063b7a] border-2 border-[#145ef3] text-xs font-bold text-[#032653] dark:text-white flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-[#ffd028]" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="shine-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80 flex items-center">
          <Search className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama paket foto, SKU..."
            className="shine-input shine-input-with-icon pr-4 py-2 text-xs"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
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
      </div>

      {/* Products Table */}
      <div className="shine-table-wrap">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#032653] text-white">
              <tr>
                <th className="p-4 font-black text-[11px] uppercase tracking-wider">Paket / Layanan</th>
                <th className="p-4 font-black text-[11px] uppercase tracking-wider">SKU</th>
                <th className="p-4 font-black text-[11px] uppercase tracking-wider">Kategori</th>
                <th className="p-4 font-black text-[11px] uppercase tracking-wider">Harga Jual</th>
                <th className="p-4 font-black text-[11px] uppercase tracking-wider">Stok</th>
                {isOwner && <th className="p-4 font-black text-[11px] uppercase tracking-wider text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d9e1ec] dark:divide-white/10 bg-white dark:bg-[#06346b] text-[#101828] dark:text-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#5d6878] dark:text-white/60 font-bold">
                    Tidak ada layanan atau produk yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isLowStock = prod.stock <= prod.minStock && prod.stock > 0;
                  const isOutOfStock = prod.stock <= 0;

                  return (
                    <tr key={prod.id} className="hover:bg-[#f4f7fb] dark:hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-black text-[#032653] dark:text-white text-xs sm:text-sm">{prod.name}</p>
                          <p className="text-[11px] text-[#5d6878] dark:text-white/70 font-medium truncate max-w-sm mt-0.5">{prod.description || '-'}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-black text-[10px] bg-[#ffd028] text-[#032653] border border-[#032653] px-2 py-0.5 rounded-md shadow-sm">
                          {prod.sku}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-[#e8f0ff] dark:bg-white/10 text-[#063b7a] dark:text-[#ffd028] text-[11px] font-black border border-[#c7d9f7] dark:border-white/10">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-4 font-black text-[#032653] dark:text-[#ffd028] text-xs">
                        {formatRp(prod.sellPrice)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs">
                            {prod.stock} Pcs
                          </span>

                          {isLowStock && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded font-black">
                              Menipis
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="text-[10px] bg-rose-100 text-rose-800 border border-rose-300 px-1.5 py-0.5 rounded font-black">
                              Habis
                            </span>
                          )}
                        </div>
                      </td>

                      {isOwner && (
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              className="p-1.5 rounded-lg bg-white dark:bg-[#032653] border-2 border-[#032653] text-[#032653] dark:text-white hover:bg-[#ffd028] hover:text-[#032653] transition-colors"
                              title="Edit Produk"
                            >
                              <Edit className="w-3.5 h-3.5 stroke-[2.2]" />
                            </button>
                            <button
                              onClick={() => handleDelete(prod.id, prod.name)}
                              className="p-1.5 rounded-lg bg-rose-100 border-2 border-rose-400 text-rose-700 hover:bg-rose-500 hover:text-white transition-colors"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Product */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#032653]/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg shine-card p-6 my-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#d9e1ec] dark:border-white/10 mb-4">
              <h3 className="font-black text-[#032653] dark:text-white text-base">
                {editingProduct ? 'Edit Layanan / Paket Foto' : 'Tambah Paket / Produk Baru'}
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1.5 rounded-lg bg-[#f4f7fb] dark:bg-white/10 text-[#032653] dark:text-white hover:bg-[#ffd028] hover:text-[#032653] transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-[#032653] dark:text-[#ffd028] mb-1">Kode SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="shine-input font-mono"
                  />
                </div>
                <div>
                  <label className="block font-black text-[#032653] dark:text-[#ffd028] mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="shine-input"
                  >
                    {categories.filter(c => c !== 'Semua').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-[#032653] dark:text-white mb-1">Nama Paket / Layanan</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Studio Basic Package"
                  className="shine-input font-bold"
                />
              </div>

              <div>
                <label className="block font-black text-[#5d6878] dark:text-white/70 mb-1">Deskripsi & Fasilitas</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: 1 Orang, Durasi 7 Menit, Free All Softfile"
                  className="shine-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-[#032653] dark:text-[#ffd028] mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                    placeholder="15000"
                    className="shine-input font-black"
                  />
                </div>
                <div>
                  <label className="block font-black text-[#5d6878] dark:text-white/70 mb-1">Harga Modal / HPP (Rp)</label>
                  <input
                    type="number"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                    placeholder="3000"
                    className="shine-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-[#032653] dark:text-white mb-1">Jumlah Stok</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="shine-input font-bold"
                  />
                </div>
                <div>
                  <label className="block font-black text-[#032653] dark:text-white mb-1">Batas Minimal Stok</label>
                  <input
                    type="number"
                    required
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="shine-input font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t-2 border-[#d9e1ec] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#063b7a] border-2 border-[#032653] text-[#032653] dark:text-white font-black"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black shadow-[2px_2px_0_#032653] hover:shadow-[3px_3px_0_#032653]"
                >
                  {editingProduct ? 'Update Produk' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
