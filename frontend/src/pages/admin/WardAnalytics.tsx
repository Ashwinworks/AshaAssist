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

    // Prepare chart data
    const userDistributionData = {
        labels: ['Maternal Care', 'Palliative Care'],
        datasets: [{
            label: 'User Distribution',
            data: [analytics.userStats.maternal, analytics.userStats.palliative],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(139, 92, 246, 0.8)',
            ],
            borderColor: [
                'rgb(59, 130, 246)',
                'rgb(139, 92, 246)',
            ],
            borderWidth: 2,
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
                'rgba(251, 191, 36, 0.7)',
                'rgba(16, 185, 129, 0.7)',
                'rgba(59, 130, 246, 0.7)',
                'rgba(239, 68, 68, 0.7)',
            ],
            borderColor: [
                'rgb(251, 191, 36)',
                'rgb(16, 185, 129)',
                'rgb(59, 130, 246)',
                'rgb(239, 68, 68)',
            ],
            borderWidth: 2,
        }],
    };

    const supplyCategoryData = {
        labels: analytics.supplyStats.byCategory.map(item => item.category),
        datasets: [{
            label: 'Requests by Category',
            data: analytics.supplyStats.byCategory.map(item => item.count),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
        }],
    };

    // Activity timeline
    const months = analytics.activityTimeline.supplyRequests.map(item => item.month);
    const activityTimelineData = {
        labels: months,
        datasets: [
            {
                label: 'Supply Requests',
                data: analytics.activityTimeline.supplyRequests.map(item => item.count),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.3,
            },
            {
                label: 'Home Visits',
                data: analytics.activityTimeline.homeVisits.map(item => item.count),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.3,
            },
            {
                label: 'New Users',
                data: analytics.activityTimeline.userRegistrations.map(item => item.count),
                borderColor: 'rgb(139, 92, 246)',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                tension: 0.3,
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
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                        {analytics.ward} - Comprehensive Analytics
                    </h2>
                    <p style={{ color: 'var(--gray-600)', fontSize: '1rem' }}>
                        Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
                    </p>
                </div>

                {/* Key Metrics Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    {/* Total Users */}
                    <div className="card" style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        borderRadius: '0.75rem',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Users size={28} />
                            <div>
                                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Users</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{analytics.userStats.total}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                            {analytics.userStats.active} active users
                        </div>
                    </div>

                    {/* Supply Requests */}
                    <div className="card" style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        borderRadius: '0.75rem',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Package size={28} />
                            <div>
                                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Supply Requests</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{analytics.supplyStats.total}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                            {analytics.supplyStats.delivered} delivered
                        </div>
                    </div>

                    {/* Vaccinations */}
                    <div className="card" style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        borderRadius: '0.75rem',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Syringe size={28} />
                            <div>
                                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Vaccinations</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{analytics.vaccinationStats.bookings}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                            {analytics.vaccinationStats.completed} completed
                        </div>
                    </div>

                    {/* Home Visits */}
                    <div className="card" style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        borderRadius: '0.75rem',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Home size={28} />
                            <div>
                                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Home Visits</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{analytics.homeVisitStats.total}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                            {analytics.homeVisitStats.verified} verified
                        </div>
                    </div>
                </div>

                {/* Heat Map Section */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div className="card-header">
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} color="var(--blue-600)" />
                            Activity Heat Map
                        </h3>
                    </div>
                    <div className="card-content">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                            {Object.entries(analytics.heatMapData).map(([key, value]) => (
                                <div
                                    key={key}
                                    style={{
                                        padding: '1.5rem',
                                        borderRadius: '0.5rem',
                                        backgroundColor: getHeatColor(value),
                                        color: 'white',
                                        textAlign: 'center',
                                        transition: 'transform 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                        {value}%
                                    </div>
                                    <div style={{ fontSize: '0.875rem', textTransform: 'capitalize', opacity: 0.95 }}>
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '20px', height: '20px', backgroundColor: '#10b981', borderRadius: '4px' }} />
                                    <span>Excellent (80-100%)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '20px', height: '20px', backgroundColor: '#3b82f6', borderRadius: '4px' }} />
                                    <span>Good (60-79%)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '20px', height: '20px', backgroundColor: '#f59e0b', borderRadius: '4px' }} />
                                    <span>Fair (40-59%)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '20px', height: '20px', backgroundColor: '#f97316', borderRadius: '4px' }} />
                                    <span>Low (20-39%)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '20px', height: '20px', backgroundColor: '#ef4444', borderRadius: '4px' }} />
                                    <span>Critical (\u003c20%)</span>
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
