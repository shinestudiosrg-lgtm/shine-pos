import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncToGoogleSheets, fetchFromGoogleSheets } from '../services/googleSheets';

const DataContext = createContext();

// Helper to sanitize deleteRequest object
const parseDeleteRequest = (req) => {
  if (!req) return null;
  if (typeof req === 'string') {
    if (req === 'null' || req === 'undefined' || req.trim() === '' || req.trim() === '{}') return null;
    try {
      const parsed = JSON.parse(req);
      if (parsed && typeof parsed === 'object' && (parsed.reason || parsed.requestedBy)) {
        return parsed;
      }
    } catch (e) {
      return null;
    }
  }
  if (typeof req === 'object' && (req.reason || req.requestedBy)) {
    return req;
  }
  return null;
};

const parseNumberSafe = (val, defaultVal = 0) => {
  if (val === null || val === undefined || val === '') return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  const cleaned = String(val).replace(/[^\d.-]/g, '');
  const num = Number(cleaned);
  return isNaN(num) ? defaultVal : num;
};

// Photo Studio, Photo Box & Photobooth Categories
const INITIAL_CATEGORIES = [
  'Semua', 
  'Photo Studio', 
  'Photo Box', 
  'Photobooth', 
  'Cetak Foto & Frame', 
  'Aksesoris & Merchandise'
];

// Exact Fixed Pricelist Products (17 Layanan Resmi Shine Self Photo & Photobooth)
const INITIAL_PRODUCTS = [
  // 1. Photo Studio Single Packages
  {
    id: 'prd-ps-01',
    sku: 'PS-BSC',
    name: 'Studio Basic Package (15k/org)',
    category: 'Photo Studio',
    buyPrice: 3000,
    sellPrice: 15000,
    stock: 94,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&auto=format&fit=crop&q=80',
    description: '1 Orang, Durasi 7 Menit, Bebas Aksesoris, Free All Softfile, Tanpa Cetakan'
  },
  {
    id: 'prd-pbt-06',
    sku: 'PS-PRM',
    name: 'Studio Promo',
    category: 'Photo Studio',
    buyPrice: 20000,
    sellPrice: 20000,
    stock: 11,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&auto=format&fit=crop&q=80',
    description: 'Studio Promo Package'
  },
  {
    id: 'prd-ps-02',
    sku: 'PS-PRM',
    name: 'Studio Premium Package (25k/org)',
    category: 'Photo Studio',
    buyPrice: 5000,
    sellPrice: 25000,
    stock: 100,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&auto=format&fit=crop&q=80',
    description: '1 Orang, Durasi 17 Menit, Bebas Aksesoris, Free 1 Print Out/Orang, Free All Softfile'
  },
  {
    id: 'prd-ps-03',
    sku: 'PS-GLD',
    name: 'Studio Gold Package (35k/org)',
    category: 'Photo Studio',
    buyPrice: 8000,
    sellPrice: 35000,
    stock: 100,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80',
    description: '1 Orang, Durasi 15 Menit, Bebas Aksesoris, Free 1 Print Out/Orang, Free All Softfile, Free Bingkai 4R/Orang'
  },
  {
    id: 'prd-ps-04',
    sku: 'PS-GRP',
    name: 'Studio Group Package (Max 5 Org)',
    category: 'Photo Studio',
    buyPrice: 30000,
    sellPrice: 150000,
    stock: 100,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&auto=format&fit=crop&q=80',
    description: 'Max 5 Orang, Durasi 25 Menit, Bebas Aksesoris, Free 1 Print Out/Orang 4R, Free All Softfile'
  },
  {
    id: 'prd-ps-05',
    sku: 'PS-FML',
    name: 'Studio Family Package (Max 5 Org)',
    category: 'Photo Studio',
    buyPrice: 45000,
    sellPrice: 200000,
    stock: 100,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&auto=format&fit=crop&q=80',
    description: 'Max 5 Orang, Durasi 30 Menit, Bebas Aksesoris, Free 1 Print Out/Orang 4R, Free All Softfile, Free Cetak Foto + Bingkai A4'
  },
  {
    id: 'prd-ps-06',
    sku: 'PS-BDL',
    name: 'Bundling Package (Studio + Photobox 2 Org)',
    category: 'Photo Studio',
    buyPrice: 15000,
    sellPrice: 80000,
    stock: 100,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
    description: '2 Orang, 15 Min Self-Photo Studio & 8 Min Photobox, All Softfile, Free Printed Photo/Org, Free Edit'
  },
  {
    id: 'prd-ps-07',
    sku: 'PS-ADD-ORG',
    name: 'Penambahan Orang Studio/Bundling',
    category: 'Photo Studio',
    buyPrice: 5000,
    sellPrice: 35000,
    stock: 100,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&auto=format&fit=crop&q=80',
    description: 'Penambahan per orang (Max 4 Orang)'
  },
  {
    id: 'prd-ps-08',
    sku: 'PS-ADD-WKT',
    name: 'Tambahan Waktu Studio (400k/jam)',
    category: 'Photo Studio',
    buyPrice: 50000,
    sellPrice: 400000,
    stock: 100,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    description: 'Tambahan Waktu Durasi Photo Studio 1 Jam'
  },
  {
    id: 'prd-ps-09',
    sku: 'PS-ADD-HRH',
    name: 'Tambahan Waktu Studio Hari H (500k/jam)',
    category: 'Photo Studio',
    buyPrice: 60000,
    sellPrice: 500000,
    stock: 100,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    description: 'Tambahan Waktu Photo Studio di Hari H 1 Jam'
  },

  // 2. Photobox Packages
  {
    id: 'prd-pb-01',
    sku: 'PB-BSC',
    name: 'Photobox Basic Package (10k/org)',
    category: 'Photo Box',
    buyPrice: 2000,
    sellPrice: 10000,
    stock: 100,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&auto=format&fit=crop&q=80',
    description: '1 Orang, Durasi 5 Menit, Bebas Aksesoris, Free All Softfile, Tanpa Cetakan'
  },
  {
    id: 'prd-pb-02',
    sku: 'PB-PRM',
    name: 'Photobox Premium Package (20k/org)',
    category: 'Photo Box',
    buyPrice: 4000,
    sellPrice: 20000,
    stock: 100,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&auto=format&fit=crop&q=80',
    description: '1 Orang, Durasi 12 Menit, Bebas Aksesoris, Free 1 Print Out/Orang, Free All Softfile'
  },
  {
    id: 'prd-pbt-07',
    sku: 'PB-PRM',
    name: 'Photobox Promo',
    category: 'Photo Box',
    buyPrice: 15000,
    sellPrice: 15000,
    stock: 29,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&auto=format&fit=crop&q=80',
    description: 'Photobox Promo Package'
  },
  {
    id: 'prd-pb-03',
    sku: 'PB-GLD',
    name: 'Photobox Gold Package (25k/org)',
    category: 'Photo Box',
    buyPrice: 5000,
    sellPrice: 25000,
    stock: 100,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&auto=format&fit=crop&q=80',
    description: '1 Orang, Durasi 17 Menit, Bebas Aksesoris, Free 1 Print Out/Orang, Free All Softfile, Free Cetakan 4R/Orang'
  },

  // 3. Photobooth Unlimited 3 Jam Packages
  {
    id: 'prd-pbt-01',
    sku: 'PBT-2R',
    name: 'Photobooth 2R Package (Unlimited 3 Jam)',
    category: 'Photobooth',
    buyPrice: 500000,
    sellPrice: 1900000,
    stock: 100,
    minStock: 2,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
    description: 'Selfie Machine, Unlimited Print 2R, Properti, Lighting, Softcopy Barcode, Crew 3 Person, Frame Paper, Transport 10KM'
  },
  {
    id: 'prd-pbt-02',
    sku: 'PBT-4R',
    name: 'Photobooth 4R Package (Unlimited 3 Jam)',
    category: 'Photobooth',
    buyPrice: 600000,
    sellPrice: 2300000,
    stock: 100,
    minStock: 2,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
    description: 'Selfie Machine, Unlimited Print 4R, Properti, Lighting, Softcopy Barcode, Crew 3 Person, Frame Paper, Transport 10KM'
  },
  {
    id: 'prd-pbt-03',
    sku: 'PBT-NOPRINT',
    name: 'Photobooth No Print Package (Unlimited 3 Jam)',
    category: 'Photobooth',
    buyPrice: 300000,
    sellPrice: 1000000,
    stock: 100,
    minStock: 2,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
    description: 'Selfie Machine, Properti Fun, Professional Lighting, Softcopy Link Barcode, Crew Standby 2 Person, GIF/Boomerang, Transport 10KM'
  },
  {
    id: 'prd-pbt-04',
    sku: 'PBT-ADD-WKT',
    name: 'Tambahan Waktu Photobooth (400k/jam)',
    category: 'Photobooth',
    buyPrice: 50000,
    sellPrice: 400000,
    stock: 100,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    description: 'Tambahan Waktu Photobooth 1 Jam'
  },
  {
    id: 'prd-pbt-05',
    sku: 'PBT-ADD-HRH',
    name: 'Tambahan Waktu Photobooth Hari H (500k/jam)',
    category: 'Photobooth',
    buyPrice: 60000,
    sellPrice: 500000,
    stock: 100,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    description: 'Tambahan Waktu Photobooth di Hari H 1 Jam'
  }
];

const INITIAL_CUSTOMERS = [
  { id: 'cst-1', name: 'Umum / Walk-in Customer', phone: '-', points: 0, totalSpend: 0 }
];

const INITIAL_INVOICES = [];

const INITIAL_SETTINGS = {
  storeName: 'Shine Self Photo & Photobooth',
  address: 'Perum. Persada Banten Blok I1 No 5, Kel. Kepuren Kec. Walantaka Kota Serang',
  phone: '085121809135',
  taxRate: 11,
  receiptFooter: 'Terima kasih telah berfoto di Shine Self Photo & Photobooth! Abadikan setiap momen berharga Anda.',
  sheetsUrl: 'https://script.google.com/macros/s/AKfycbyKs5hVq7jfuQqDdsBvTb_g1I-vDCwmes_bhT049Bdl1gdAYn-vTRA4kJt4U0XjeMUp/exec',
  waApiUrl: '',
  waApiKey: '',
  waAutoSend: false
};

export const DataProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('shine_pos_products');
    if (!saved) return INITIAL_PRODUCTS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState(INITIAL_CATEGORIES);

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('shine_pos_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('shine_pos_invoices');
    if (!saved) return INITIAL_INVOICES;
    try {
      const parsed = JSON.parse(saved);
      return parsed.map(inv => ({
        ...inv,
        deleteRequest: parseDeleteRequest(inv.deleteRequest)
      }));
    } catch (e) {
      return INITIAL_INVOICES;
    }
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('shine_pos_settings');
    const parsed = saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    return {
      ...parsed,
      storeName: 'Shine Self Photo & Photobooth',
      address: 'Perum. Persada Banten Blok I1 No 5, Kel. Kepuren Kec. Walantaka Kota Serang',
      phone: '085121809135',
      sheetsUrl: 'https://script.google.com/macros/s/AKfycbyKs5hVq7jfuQqDdsBvTb_g1I-vDCwmes_bhT049Bdl1gdAYn-vTRA4kJt4U0XjeMUp/exec',
      waApiUrl: parsed.waApiUrl || '',
      waApiKey: parsed.waApiKey || '',
      waAutoSend: parsed.waAutoSend !== undefined ? parsed.waAutoSend : false
    };
  });

  const [currentShift, setCurrentShift] = useState(() => {
    const saved = localStorage.getItem('shine_pos_shift');
    return saved ? JSON.parse(saved) : {
      isOpen: true,
      openedAt: new Date().toISOString(),
      initialCash: 0,
      cashierName: 'Owner Studio'
    };
  });

  const [cloudSyncing, setCloudSyncing] = useState(false);

  // Automatic Real-Time Multi-Device Sync
  const pullCloudData = async () => {
    if (!settings?.sheetsUrl) return;
    setCloudSyncing(true);
    const cloudData = await fetchFromGoogleSheets(settings.sheetsUrl);
    setCloudSyncing(false);

    if (cloudData) {
      // 1. Sync Products (Deduplicate & accept any valid products list)
      if (Array.isArray(cloudData.products) && cloudData.products.length > 0) {
        const seen = new Set();
        const parsedProducts = [];
        for (const p of cloudData.products) {
          const key = (p.id || p.sku || p.name).toString().trim().toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            parsedProducts.push({
              ...p,
              id: p.id || `prd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              sku: p.sku || 'SKU-000',
              name: p.name || 'Produk Tanpa Nama',
              category: p.category || 'Photo Studio',
              buyPrice: parseNumberSafe(p.buyPrice, 0),
              sellPrice: parseNumberSafe(p.sellPrice, 0),
              stock: parseNumberSafe(p.stock, 100),
              minStock: parseNumberSafe(p.minStock, 5),
              image: p.image || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&auto=format&fit=crop&q=80',
              description: p.description || ''
            });
          }
        }
        setProducts(parsedProducts);
      }

      // 2. Sync Invoices (Sanitize deleteRequest)
      if (Array.isArray(cloudData.invoices) && cloudData.invoices.length > 0) {
        const parsedInvoices = cloudData.invoices.map(inv => {
          let parsedItems = [];
          if (typeof inv.items === 'string') {
            try {
              parsedItems = JSON.parse(inv.items);
            } catch(e) {
              parsedItems = [];
            }
          } else if (Array.isArray(inv.items)) {
            parsedItems = inv.items;
          }

          return {
            ...inv,
            id: inv.id || `inv-${Date.now()}`,
            invoiceNumber: inv.invoiceNumber || 'INV-000',
            date: inv.date || new Date().toISOString(),
            cashierName: inv.cashierName || 'Kasir',
            customerName: inv.customerName || 'Umum',
            items: parsedItems,
            subtotal: parseNumberSafe(inv.subtotal, 0),
            discount: parseNumberSafe(inv.discount, 0),
            tax: parseNumberSafe(inv.tax, 0),
            grandTotal: parseNumberSafe(inv.grandTotal, 0),
            paymentMethod: inv.paymentMethod || 'Tunai',
            status: inv.status || 'Lunas',
            deleteRequest: parseDeleteRequest(inv.deleteRequest)
          };
        });
        setInvoices(parsedInvoices);
      }

      // 3. Sync Customers
      if (Array.isArray(cloudData.customers) && cloudData.customers.length > 0) {
        const parsedCustomers = cloudData.customers.map(c => ({
          ...c,
          points: parseNumberSafe(c.points, 0),
          totalSpend: parseNumberSafe(c.totalSpend, 0)
        }));
        setCustomers(parsedCustomers);
      }
    }
  };

  useEffect(() => {
    if (!settings?.sheetsUrl) return;
    pullCloudData();
    const interval = setInterval(() => {
      pullCloudData();
    }, 10000);
    return () => clearInterval(interval);
  }, [settings?.sheetsUrl]);

  useEffect(() => {
    localStorage.setItem('shine_pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('shine_pos_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('shine_pos_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('shine_pos_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('shine_pos_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('shine_pos_shift', JSON.stringify(currentShift));
  }, [currentShift]);

  // Product Actions
  const addProduct = (prodData) => {
    const newProd = {
      id: `prd-${Date.now()}`,
      sku: prodData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      ...prodData,
      buyPrice: Number(prodData.buyPrice) || 0,
      sellPrice: Number(prodData.sellPrice) || 0,
      stock: Number(prodData.stock) || 100,
      minStock: Number(prodData.minStock) || 5
    };
    const nextProds = [newProd, ...products];
    setProducts(nextProds);
    if (settings?.sheetsUrl) {
      syncToGoogleSheets(settings.sheetsUrl, 'syncProducts', nextProds);
    }
  };

  const updateProduct = (id, prodData) => {
    const nextProds = products.map(p => p.id === id ? { ...p, ...prodData } : p);
    setProducts(nextProds);
    if (settings?.sheetsUrl) {
      syncToGoogleSheets(settings.sheetsUrl, 'syncProducts', nextProds);
    }
  };

  const deleteProduct = (id) => {
    const nextProds = products.filter(p => p.id !== id);
    setProducts(nextProds);
    if (settings?.sheetsUrl) {
      syncToGoogleSheets(settings.sheetsUrl, 'syncProducts', nextProds);
    }
  };

  const adjustStock = (productId, deltaAmount) => {
    const nextProds = products.map(p => {
      if (p.id === productId) {
        return { ...p, stock: Math.max(0, p.stock + deltaAmount) };
      }
      return p;
    });
    setProducts(nextProds);
    if (settings?.sheetsUrl) {
      syncToGoogleSheets(settings.sheetsUrl, 'syncProducts', nextProds);
    }
  };

  const syncProductsToCloud = async (customProds) => {
    const prodsToSync = customProds || products;
    if (!settings?.sheetsUrl) return { success: false, message: 'URL Google Sheets belum diatur' };
    setCloudSyncing(true);
    const res = await syncToGoogleSheets(settings.sheetsUrl, 'syncProducts', prodsToSync);
    setCloudSyncing(false);
    return res;
  };

  // Customer Actions
  const addCustomer = (custData) => {
    const newCust = {
      id: `cst-${Date.now()}`,
      name: custData.name,
      phone: custData.phone || '-',
      points: 0,
      totalSpend: 0
    };
    setCustomers(prev => [...prev, newCust]);
  };

  // Transaction Checkout
  const createTransaction = (txData) => {
    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString(),
      ...txData,
      status: 'Lunas',
      deleteRequest: null
    };

    // Decrement Stock
    const nextProds = products.map(p => {
      const cartItem = txData.items.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
      }
      return p;
    });
    setProducts(nextProds);

    // Update Customer Spend & Points — capture nextCustomers for sync
    let nextCustomers = null;
    if (txData.customerId && txData.customerId !== 'cst-1') {
      const earnedPoints = Math.floor(txData.grandTotal / 1000);
      setCustomers(prev => {
        const updated = prev.map(c => {
          if (c.id === txData.customerId) {
            return { ...c, totalSpend: c.totalSpend + txData.grandTotal, points: c.points + earnedPoints };
          }
          return c;
        });
        nextCustomers = updated;
        return updated;
      });
    }

    setInvoices(prev => [newInvoice, ...prev]);

    if (settings?.sheetsUrl) {
      syncToGoogleSheets(settings.sheetsUrl, 'createTransaction', newInvoice);
      syncToGoogleSheets(settings.sheetsUrl, 'syncProducts', nextProds);
      if (nextCustomers) {
        syncToGoogleSheets(settings.sheetsUrl, 'syncCustomers', nextCustomers);
      }
    }

    return newInvoice;
  };

  const deleteTransaction = (invoiceId) => {
    const targetInv = invoices.find(i => i.id === invoiceId);
    if (!targetInv) return;

    if (targetInv.status !== 'Refunded') {
      const nextProds = products.map(p => {
        const item = targetInv.items.find(i => i.id === p.id);
        if (item) {
          return { ...p, stock: p.stock + item.qty };
        }
        return p;
      });
      setProducts(nextProds);
      if (settings?.sheetsUrl) {
        syncToGoogleSheets(settings.sheetsUrl, 'syncProducts', nextProds);
      }
    }

    const nextInvoices = invoices.filter(i => i.id !== invoiceId);
    setInvoices(nextInvoices);
    if (settings?.sheetsUrl) {
      syncToGoogleSheets(settings.sheetsUrl, 'syncInvoices', nextInvoices);
    }
  };

  const requestDeleteTransaction = (invoiceId, reason, cashierName) => {
    setInvoices(prev => prev.map(i => {
      if (i.id === invoiceId) {
        return {
          ...i,
          deleteRequest: {
            reason: reason || 'Kesalahan input transaksi',
            requestedBy: cashierName,
            requestedAt: new Date().toISOString()
          }
        };
      }
      return i;
    }));
  };

  const approveDeleteTransaction = (invoiceId) => {
    deleteTransaction(invoiceId);
  };

  const rejectDeleteTransaction = (invoiceId) => {
    setInvoices(prev => prev.map(i => {
      if (i.id === invoiceId) {
        return { ...i, deleteRequest: null };
      }
      return i;
    }));
  };

  const clearAllDeleteRequests = () => {
    setInvoices(prev => prev.map(i => ({ ...i, deleteRequest: null })));
  };

  const pendingDeleteInvoicesCount = invoices.filter(i => 
    i.deleteRequest && 
    typeof i.deleteRequest === 'object' && 
    Boolean(i.deleteRequest.reason || i.deleteRequest.requestedBy)
  ).length;

  return (
    <DataContext.Provider value={{
      products,
      categories,
      customers,
      invoices,
      pendingDeleteInvoicesCount,
      settings,
      currentShift,
      cloudSyncing,
      pullCloudData,
      syncProductsToCloud,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      addCustomer,
      createTransaction,
      deleteTransaction,
      requestDeleteTransaction,
      approveDeleteTransaction,
      rejectDeleteTransaction,
      clearAllDeleteRequests,
      setSettings,
      setCurrentShift
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
