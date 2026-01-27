import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
    Users,
    Package,
    Activity,
    TrendingUp,
    MapPin,
    Heart,
    Syringe,
    Home
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

interface WardAnalytics {
    ward: string;
    lastUpdated: string;
    userStats: {
        total: number;
        maternal: number;
        palliative: number;
        active: number;
        distribution: {
            maternal: number;
            palliative: number;
        };
    };
    supplyStats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        delivered: number;
        byCategory: Array<{ category: string; count: number }>;
    };
    vaccinationStats: {
        schedules: number;
        bookings: number;
        completed: number;
    };
    homeVisitStats: {
        total: number;
        verified: number;
        pending: number;
    };
    rationStats: {
        collected: number;
        pending: number;
    };
    locationStats: {
        total: number;
        byType: Record<string, number>;
    };
    contentStats: {
        blogs: number;
        publishedBlogs: number;
        classes: number;
        camps: number;
    };
    activityTimeline: {
        supplyRequests: Array<{ month: string; count: number }>;
        homeVisits: Array<{ month: string; count: number }>;
        userRegistrations: Array<{ month: string; count: number }>;
    };
    heatMapData: {
        userEngagement: number;
        supplyActivity: number;
        vaccinationCoverage: number;
        homeVisitCoverage: number;
        rationCollection: number;
    };
}

const WardAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<WardAnalytics | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getWardAnalytics();
            console.log('Ward analytics data:', data);
            setAnalytics(data);
        } catch (error: any) {
            console.error('Error fetching ward analytics:', error);
            toast.error('Failed to load ward analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Ward Analytics">
                <div className="loading-container" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="loading-spinner" />
                    <p>Loading ward analytics...</p>
                </div>
            </AdminLayout>
        );
    }

    if (!analytics) {
        return (
            <AdminLayout title="Ward Analytics">
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>No analytics data available</p>
                </div>
            </AdminLayout>
        );
    }

    // Prepare chart data with professional colors
    const userDistributionData = {
        labels: ['Maternal Care', 'Palliative Care'],
        datasets: [{
            label: 'User Distribution',
            data: [analytics.userStats.maternal, analytics.userStats.palliative],
            backgroundColor: [
                'rgba(37, 99, 235, 0.85)',
                'rgba(124, 58, 237, 0.85)',
            ],
            borderColor: [
                'rgb(37, 99, 235)',
                'rgb(124, 58, 237)',
            ],
            borderWidth: 1,
        }],
    };

    const supplyStatusData = {
        labels: ['Pending', 'Approved', 'Delivered', 'Rejected'],
        datasets: [{
            label: 'Supply Requests',
            data: [
                analytics.supplyStats.pending,
                analytics.supplyStats.approved,
                analytics.supplyStats.delivered,
                analytics.supplyStats.rejected,
            ],
            backgroundColor: [
                'rgba(217, 119, 6, 0.85)',
                'rgba(5, 150, 105, 0.85)',
                'rgba(37, 99, 235, 0.85)',
                'rgba(220, 38, 38, 0.85)',
            ],
            borderColor: [
                'rgb(217, 119, 6)',
                'rgb(5, 150, 105)',
                'rgb(37, 99, 235)',
                'rgb(220, 38, 38)',
            ],
            borderWidth: 1,
        }],
    };

    const supplyCategoryData = {
        labels: analytics.supplyStats.byCategory.map(item => item.category),
        datasets: [{
            label: 'Requests by Category',
            data: analytics.supplyStats.byCategory.map(item => item.count),
            backgroundColor: 'rgba(37, 99, 235, 0.75)',
            borderColor: 'rgb(37, 99, 235)',
            borderWidth: 1,
        }],
    };

    // Activity timeline with professional colors
    const months = analytics.activityTimeline.supplyRequests.map(item => item.month);
    const activityTimelineData = {
        labels: months,
        datasets: [
            {
                label: 'Supply Requests',
                data: analytics.activityTimeline.supplyRequests.map(item => item.count),
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                borderWidth: 2,
            },
            {
                label: 'Home Visits',
                data: analytics.activityTimeline.homeVisits.map(item => item.count),
                borderColor: 'rgb(5, 150, 105)',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                tension: 0.4,
                borderWidth: 2,
            },
            {
                label: 'New Users',
                data: analytics.activityTimeline.userRegistrations.map(item => item.count),
                borderColor: 'rgb(124, 58, 237)',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                tension: 0.4,
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
    };

    // Heat map intensity color
    const getHeatColor = (value: number) => {
        if (value >= 80) return '#10b981'; // Green
        if (value >= 60) return '#3b82f6'; // Blue
        if (value >= 40) return '#f59e0b'; // Yellow
        if (value >= 20) return '#f97316'; // Orange
        return '#ef4444'; // Red
    };

    return (
        <AdminLayout title="Ward Analytics">
            <div>
                {/* Header */}
                <div style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                        {analytics.ward} Analytics Dashboard
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
                    </p>
                </div>

                {/* Key Metrics Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    {/* Total Users */}
                    <div className="card" style={{
                        padding: '1.5rem',
                        backgroundColor: 'white',
                        borderLeft: '4px solid #2563eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.5rem' }}>Total Users</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>{analytics.userStats.total}</div>
                            </div>
                            <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem' }}>
                                <Users size={24} color="#2563eb" />
                            </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            <span style={{ color: '#059669', fontWeight: '600' }}>{analytics.userStats.active}</span> active users
                        </div>
                    </div>

                    {/* Supply Requests */}
                    <div className="card" style={{
                        padding: '1.5rem',
                        backgroundColor: 'white',
                        borderLeft: '4px solid #059669',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.5rem' }}>Supply Requests</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>{analytics.supplyStats.total}</div>
                            </div>
                            <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '0.5rem' }}>
                                <Package size={24} color="#059669" />
                            </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            <span style={{ color: '#059669', fontWeight: '600' }}>{analytics.supplyStats.delivered}</span> delivered
                        </div>
                    </div>

                    {/* Vaccinations */}
                    <div className="card" style={{
                        padding: '1.5rem',
                        backgroundColor: 'white',
                        borderLeft: '4px solid #7c3aed',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.5rem' }}>Vaccinations</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>{analytics.vaccinationStats.bookings}</div>
                            </div>
                            <div style={{ padding: '0.75rem', backgroundColor: '#f5f3ff', borderRadius: '0.5rem' }}>
                                <Syringe size={24} color="#7c3aed" />
                            </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            <span style={{ color: '#059669', fontWeight: '600' }}>{analytics.vaccinationStats.completed}</span> completed
                        </div>
                    </div>

                    {/* Home Visits */}
                    <div className="card" style={{
                        padding: '1.5rem',
                        backgroundColor: 'white',
                        borderLeft: '4px solid #d97706',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.5rem' }}>Home Visits</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>{analytics.homeVisitStats.total}</div>
                            </div>
                            <div style={{ padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '0.5rem' }}>
                                <Home size={24} color="#d97706" />
                            </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            <span style={{ color: '#059669', fontWeight: '600' }}>{analytics.homeVisitStats.verified}</span> verified
                        </div>
                    </div>
                </div>
                {/* Performance Metrics Section */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div className="card-header">
                        <h3 className="card-title" style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                            Performance Metrics
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Key performance indicators across all services</p>
                    </div>
                    <div className="card-content">
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {Object.entries(analytics.heatMapData).map(([key, value]) => {
                                const getProgressColor = (val: number) => {
                                    if (val >= 80) return '#059669';
                                    if (val >= 60) return '#2563eb';
                                    if (val >= 40) return '#d97706';
                                    return '#dc2626';
                                };

                                return (
                                    <div key={key} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.9375rem', fontWeight: '500', color: '#374151', textTransform: 'capitalize' }}>
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span style={{ fontSize: '1rem', fontWeight: '700', color: '#111827' }}>{value}%</span>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '8px',
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${value}%`,
                                                height: '100%',
                                                backgroundColor: getProgressColor(value),
                                                borderRadius: '4px',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' }}>Performance Scale</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: '#4b5563' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '16px', height: '16px', backgroundColor: '#059669', borderRadius: '2px' }} />
                                    <span>Excellent (≥80%)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '16px', height: '16px', backgroundColor: '#2563eb', borderRadius: '2px' }} />
                                    <span>Good (60-79%)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '16px', height: '16px', backgroundColor: '#d97706', borderRadius: '2px' }} />
                                    <span>Needs Improvement (40-59%)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '16px', height: '16px', backgroundColor: '#dc2626', borderRadius: '2px' }} />
                                    <span>Critical (&lt;40%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* User Distribution Pie Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">User Distribution</h3>
                        </div>
                        <div className="card-content">
                            <div style={{ height: '300px' }}>
                                <Pie data={userDistributionData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Supply Status Pie Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Supply Request Status</h3>
                        </div>
                        <div className="card-content">
                            <div style={{ height: '300px' }}>
                                <Pie data={supplyStatusData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Supply Category Bar Chart */}
                {analytics.supplyStats.byCategory.length > 0 && (
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <div className="card-header">
                            <h3 className="card-title">Supply Requests by Category</h3>
                        </div>
                        <div className="card-content">
                            <div style={{ height: '300px' }}>
                                <Bar data={supplyCategoryData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Timeline */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">Activity Timeline (Last 6 Months)</h3>
                    </div>
                    <div className="card-content">
                        <div style={{ height: '350px' }}>
                            <Line data={activityTimelineData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Additional Statistics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {/* Locations */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={18} />
                                Locations
                            </h3>
                        </div>
                        <div className="card-content">
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '1rem' }}>
                                {analytics.locationStats.total}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                {Object.entries(analytics.locationStats.byType).map(([type, count]) => (
                                    <div key={type} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ textTransform: 'capitalize' }}>{type.replace('_', ' ')}:</span>
                                        <span style={{ fontWeight: '600' }}>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Monthly Ration */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Heart size={18} />
                                Monthly Ration
                            </h3>
                        </div>
                        <div className="card-content">
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '1rem' }}>
                                {analytics.rationStats.collected}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Collected:</span>
                                    <span style={{ fontWeight: '600', color: 'var(--green-600)' }}>{analytics.rationStats.collected}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Pending:</span>
                                    <span style={{ fontWeight: '600', color: 'var(--yellow-600)' }}>{analytics.rationStats.pending}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Statistics */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingUp size={18} />
                                Content Published
                            </h3>
                        </div>
                        <div className="card-content">
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '1rem' }}>
                                {analytics.contentStats.blogs + analytics.contentStats.classes + analytics.contentStats.camps}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Blogs:</span>
                                    <span style={{ fontWeight: '600' }}>{analytics.contentStats.publishedBlogs}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Classes:</span>
                                    <span style={{ fontWeight: '600' }}>{analytics.contentStats.classes}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Camps:</span>
                                    <span style={{ fontWeight: '600' }}>{analytics.contentStats.camps}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default WardAnalytics;
