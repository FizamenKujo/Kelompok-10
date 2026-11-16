import { useState, useMemo } from 'react';
import {
  Bag,
  Plus,
  MagnifyingGlass,
  Funnel,
  DownloadSimple,
  Truck,
  CheckCircle,
  Clock,
  Receipt,
  X,
  Eye,
  Trash,
  Printer,
  CalendarBlank,
  Buildings,
  CurrencyDollar,
  Check
} from '@phosphor-icons/react';

const INITIAL_PURCHASES = [
  {
    id: 'PO-2026-001',
    date: '15 Nov 2026',
    supplier: 'PT Pangan Sejahtera Nusantara',
    contact: '0812-3456-7890 (Pak Budi)',
    items: [
      { name: 'Beras Ramos 5kg', qty: 40, unit: 'Sak', price: 65000 },
      { name: 'Gula Pasir 1kg', qty: 100, unit: 'Bks', price: 15000 }
    ],
    total: 4100000,
    shippingStatus: 'Diterima',
    paymentStatus: 'Lunas',
    notes: 'Barang telah dicek dan masuk ke rak gudang A.'
  },
  {
    id: 'PO-2026-002',
    date: '16 Nov 2026',
    supplier: 'Distributor Minyak Goreng Mandiri',
    contact: '0821-9876-5432 (Ibu Dewi)',
    items: [
      { name: 'Minyak Goreng Bimoli 2L', qty: 60, unit: 'Pcs', price: 35000 }
    ],
    total: 2100000,
    shippingStatus: 'Dalam Pengiriman',
    paymentStatus: 'Lunas',
    notes: 'Pengiriman via truk logistik armada distributor, estimasi tiba sore ini.'
  },
  {
    id: 'PO-2026-003',
    date: '16 Nov 2026',
    supplier: 'PT Indofood CBP Sukses',
    contact: '0813-1122-3344 (Sales Office)',
    items: [
      { name: 'Indomie Goreng (Dus)', qty: 25, unit: 'Dus', price: 110000 }
    ],
    total: 2750000,
    shippingStatus: 'Diproses',
    paymentStatus: 'Belum Lunas',
    notes: 'Faktur jatuh tempo 14 hari kalender setelah barang diterima.'
  },
  {
    id: 'PO-2026-004',
    date: '14 Nov 2026',
    supplier: 'Peternakan Ayam Berkah Unggas',
    contact: '0857-8899-0011 (Kang Asep)',
    items: [
      { name: 'Telur Ayam 1kg', qty: 50, unit: 'Kg', price: 28000 }
    ],
    total: 1400000,
    shippingStatus: 'Diterima',
    paymentStatus: 'Lunas',
    notes: 'Kondisi telur grade A segar, telah lolos sortir penerimaan.'
  },
  {
    id: 'PO-2026-005',
    date: '13 Nov 2026',
    supplier: 'CV Sumber Tepung Makmur',
    contact: '0819-2233-4455 (Hendra)',
    items: [
      { name: 'Tepung Terigu Segitiga Biru', qty: 30, unit: 'Sak', price: 60000 }
    ],
    total: 1800000,
    shippingStatus: 'Diterima',
    paymentStatus: 'Lunas',
    notes: 'Restok berkala bahan baku sembako.'
  }
];

const SHIPPING_TABS = ['Semua', 'Diterima', 'Dalam Pengiriman', 'Diproses'];

const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

const Pembelian = () => {
  const [purchases, setPurchases] = useState(INITIAL_PURCHASES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('Semua');
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'Lunas', 'Belum Lunas'

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [poToDelete, setPoToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State for new PO
  const [newPO, setNewPO] = useState({
    id: '',
    supplier: '',
    contact: '',
    date: new Date().toISOString().slice(0, 10),
    itemName: '',
    itemQty: '',
    itemUnit: 'Pcs',
    itemPrice: '',
    shippingStatus: 'Diproses',
    paymentStatus: 'Belum Lunas',
    notes: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // KPI calculations
  const stats = useMemo(() => {
    const totalSpent = purchases.reduce((acc, p) => acc + (p.total || 0), 0);
    const activeOrders = purchases.filter((p) => p.shippingStatus !== 'Diterima').length;
    const receivedOrders = purchases.filter((p) => p.shippingStatus === 'Diterima').length;
    const unpaidAmount = purchases
      .filter((p) => p.paymentStatus === 'Belum Lunas')
      .reduce((acc, p) => acc + (p.total || 0), 0);

    return { totalSpent, activeOrders, receivedOrders, unpaidAmount };
  }, [purchases]);

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchSearch =
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.items.some((it) => it.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTab = selectedTab === 'Semua' || p.shippingStatus === selectedTab;

      const matchPayment =
        paymentFilter === 'all' || p.paymentStatus === paymentFilter;

      return matchSearch && matchTab && matchPayment;
    });
  }, [purchases, searchQuery, selectedTab, paymentFilter]);

  // Handle Open Create Modal
  const handleOpenCreate = () => {
    const nextIndex = purchases.length + 1;
    const newId = `PO-2026-${String(nextIndex).padStart(3, '0')}`;
    setNewPO({
      id: newId,
      supplier: '',
      contact: '',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      itemName: '',
      itemQty: '',
      itemUnit: 'Pcs',
      itemPrice: '',
      shippingStatus: 'Diproses',
      paymentStatus: 'Belum Lunas',
      notes: ''
    });
    setIsCreateModalOpen(true);
  };

  // Save New PO
  const handleSaveNewPO = (e) => {
    e.preventDefault();
    if (!newPO.supplier.trim() || !newPO.itemName.trim()) return;

    const qty = Number(newPO.itemQty) || 1;
    const price = Number(newPO.itemPrice) || 0;
    const calculatedTotal = qty * price;

    const createdOrder = {
      id: newPO.id,
      date: newPO.date || '16 Nov 2026',
      supplier: newPO.supplier,
      contact: newPO.contact || '-',
      items: [
        {
          name: newPO.itemName,
          qty: qty,
          unit: newPO.itemUnit || 'Pcs',
          price: price
        }
      ],
      total: calculatedTotal,
      shippingStatus: newPO.shippingStatus,
      paymentStatus: newPO.paymentStatus,
      notes: newPO.notes || 'Pesanan dibuat manual.'
    };

    setPurchases([createdOrder, ...purchases]);
    setIsCreateModalOpen(false);
    showToast(`Pesanan pembelian ${newPO.id} berhasil dibuat!`);
  };

  // Mark as Received
  const handleMarkReceived = (poId) => {
    setPurchases(
      purchases.map((p) =>
        p.id === poId ? { ...p, shippingStatus: 'Diterima' } : p
      )
    );
    showToast(`Pesanan ${poId} telah ditandai DITERIMA di gudang.`);
  };

  // Delete PO
  const handleConfirmDelete = () => {
    if (poToDelete) {
      setPurchases(purchases.filter((p) => p.id !== poToDelete.id));
      showToast(`Pesanan ${poToDelete.id} berhasil dihapus.`);
      setPoToDelete(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No PO,Tanggal,Pemasok,Kontak,Barang,Total,Status Pengiriman,Status Pembayaran'];
    const rows = purchases.map((p) => {
      const itemsStr = p.items.map((it) => `${it.name} (${it.qty} ${it.unit})`).join('; ');
      return `"${p.id}","${p.date}","${p.supplier}","${p.contact}","${itemsStr}",${p.total},"${p.shippingStatus}","${p.paymentStatus}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pesanan_Pembelian_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan pembelian berhasil diexport!');
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
          <h2>Modul Pembelian (Purchase Orders)</h2>
          <p className="page-header-subtitle">
            Kelola pengadaan barang dari pemasok, pantau status pengiriman, dan verifikasi faktur pembelian.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={handleExportCSV}>
            <DownloadSimple size={16} weight="bold" /> Export CSV
          </button>
          <button className="btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} weight="bold" /> Buat Pesanan Baru
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="cards-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Bag size={22} weight="fill" />
          </div>
          <div className="stat-details">
            <h3>Total Belanja Bulan Ini</h3>
            <p style={{ fontSize: '18px' }}>{formatRupiah(stats.totalSpent)}</p>
            <span>{purchases.length} total pesanan</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Truck size={22} weight="fill" />
          </div>
          <div className="stat-details">
            <h3>Pesanan Aktif / Kirim</h3>
            <p style={{ color: '#d97706' }}>
              {stats.activeOrders} <span>Pesanan</span>
            </p>
            <span>Dalam proses restok</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={22} weight="fill" />
          </div>
          <div className="stat-details">
            <h3>Barang Diterima</h3>
            <p style={{ color: '#15803d' }}>
              {stats.receivedOrders} <span>Pesanan</span>
            </p>
            <span>Sudah masuk gudang</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rose">
            <Receipt size={22} weight="fill" />
          </div>
          <div className="stat-details">
            <h3>Tagihan Belum Lunas</h3>
            <p style={{ fontSize: '18px', color: stats.unpaidAmount > 0 ? '#e11d48' : 'inherit' }}>
              {formatRupiah(stats.unpaidAmount)}
            </p>
            <span>Perlu pelunasan</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="table-card">
        {/* Toolbar: Search, Status Tabs, Filter */}
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
                placeholder="Cari no. PO, pemasok, atau nama barang..."
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

            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              {SHIPPING_TABS.map((tab) => {
                const isActive = selectedTab === tab;
                const count =
                  tab === 'Semua'
                    ? purchases.length
                    : purchases.filter((p) => p.shippingStatus === tab).length;

                return (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
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
                    <span>{tab}</span>
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

          {/* Payment Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Funnel size={16} color="var(--text-muted)" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
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
              <option value="all">Semua Pembayaran</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Lunas">Belum Lunas</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '130px' }}>No. PO</th>
                <th style={{ width: '120px' }}>Tanggal</th>
                <th>Pemasok (Supplier)</th>
                <th>Rincian Barang</th>
                <th style={{ width: '140px' }}>Total Biaya</th>
                <th style={{ width: '150px' }}>Pengiriman</th>
                <th style={{ width: '120px' }}>Pembayaran</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Bag size={40} color="#94a3b8" />
                      <p style={{ fontWeight: 600, color: '#334155', fontSize: '15px' }}>
                        Tidak ada pesanan pembelian yang sesuai
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        Periksa kembali kata kunci pencarian atau ubah filter status yang aktif.
                      </p>
                      {(searchQuery || selectedTab !== 'Semua' || paymentFilter !== 'all') && (
                        <button
                          className="btn-secondary"
                          style={{ marginTop: '8px', fontSize: '13px', padding: '6px 14px' }}
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedTab('Semua');
                            setPaymentFilter('all');
                          }}
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => {
                  const isReceived = po.shippingStatus === 'Diterima';
                  const isShipping = po.shippingStatus === 'Dalam Pengiriman';
                  const isPaid = po.paymentStatus === 'Lunas';

                  return (
                    <tr key={po.id}>
                      {/* No PO */}
                      <td>
                        <span className="badge-code">{po.id}</span>
                      </td>

                      {/* Tanggal */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                          <CalendarBlank size={14} />
                          <span>{po.date}</span>
                        </div>
                      </td>

                      {/* Pemasok */}
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Buildings size={16} color="var(--primary)" />
                            {po.supplier}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {po.contact}
                          </div>
                        </div>
                      </td>

                      {/* Rincian Barang */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {po.items.map((it, idx) => (
                            <div key={idx} style={{ fontSize: '13px', color: '#1e293b' }}>
                              • <strong>{it.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({it.qty} {it.unit})</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Biaya */}
                      <td>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                          {formatRupiah(po.total)}
                        </span>
                      </td>

                      {/* Status Pengiriman */}
                      <td>
                        <span
                          className={`status-badge ${
                            isReceived
                              ? 'badge-green'
                              : isShipping
                              ? 'badge-blue'
                              : 'badge-amber'
                          }`}
                        >
                          {isReceived ? (
                            <CheckCircle size={14} weight="fill" />
                          ) : isShipping ? (
                            <Truck size={14} weight="fill" />
                          ) : (
                            <Clock size={14} weight="fill" />
                          )}
                          {po.shippingStatus}
                        </span>
                      </td>

                      {/* Status Pembayaran */}
                      <td>
                        <span className={`status-badge ${isPaid ? 'badge-green' : 'badge-red'}`}>
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isPaid ? '#10b981' : '#ef4444'
                            }}
                          />
                          {po.paymentStatus}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          {/* Tombol Lihat Faktur */}
                          <button
                            title="Lihat Faktur PO"
                            onClick={() => setSelectedInvoice(po)}
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
                            <Eye size={16} weight="bold" />
                          </button>

                          {/* Tombol Cepat Konfirmasi Diterima jika belum diterima */}
                          {!isReceived && (
                            <button
                              title="Tandai Sudah Diterima di Gudang"
                              onClick={() => handleMarkReceived(po.id)}
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
                                color: '#16a34a',
                                transition: '0.15s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#dcfce7';
                                e.currentTarget.style.borderColor = '#86efac';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.borderColor = 'var(--border)';
                              }}
                            >
                              <Check size={16} weight="bold" />
                            </button>
                          )}

                          {/* Tombol Hapus */}
                          <button
                            title="Hapus Pesanan"
                            onClick={() => setPoToDelete(po)}
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

        {/* Table Footer */}
        <div className="table-footer">
          <div>
            Menampilkan <strong>{filteredPurchases.length}</strong> dari <strong>{purchases.length}</strong> total transaksi pembelian
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} disabled>
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
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} disabled>
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Modal Buat Pesanan Baru */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Buat Pesanan Pembelian Baru (PO)</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNewPO}>
              <div className="modal-body">
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: '0 0 140px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                      No. PO
                    </label>
                    <input
                      type="text"
                      value={newPO.id}
                      onChange={(e) => setNewPO({ ...newPO, id: e.target.value })}
                      required
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
                      Pemasok (Supplier)
                    </label>
                    <input
                      type="text"
                      value={newPO.supplier}
                      onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })}
                      required
                      placeholder="Contoh: PT Pangan Nusantara"
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
                      Kontak / Telepon Supplier
                    </label>
                    <input
                      type="text"
                      value={newPO.contact}
                      onChange={(e) => setNewPO({ ...newPO, contact: e.target.value })}
                      placeholder="0812-xxxx-xxxx"
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
                      Tanggal Pesanan
                    </label>
                    <input
                      type="text"
                      value={newPO.date}
                      onChange={(e) => setNewPO({ ...newPO, date: e.target.value })}
                      placeholder="16 Nov 2026"
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

                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    Item Barang yang Dipesan
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ flex: 2 }}>
                      <input
                        type="text"
                        placeholder="Nama Barang (contoh: Beras Ramos 5kg)"
                        value={newPO.itemName}
                        onChange={(e) => setNewPO({ ...newPO, itemName: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          fontSize: '13.5px'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        placeholder="Satuan (Pcs/Sak)"
                        value={newPO.itemUnit}
                        onChange={(e) => setNewPO({ ...newPO, itemUnit: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          fontSize: '13.5px'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="number"
                        placeholder="Jumlah (Qty)"
                        value={newPO.itemQty}
                        onChange={(e) => setNewPO({ ...newPO, itemQty: e.target.value })}
                        required
                        min="1"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          fontSize: '13.5px'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="number"
                        placeholder="Harga Satuan (Rp)"
                        value={newPO.itemPrice}
                        onChange={(e) => setNewPO({ ...newPO, itemPrice: e.target.value })}
                        required
                        min="0"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          fontSize: '13.5px'
                        }}
                      />
                    </div>
                  </div>
                  {newPO.itemQty && newPO.itemPrice && (
                    <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
                      Subtotal: {formatRupiah(Number(newPO.itemQty) * Number(newPO.itemPrice))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                      Status Pengiriman
                    </label>
                    <select
                      value={newPO.shippingStatus}
                      onChange={(e) => setNewPO({ ...newPO, shippingStatus: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="Diproses">Diproses</option>
                      <option value="Dalam Pengiriman">Dalam Pengiriman</option>
                      <option value="Diterima">Diterima di Gudang</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                      Status Pembayaran
                    </label>
                    <select
                      value={newPO.paymentStatus}
                      onChange={(e) => setNewPO({ ...newPO, paymentStatus: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="Belum Lunas">Belum Lunas</option>
                      <option value="Lunas">Lunas</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                    Catatan Pembelian
                  </label>
                  <textarea
                    rows={2}
                    value={newPO.notes}
                    onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })}
                    placeholder="Instruksi pengiriman, lokasi penempatan rak, atau termin pembayaran..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '13.5px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Faktur / Invoice */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ marginBottom: '2px' }}>Faktur Pembelian</h3>
                <span className="badge-code" style={{ fontSize: '13px' }}>{selectedInvoice.id}</span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Pemasok (Vendor)
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                    {selectedInvoice.supplier}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {selectedInvoice.contact}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Tanggal Transaksi
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
                    {selectedInvoice.date}
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span className={`status-badge ${selectedInvoice.paymentStatus === 'Lunas' ? 'badge-green' : 'badge-red'}`}>
                      {selectedInvoice.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  Rincian Barang Dipesan:
                </div>
                <table style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px' }}>Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Jumlah</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Harga Satuan</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{it.name}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>{it.qty} {it.unit}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{formatRupiah(it.price)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                          {formatRupiah(it.qty * it.price)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <td colSpan={3} style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        Total Tagihan:
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, fontSize: '15px', color: 'var(--primary)' }}>
                        {formatRupiah(selectedInvoice.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {selectedInvoice.notes && (
                <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Catatan Gudang / Logistik:
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                    {selectedInvoice.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                className="btn-secondary"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} /> Cetak Faktur
              </button>
              <button className="btn-primary" onClick={() => setSelectedInvoice(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {poToDelete && (
        <div className="modal-overlay" onClick={() => setPoToDelete(null)}>
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
                Hapus Pesanan Pembelian?
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Apakah Anda yakin ingin menghapus <strong>{poToDelete.id}</strong> ({poToDelete.supplier})? Data ini akan dihapus dari riwayat pembelian.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setPoToDelete(null)}>
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

export default Pembelian;
