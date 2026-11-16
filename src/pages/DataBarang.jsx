import { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  MagnifyingGlass,
  Funnel,
  PencilSimple,
  Trash,
  WarningCircle,
  CheckCircle,
  Coins,
  Stack,
  DownloadSimple,
  X,
  CaretDown,
  ArrowUpRight
} from '@phosphor-icons/react';

const INITIAL_ITEMS = [
  { id: 'BRG-001', name: 'Beras Ramos 5kg', category: 'Sembako', buy: 65000, sell: 70000, stock: 24, unit: 'Sak' },
  { id: 'BRG-002', name: 'Minyak Goreng Bimoli 2L', category: 'Sembako', buy: 35000, sell: 38000, stock: 15, unit: 'Pcs' },
  { id: 'BRG-003', name: 'Gula Pasir 1kg', category: 'Sembako', buy: 15000, sell: 17000, stock: 40, unit: 'Bks' },
  { id: 'BRG-004', name: 'Telur Ayam 1kg', category: 'Sembako', buy: 28000, sell: 30000, stock: 12, unit: 'Kg' },
  { id: 'BRG-005', name: 'Indomie Goreng (Dus)', category: 'Makanan', buy: 110000, sell: 120000, stock: 8, unit: 'Dus' },
];

const CATEGORIES = ['Semua', 'Sembako', 'Makanan', 'Minuman'];

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

const DataBarang = () => {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'safe', 'low'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [formItem, setFormItem] = useState({
    id: '',
    name: '',
    category: 'Sembako',
    buy: '',
    sell: '',
    stock: '',
    unit: 'Pcs'
  });

  // Delete Confirm State
  const [itemToDelete, setItemToDelete] = useState(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // KPI calculations
  const stats = useMemo(() => {
    const totalSKU = items.length;
    const totalStock = items.reduce((acc, curr) => acc + Number(curr.stock || 0), 0);
    const totalAssetValue = items.reduce((acc, curr) => acc + (Number(curr.buy || 0) * Number(curr.stock || 0)), 0);
    const lowStockCount = items.filter((item) => Number(item.stock) <= 10).length;
    return { totalSKU, totalStock, totalAssetValue, lowStockCount };
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;

      let matchStock = true;
      if (stockFilter === 'safe') {
        matchStock = Number(item.stock) > 10;
      } else if (stockFilter === 'low') {
        matchStock = Number(item.stock) <= 10;
      }

      return matchSearch && matchCategory && matchStock;
    });
  }, [items, searchQuery, selectedCategory, stockFilter]);

  // Open Modal Add
  const handleOpenAdd = () => {
    const nextNum = items.length + 1;
    const nextId = `BRG-${String(nextNum).padStart(3, '0')}`;
    setFormItem({
      id: nextId,
      name: '',
      category: 'Sembako',
      buy: '',
      sell: '',
      stock: '',
      unit: 'Pcs'
    });
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Open Modal Edit
  const handleOpenEdit = (item) => {
    setFormItem({ ...item });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Submit Modal
  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!formItem.name.trim()) return;

    const buyNum = Number(formItem.buy) || 0;
    const sellNum = Number(formItem.sell) || 0;
    const stockNum = Number(formItem.stock) || 0;

    if (modalMode === 'add') {
      const newItem = {
        ...formItem,
        buy: buyNum,
        sell: sellNum,
        stock: stockNum,
      };
      setItems([newItem, ...items]);
      showToast('Barang berhasil ditambahkan ke inventaris!');
    } else {
      setItems(items.map((it) => (it.id === formItem.id ? { ...formItem, buy: buyNum, sell: sellNum, stock: stockNum } : it)));
      showToast('Data barang berhasil diperbarui!');
    }
    setIsModalOpen(false);
  };

  // Delete Item
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setItems(items.filter((it) => it.id !== itemToDelete.id));
      showToast(`Barang ${itemToDelete.name} berhasil dihapus.`);
      setItemToDelete(null);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Kode,Nama Barang,Kategori,Harga Beli,Harga Jual,Stok,Satuan'];
    const rows = items.map(
      (i) => `"${i.id}","${i.name}","${i.category}",${i.buy},${i.sell},${i.stock},"${i.unit || 'Pcs'}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventaris_Kios_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh!');
  };

  return (
    <div className="page-content">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1000,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <CheckCircle size={20} color="#22c55e" weight="fill" />
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-title">
          <h2>Inventaris Barang</h2>
          <p className="page-header-subtitle">
            Kelola katalog produk, pantau persediaan stok, dan kendalikan margin harga.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={handleExportCSV}>
            <DownloadSimple size={16} weight="bold" /> Export CSV
          </button>
          <button className="btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} weight="bold" /> Tambah Barang
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="cards-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Package size={22} weight="fill" />
          </div>
          <div className="stat-details">
            <h3>Total Produk</h3>
            <p>
              {stats.totalSKU} <span>SKU</span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Stack size={22} weight="fill" />
          </div>
          <div className="stat-details">
            <h3>Total Stok Fisik</h3>
            <p>
              {stats.totalStock} <span>Unit</span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Coins size={22} weight="fill" />
          </div>
          <div className="stat-details">
            <h3>Nilai Aset Stok</h3>
            <p style={{ fontSize: '18px' }}>{formatRupiah(stats.totalAssetValue)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rose">
            <WarningCircle size={22} weight="fill" />
          </div>
          <div className="stat-details">
            <h3>Stok Kritis / Menipis</h3>
            <p style={{ color: stats.lowStockCount > 0 ? '#e11d48' : 'inherit' }}>
              {stats.lowStockCount} <span>Item</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="table-card">
        {/* Toolbar: Search, Category Pills, and Filters */}
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 280px' }}>
              <MagnifyingGlass
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="Cari kode, nama barang, atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 40px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '13.5px',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  transition: '0.2s',
                  color: 'var(--text-main)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.backgroundColor = '#f8fafc';
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                const count =
                  cat === 'Semua'
                    ? items.length
                    : items.filter((i) => i.category === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: isActive ? 'rgba(14, 165, 233, 0.1)' : 'white',
                      color: isActive ? 'var(--primary)' : 'var(--text-main)',
                      fontSize: '12.5px',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: '0.15s ease'
                    }}
                  >
                    <span>{cat}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor: isActive ? 'var(--primary)' : '#f1f5f9',
                        color: isActive ? 'white' : 'var(--text-muted)',
                        fontWeight: 600
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Funnel size={16} color="var(--text-muted)" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                fontSize: '13px',
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
                fontWeight: 500
              }}
            >
              <option value="all">Semua Status Stok</option>
              <option value="safe">Stok Aman (&gt; 10)</option>
              <option value="low">Stok Menipis (≤ 10)</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Kode</th>
                <th>Nama Barang</th>
                <th style={{ width: '130px' }}>Kategori</th>
                <th style={{ width: '140px' }}>Harga Beli</th>
                <th style={{ width: '160px' }}>Harga Jual</th>
                <th style={{ width: '150px' }}>Stok</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Package size={40} color="#94a3b8" />
                      <p style={{ fontWeight: 600, color: '#334155', fontSize: '15px' }}>
                        Tidak ada data barang yang cocok
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        Coba periksa kata kunci pencarian atau ubah filter yang dipilih.
                      </p>
                      {(searchQuery || selectedCategory !== 'Semua' || stockFilter !== 'all') && (
                        <button
                          className="btn-secondary"
                          style={{ marginTop: '8px', fontSize: '13px', padding: '6px 14px' }}
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('Semua');
                            setStockFilter('all');
                          }}
                        >
                          Reset Pencarian
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const marginPercent = item.buy > 0 ? (((item.sell - item.buy) / item.buy) * 100).toFixed(0) : 0;
                  const isLowStock = Number(item.stock) <= 10;
                  const categoryBadgeColor =
                    item.category === 'Sembako'
                      ? 'badge-blue'
                      : item.category === 'Makanan'
                      ? 'badge-amber'
                      : 'badge-purple';

                  return (
                    <tr key={item.id}>
                      {/* Kode */}
                      <td>
                        <span className="badge-code">{item.id}</span>
                      </td>

                      {/* Nama Barang */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '8px',
                              backgroundColor: '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--primary)',
                              flexShrink: 0
                            }}
                          >
                            <Package size={18} weight="duotone" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              Satuan: {item.unit || 'Pcs'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td>
                        <span className={`status-badge ${categoryBadgeColor}`}>
                          {item.category}
                        </span>
                      </td>

                      {/* Harga Beli */}
                      <td>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                          {formatRupiah(item.buy)}
                        </span>
                      </td>

                      {/* Harga Jual & Margin */}
                      <td>
                        <div>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            {formatRupiah(item.sell)}
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              marginLeft: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#15803d',
                              backgroundColor: '#dcfce7',
                              padding: '1px 5px',
                              borderRadius: '4px'
                            }}
                          >
                            <ArrowUpRight size={10} weight="bold" />
                            {marginPercent}%
                          </span>
                        </div>
                      </td>

                      {/* Stok */}
                      <td>
                        <span
                          className={`status-badge ${isLowStock ? 'badge-red' : 'badge-green'}`}
                          style={{
                            fontWeight: 600,
                            padding: '4px 10px',
                            gap: '6px'
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isLowStock ? '#ef4444' : '#10b981'
                            }}
                          />
                          {item.stock} {item.unit || 'Unit'}
                          {isLowStock && ' (Menipis)'}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            title="Edit Barang"
                            onClick={() => handleOpenEdit(item)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#334155',
                              transition: '0.15s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#e0f2fe';
                              e.currentTarget.style.color = '#0284c7';
                              e.currentTarget.style.borderColor = '#bae6fd';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#f8fafc';
                              e.currentTarget.style.color = '#334155';
                              e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                          >
                            <PencilSimple size={16} weight="bold" />
                          </button>

                          <button
                            title="Hapus Barang"
                            onClick={() => setItemToDelete(item)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#64748b',
                              transition: '0.15s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                              e.currentTarget.style.color = '#dc2626';
                              e.currentTarget.style.borderColor = '#fecaca';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#f8fafc';
                              e.currentTarget.style.color = '#64748b';
                              e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                          >
                            <Trash size={16} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="table-footer">
          <div>
            Menampilkan <strong>{filteredItems.length}</strong> dari <strong>{items.length}</strong> total barang
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              disabled
            >
              Sebelumnya
            </button>
            <span
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              1
            </span>
            <button
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              disabled
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tambah / Edit Barang */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Tambah Barang Baru' : 'Edit Data Barang'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem}>
              <div className="modal-body">
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: '0 0 140px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                      Kode Barang
                    </label>
                    <input
                      type="text"
                      value={formItem.id}
                      onChange={(e) => setFormItem({ ...formItem, id: e.target.value })}
                      required
                      placeholder="BRG-001"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                      Nama Barang
                    </label>
                    <input
                      type="text"
                      value={formItem.name}
                      onChange={(e) => setFormItem({ ...formItem, name: e.target.value })}
                      required
                      placeholder="Contoh: Beras Pandan Wangi 5kg"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                      Kategori
                    </label>
                    <select
                      value={formItem.category}
                      onChange={(e) => setFormItem({ ...formItem, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="Sembako">Sembako</option>
                      <option value="Makanan">Makanan</option>
                      <option value="Minuman">Minuman</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                      Satuan
                    </label>
                    <input
                      type="text"
                      value={formItem.unit}
                      onChange={(e) => setFormItem({ ...formItem, unit: e.target.value })}
                      placeholder="Pcs / Sak / Kg / Dus"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                      Harga Beli (Rp)
                    </label>
                    <input
                      type="number"
                      value={formItem.buy}
                      onChange={(e) => setFormItem({ ...formItem, buy: e.target.value })}
                      required
                      min="0"
                      placeholder="65000"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                      Harga Jual (Rp)
                    </label>
                    <input
                      type="number"
                      value={formItem.sell}
                      onChange={(e) => setFormItem({ ...formItem, sell: e.target.value })}
                      required
                      min="0"
                      placeholder="70000"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                    Stok Saat Ini
                  </label>
                  <input
                    type="number"
                    value={formItem.stock}
                    onChange={(e) => setFormItem({ ...formItem, stock: e.target.value })}
                    required
                    min="0"
                    placeholder="20"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {modalMode === 'add' ? 'Simpan Barang' : 'Perbarui Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {itemToDelete && (
        <div className="modal-overlay" onClick={() => setItemToDelete(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px 20px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <Trash size={26} weight="fill" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Hapus Data Barang?
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Apakah Anda yakin ingin menghapus <strong>{itemToDelete.name}</strong> ({itemToDelete.id})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setItemToDelete(null)}>
                Batal
              </button>
              <button
                className="btn-primary"
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                onClick={handleConfirmDelete}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataBarang;