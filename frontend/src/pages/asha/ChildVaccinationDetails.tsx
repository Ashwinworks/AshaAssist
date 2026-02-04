import React, { useState, useEffect } from 'react';
import AshaLayout from './AshaLayout';
import { Syringe, Search, Filter, Send, CheckCircle, Clock, AlertCircle, Baby, User, Phone, Mail, Loader, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';

interface Vaccination {
    vaccineName: string;
    dueDate: string;
    status: string;
    ageLabel: string;
    description: string;
}

interface Child {
    id: string;
    childName: string;
    dateOfBirth: string;
    age: string;
    gender: string;
    weight?: number;
    height?: number;
    motherName: string;
    motherPhone: string;
    motherEmail: string;
    motherId: string;
    dueVaccinations: Vaccination[];
}

const ChildVaccinationDetails: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedChildId, setExpandedChildId] = useState<string | null>(null);

    // Fetch children data from API
    useEffect(() => {
        fetchChildren();
    }, []);

    const toggleChild = (childId: string) => {
        if (expandedChildId === childId) {
            setExpandedChildId(null); // Collapse if already expanded
        } else {
            setExpandedChildId(childId); // Expand the clicked child
        }
    };

    const fetchChildren = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/vaccination/children-details');
            setChildren(response.data.children || []);
        } catch (err: any) {
            console.error('Error fetching children:', err);
            setError(err.response?.data?.error || 'Failed to load children data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming':
                return { bg: '#f0f9ff', border: '#7dd3fc', text: '#0369a1' };
            case 'due':
                return { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' };
            case 'overdue':
                return { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' };
            default:
                return { bg: '#f9fafb', border: '#d1d5db', text: '#374151' };
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'upcoming':
                return <Clock size={18} color="#0369a1" />;
            case 'due':
                return <AlertCircle size={18} color="#f59e0b" />;
            case 'overdue':
                return <AlertCircle size={18} color="#dc2626" />;
            default:
                return <Clock size={18} color="#6b7280" />;
        }
    };

    // Calculate statistics
    const totalChildren = children.length;
    const overdueCount = children.filter(child =>
        child.dueVaccinations.some(v => v.status === 'overdue')
    ).length;
    const dueThisWeekCount = children.filter(child =>
        child.dueVaccinations.some(v => v.status === 'due')
    ).length;
    const upcomingCount = children.reduce((sum, child) =>
        sum + child.dueVaccinations.filter(v => v.status === 'upcoming').length, 0
    );

    // Filter children based on search and status
    const filteredChildren = children.filter(child => {
        const matchesSearch = searchTerm === '' ||
            child.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            child.motherName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            child.dueVaccinations.some(v => v.status === statusFilter);

        return matchesSearch && matchesStatus;
    });

    return (
        <AshaLayout title="Child Vaccination Details">
            <div>
                {/* Loading State */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <Loader size={48} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading children vaccination data...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="card" style={{ border: '2px solid #dc2626', backgroundColor: '#fef2f2' }}>
                        <div className="card-content" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <AlertCircle size={32} color="#dc2626" />
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: '600', color: '#991b1b' }}>
                                        Error Loading Data
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#991b1b' }}>
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content - Only show when not loading */}
                {!loading && !error && (
                    <>
                        {/* Header Section */}
                        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)', border: '2px solid #7dd3fc' }}>
                            <div className="card-content" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '3px solid white',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        <Syringe size={32} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1e3a8a' }}>
                                            Child Vaccination Reminder System
                                        </h2>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '1rem', color: '#1e40af' }}>
                                            Track and manage vaccination schedules for children in your ward
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="card" style={{ borderLeft: '4px solid #dc2626', backgroundColor: '#fef2f2' }}>
                                <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <AlertCircle size={32} color="#dc2626" />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#991b1b' }}>{overdueCount}</h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#991b1b' }}>Overdue</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb' }}>
                                <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Clock size={32} color="#f59e0b" />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#92400e' }}>{dueThisWeekCount}</h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>Due This Week</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ borderLeft: '4px solid #0369a1', backgroundColor: '#f0f9ff' }}>
                                <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Baby size={32} color="#0369a1" />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0c4a6e' }}>{totalChildren}</h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#0c4a6e' }}>Total Children</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ borderLeft: '4px solid #16a34a', backgroundColor: '#f0fdf4' }}>
                                <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <CheckCircle size={32} color="#16a34a" />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#166534' }}>{upcomingCount}</h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#166534' }}>Upcoming</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters and Search */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <div className="card-content">
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {/* Search */}
                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                                            <Search size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                            Search by Mother or Child Name
                                        </label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <div style={{ minWidth: '200px' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                                            <Filter size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                            Status Filter
                                        </label>
                                        <select
                                            className="input"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            style={{ width: '100%' }}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="overdue">Overdue</option>
                                            <option value="due">Due This Week</option>
                                            <option value="upcoming">Upcoming</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Children List */}
                        {filteredChildren.length === 0 ? (
                            <div className="card" style={{ border: '1px solid #e5e7eb', textAlign: 'center', padding: '3rem' }}>
                                <Baby size={48} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ color: '#6b7280', margin: '0 0 0.5rem' }}>No Children Found</h3>
                                <p style={{ color: '#9ca3af', margin: 0 }}>
                                    {children.length === 0
                                        ? 'No birth records have been registered yet.'
                                        : 'No children match your search criteria.'}
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {filteredChildren.map((child: Child) => {
                                    const isExpanded = expandedChildId === child.id;
                                    return (
                                        <div key={child.id} className="card" style={{ border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            {/* Clickable Header - Always Visible */}
                                            <div
                                                onClick={() => toggleChild(child.id)}
                                                style={{
                                                    padding: '1.5rem',
                                                    borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                        <div style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0
                                                        }}>
                                                            <Baby size={32} color="white" />
                                                        </div>
                                                        <div>
                                                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                                                                {child.childName}
                                                            </h3>
                                                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                                                                DOB: {new Date(child.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • Age: {child.age}
                                                            </p>
                                                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                                                                Mother: {child.motherName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span style={{
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '0.5rem',
                                                            fontSize: '0.875rem',
                                                            fontWeight: '600',
                                                            backgroundColor: '#ede9fe',
                                                            color: '#6b21a8'
                                                        }}>
                                                            {child.dueVaccinations.length} Due Vaccine{child.dueVaccinations.length !== 1 ? 's' : ''}
                                                        </span>
                                                        <ChevronRight
                                                            size={24}
                                                            color="#6b7280"
                                                            style={{
                                                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expandable Content - Hidden by Default */}
                                            {isExpanded && (
                                                <div className="card-content" style={{ padding: '1.5rem', paddingTop: 0 }}>
                                                    {/* Mother Information */}
                                                    <div style={{
                                                        padding: '1rem',
                                                        backgroundColor: '#f9fafb',
                                                        borderRadius: '0.5rem',
                                                        marginTop: '1.5rem',
                                                        marginBottom: '1.5rem'
                                                    }}>
                                                        <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                                                            Mother's Information
                                                        </h4>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <User size={16} color="#6b7280" />
                                                                <span style={{ fontSize: '0.875rem', color: '#374151' }}>{child.motherName}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <Phone size={16} color="#6b7280" />
                                                                <span style={{ fontSize: '0.875rem', color: '#374151' }}>{child.motherPhone}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <Mail size={16} color="#6b7280" />
                                                                <span style={{ fontSize: '0.875rem', color: '#374151' }}>{child.motherEmail}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Due Vaccinations */}
                                                    <div style={{ marginBottom: '1rem' }}>
                                                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                                                            Due Vaccinations
                                                        </h4>
                                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                            {child.dueVaccinations.map((vaccine: Vaccination, index: number) => {
                                                                const colors = getStatusColor(vaccine.status);
                                                                return (
                                                                    <div key={index} style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        padding: '0.75rem 1rem',
                                                                        backgroundColor: colors.bg,
                                                                        border: `2px solid ${colors.border}`,
                                                                        borderRadius: '0.5rem'
                                                                    }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                            {getStatusIcon(vaccine.status)}
                                                                            <div>
                                                                                <div style={{ fontWeight: '600', color: colors.text }}>{vaccine.vaccineName}</div>
                                                                                <div style={{ fontSize: '0.75rem', color: colors.text }}>
                                                                                    Due: {new Date(vaccine.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <span style={{
                                                                            padding: '0.25rem 0.75rem',
                                                                            borderRadius: '0.375rem',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: '600',
                                                                            backgroundColor: 'white',
                                                                            color: colors.text,
                                                                            textTransform: 'capitalize',
                                                                            border: `1px solid ${colors.border}`
                                                                        }}>
                                                                            {vaccine.status}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                                                        <button className="btn" style={{
                                                            flex: 1,
                                                            backgroundColor: '#3b82f6',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.5rem'
                                                        }}>
                                                            <Send size={18} />
                                                            Send Reminder
                                                        </button>
                                                        <button className="btn" style={{
                                                            flex: 1,
                                                            backgroundColor: 'white',
                                                            border: '1px solid #d1d5db',
                                                            color: '#374151',
                                                            fontWeight: 600,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.5rem'
                                                        }}>
                                                            <CheckCircle size={18} />
                                                            Mark as Completed
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AshaLayout>
    );
};

export default ChildVaccinationDetails;
