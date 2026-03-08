import React, { useEffect, useState } from 'react';
import AnganvaadiLayout from './AnganvaadiLayout';
import {
    Package, Plus, Edit2, Trash2, AlertTriangle,
    TrendingDown, CheckCircle, X, BarChart3, Minus
} from 'lucide-react';
import { stockAPI } from '../../services/api';

interface StockItem {
    id: string;
    itemName: string;
    category: string;
    quantity: number;
    unit: string;
    minThreshold: number;
    status: 'ok' | 'low' | 'out_of_stock';
    lastUpdated: string;
    usageLog: { date: string; quantityUsed: number; reason: string; balanceAfter: number }[];
}

const CATEGORIES = ['Grains', 'Oils', 'Supplements', 'Dairy', 'Pulses', 'Other'];
const UNITS = ['kg', 'g', 'L', 'ml', 'packets', 'tablets', 'bottles', 'units'];

const StockManagement: React.FC = () => {
    const [items, setItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [editItem, setEditItem] = useState<StockItem | null>(null);
    const [showUsageModal, setShowUsageModal] = useState<StockItem | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<StockItem | null>(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Form state
    const [form, setForm] = useState({
        itemName: '', category: 'Grains', quantity: '', unit: 'kg', minThreshold: ''
    });
    const [usageForm, setUsageForm] = useState({ quantityUsed: '', reason: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchStock();
    }, []);

    useEffect(() => {
        if (successMsg) {
            const t = setTimeout(() => setSuccessMsg(''), 3000);
            return () => clearTimeout(t);
        }
    }, [successMsg]);

    const fetchStock = async () => {
        try {
            setLoading(true);
            const data = await stockAPI.getAllStock();
            setItems(data.items || []);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load stock items');
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                itemName: form.itemName,
                category: form.category,
                quantity: parseFloat(form.quantity) || 0,
                unit: form.unit,
                minThreshold: parseFloat(form.minThreshold) || 0,
            };

            if (editItem) {
                await stockAPI.updateStockItem(editItem.id, payload);
                setSuccessMsg('Stock item updated successfully!');
            } else {
                await stockAPI.addStockItem(payload);
                setSuccessMsg('Stock item added successfully!');
            }
            setShowAddModal(false);
            setEditItem(null);
            setForm({ itemName: '', category: 'Grains', quantity: '', unit: 'kg', minThreshold: '' });
            fetchStock();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save stock item');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) return;
        try {
            await stockAPI.deleteStockItem(showDeleteConfirm.id);
            setSuccessMsg('Stock item deleted');
            setShowDeleteConfirm(null);
            fetchStock();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete');
        }
    };

    const handleRecordUsage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showUsageModal) return;
        setSubmitting(true);
        try {
            await stockAPI.recordUsage(showUsageModal.id, {
                quantityUsed: parseFloat(usageForm.quantityUsed) || 0,
                reason: usageForm.reason || 'General usage',
            });
            setSuccessMsg('Usage recorded successfully!');
            setShowUsageModal(null);
            setUsageForm({ quantityUsed: '', reason: '' });
            fetchStock();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to record usage');
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (item: StockItem) => {
        setEditItem(item);
        setForm({
            itemName: item.itemName,
            category: item.category,
            quantity: item.quantity.toString(),
            unit: item.unit,
            minThreshold: item.minThreshold.toString(),
        });
        setShowAddModal(true);
    };

    const openAddModal = () => {
        setEditItem(null);
        setForm({ itemName: '', category: 'Grains', quantity: '', unit: 'kg', minThreshold: '' });
        setShowAddModal(true);
    };

    // Filter items
    const filteredItems = items.filter(item => {
        if (filterCategory !== 'all' && item.category !== filterCategory) return false;
        if (filterStatus !== 'all' && item.status !== filterStatus) return false;
        return true;
    });

    // Stats
    const totalItems = items.length;
    const lowStockCount = items.filter(i => i.status === 'low').length;
    const outOfStockCount = items.filter(i => i.status === 'out_of_stock').length;
    const categories = Array.from(new Set(items.map(i => i.category)));

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ok':
                return { bg: '#dcfce7', color: '#16a34a', label: '✓ In Stock' };
            case 'low':
                return { bg: '#fef9c3', color: '#ca8a04', label: '⚠ Low Stock' };
            case 'out_of_stock':
                return { bg: '#fee2e2', color: '#dc2626', label: '✕ Out of Stock' };
            default:
                return { bg: '#f3f4f6', color: '#6b7280', label: status };
        }
    };

    return (
        <AnganvaadiLayout title="Stock Management">
            {/* Success Message */}
            {successMsg && (
                <div style={{
                    padding: '0.75rem 1rem', borderRadius: '0.5rem',
                    backgroundColor: '#dcfce7', color: '#166534', marginBottom: '1rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <CheckCircle size={18} /> {successMsg}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '0.75rem 1rem', borderRadius: '0.5rem',
                    backgroundColor: '#fee2e2', color: '#991b1b', marginBottom: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <span>{error}</span>
                    <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Low Stock Alert Banner */}
            {(lowStockCount > 0 || outOfStockCount > 0) && (
                <div style={{
                    padding: '1rem 1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                    border: '1px solid #f59e0b',
                    display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}>
                    <AlertTriangle size={22} style={{ color: '#d97706', flexShrink: 0 }} />
                    <div>
                        <strong style={{ color: '#92400e' }}>Stock Alert!</strong>
                        <span style={{ color: '#78350f', marginLeft: '0.5rem' }}>
                            {lowStockCount > 0 && `${lowStockCount} item(s) running low`}
                            {lowStockCount > 0 && outOfStockCount > 0 && ' • '}
                            {outOfStockCount > 0 && `${outOfStockCount} item(s) out of stock`}
                        </span>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Items', value: totalItems, icon: Package, color: '#4f46e5', bg: '#eef2ff' },
                    { label: 'Low Stock', value: lowStockCount, icon: TrendingDown, color: '#ca8a04', bg: '#fef9c3' },
                    { label: 'Out of Stock', value: outOfStockCount, icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2' },
                    { label: 'Categories', value: categories.length, icon: BarChart3, color: '#059669', bg: '#d1fae5' },
                ].map((stat, idx) => (
                    <div key={idx} style={{
                        padding: '1.25rem', borderRadius: '0.75rem', backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem'
                    }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: stat.bg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <stat.icon size={22} style={{ color: stat.color }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem'
            }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        style={{
                            padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db',
                            fontSize: '0.875rem', backgroundColor: 'white', cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{
                            padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db',
                            fontSize: '0.875rem', backgroundColor: 'white', cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="ok">In Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>
                </div>
                <button
                    onClick={openAddModal}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        color: 'white', border: 'none', cursor: 'pointer',
                        fontWeight: '600', fontSize: '0.875rem',
                        boxShadow: '0 2px 4px rgba(22,163,74,0.3)',
                        transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    <Plus size={18} /> Add Stock Item
                </button>
            </div>

            {/* Stock Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Loading stock items...</div>
            ) : filteredItems.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '3rem', backgroundColor: 'white',
                    borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <Package size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                    <p style={{ color: '#6b7280', fontSize: '1rem' }}>
                        {items.length === 0 ? 'No stock items yet. Add your first item!' : 'No items match your filters.'}
                    </p>
                </div>
            ) : (
                <div style={{
                    backgroundColor: 'white', borderRadius: '0.75rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    {['Item Name', 'Category', 'Quantity', 'Threshold', 'Status', 'Last Updated', 'Actions'].map(h => (
                                        <th key={h} style={{
                                            padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem',
                                            fontWeight: '600', color: '#6b7280', textTransform: 'uppercase',
                                            letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb'
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item, idx) => {
                                    const badge = getStatusBadge(item.status);
                                    return (
                                        <tr key={item.id} style={{
                                            borderBottom: idx < filteredItems.length - 1 ? '1px solid #f3f4f6' : 'none',
                                            transition: 'background-color 0.15s ease'
                                        }}
                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                        >
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#111827' }}>{item.itemName}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{
                                                    display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                                    fontSize: '0.75rem', fontWeight: '500',
                                                    backgroundColor: '#f0f9ff', color: '#0369a1'
                                                }}>
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#111827' }}>
                                                {item.quantity} {item.unit}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>
                                                {item.minThreshold} {item.unit}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{
                                                    display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '1rem',
                                                    fontSize: '0.75rem', fontWeight: '600',
                                                    backgroundColor: badge.bg, color: badge.color
                                                }}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.85rem' }}>
                                                {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.375rem' }}>
                                                    <button
                                                        onClick={() => {
                                                            setShowUsageModal(item);
                                                            setUsageForm({ quantityUsed: '', reason: '' });
                                                        }}
                                                        title="Record Usage"
                                                        style={{
                                                            padding: '0.375rem', borderRadius: '0.375rem', border: '1px solid #d1d5db',
                                                            backgroundColor: 'white', cursor: 'pointer', color: '#7c3aed',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Minus size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        title="Edit"
                                                        style={{
                                                            padding: '0.375rem', borderRadius: '0.375rem', border: '1px solid #d1d5db',
                                                            backgroundColor: 'white', cursor: 'pointer', color: '#2563eb',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(item)}
                                                        title="Delete"
                                                        style={{
                                                            padding: '0.375rem', borderRadius: '0.375rem', border: '1px solid #fecaca',
                                                            backgroundColor: 'white', cursor: 'pointer', color: '#dc2626',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ===================== ADD / EDIT MODAL ===================== */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}
                    onClick={() => { setShowAddModal(false); setEditItem(null); }}
                >
                    <div
                        style={{
                            backgroundColor: 'white', borderRadius: '0.75rem', width: '100%', maxWidth: '480px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'fadeIn 0.25s ease'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>
                                {editItem ? 'Edit Stock Item' : 'Add Stock Item'}
                            </h3>
                            <button onClick={() => { setShowAddModal(false); setEditItem(null); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddOrEdit} style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.375rem' }}>Item Name *</label>
                                <input
                                    type="text" required value={form.itemName}
                                    onChange={e => setForm({ ...form, itemName: e.target.value })}
                                    placeholder="e.g. Rice, Wheat, Iron tablets"
                                    style={{
                                        width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                                        border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.375rem' }}>Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                        style={{
                                            width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                                            border: '1px solid #d1d5db', fontSize: '0.875rem', backgroundColor: 'white', boxSizing: 'border-box'
                                        }}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.375rem' }}>Unit</label>
                                    <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                                        style={{
                                            width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                                            border: '1px solid #d1d5db', fontSize: '0.875rem', backgroundColor: 'white', boxSizing: 'border-box'
                                        }}>
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.375rem' }}>Current Quantity *</label>
                                    <input
                                        type="number" min="0" step="0.1" required value={form.quantity}
                                        onChange={e => setForm({ ...form, quantity: e.target.value })}
                                        placeholder="0"
                                        style={{
                                            width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                                            border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.375rem' }}>Min Threshold</label>
                                    <input
                                        type="number" min="0" step="0.1" value={form.minThreshold}
                                        onChange={e => setForm({ ...form, minThreshold: e.target.value })}
                                        placeholder="Alert when below"
                                        style={{
                                            width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                                            border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => { setShowAddModal(false); setEditItem(null); }}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #d1d5db',
                                        backgroundColor: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500'
                                    }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: 'none',
                                        background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white',
                                        cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: '600',
                                        opacity: submitting ? 0.7 : 1
                                    }}>
                                    {submitting ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===================== USAGE MODAL ===================== */}
            {showUsageModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}
                    onClick={() => setShowUsageModal(null)}
                >
                    <div
                        style={{
                            backgroundColor: 'white', borderRadius: '0.75rem', width: '100%', maxWidth: '420px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'fadeIn 0.25s ease'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>Record Usage</h3>
                            <button onClick={() => setShowUsageModal(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleRecordUsage} style={{ padding: '1.5rem' }}>
                            <div style={{
                                padding: '0.75rem 1rem', borderRadius: '0.5rem', backgroundColor: '#f0f9ff',
                                marginBottom: '1rem', fontSize: '0.875rem', color: '#0369a1'
                            }}>
                                <strong>{showUsageModal.itemName}</strong> — Current stock: <strong>{showUsageModal.quantity} {showUsageModal.unit}</strong>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.375rem' }}>
                                    Quantity Used ({showUsageModal.unit}) *
                                </label>
                                <input
                                    type="number" min="0.1" step="0.1" required
                                    max={showUsageModal.quantity}
                                    value={usageForm.quantityUsed}
                                    onChange={e => setUsageForm({ ...usageForm, quantityUsed: e.target.value })}
                                    placeholder="0"
                                    style={{
                                        width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                                        border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.375rem' }}>Reason</label>
                                <input
                                    type="text" value={usageForm.reason}
                                    onChange={e => setUsageForm({ ...usageForm, reason: e.target.value })}
                                    placeholder="e.g. Monthly ration distribution"
                                    style={{
                                        width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                                        border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowUsageModal(null)}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #d1d5db',
                                        backgroundColor: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500'
                                    }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: 'none',
                                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white',
                                        cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: '600',
                                        opacity: submitting ? 0.7 : 1
                                    }}>
                                    {submitting ? 'Recording...' : 'Record Usage'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===================== DELETE CONFIRM ===================== */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}
                    onClick={() => setShowDeleteConfirm(null)}
                >
                    <div
                        style={{
                            backgroundColor: 'white', borderRadius: '0.75rem', width: '100%', maxWidth: '400px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: '1.5rem',
                            animation: 'fadeIn 0.25s ease'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>
                            Delete Stock Item
                        </h3>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                            Are you sure you want to delete <strong>{showDeleteConfirm.itemName}</strong>? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowDeleteConfirm(null)}
                                style={{
                                    padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #d1d5db',
                                    backgroundColor: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500'
                                }}>
                                Cancel
                            </button>
                            <button onClick={handleDelete}
                                style={{
                                    padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: 'none',
                                    backgroundColor: '#dc2626', color: 'white', cursor: 'pointer',
                                    fontSize: '0.875rem', fontWeight: '600'
                                }}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AnganvaadiLayout>
    );
};

export default StockManagement;
