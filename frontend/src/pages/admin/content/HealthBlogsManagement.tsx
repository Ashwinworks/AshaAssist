import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { 
  Search, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Calendar, 
  User, 
  Tag,
  Filter
} from 'lucide-react';

const HealthBlogsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data for demonstration
  const healthBlogs = [
    {
      id: 1,
      title: 'Importance of Prenatal Care During Pregnancy',
      category: 'Maternity',
      author: 'Dr. Priya Sharma',
      authorId: 1,
      excerpt: 'Regular prenatal checkups are crucial for monitoring the health of both mother and baby. This comprehensive guide covers all aspects of prenatal care...',
      content: 'Full blog content here...',
      publishedDate: '2024-01-10',
      lastModified: '2024-01-15',
      status: 'Published',
      views: 245,
      likes: 34,
      comments: 12,
      tags: ['Pregnancy', 'Prenatal Care', 'Health Tips'],
      approvalStatus: 'Approved',
      approvedBy: 'Admin',
      approvalDate: '2024-01-10'
    },
    {
      id: 2,
      title: 'Managing Pain in Palliative Care Patients',
      category: 'Palliative',
      author: 'Sister Meera Devi',
      authorId: 2,
      excerpt: 'Effective pain management is essential for improving quality of life in palliative care. Learn about various pain management techniques...',
      content: 'Full blog content here...',
      publishedDate: null,
      lastModified: '2024-01-16',
      status: 'Draft',
      views: 0,
      likes: 0,
      comments: 0,
      tags: ['Palliative Care', 'Pain Management', 'Elderly Care'],
      approvalStatus: 'Pending',
      approvedBy: null,
      approvalDate: null
    },
    {
      id: 3,
      title: 'Vaccination Schedule for Children Under 5',
      category: 'Child Health',
      author: 'Sunita Kumari',
      authorId: 3,
      excerpt: 'Complete vaccination schedule and importance of timely immunization for children. A detailed guide for parents...',
      content: 'Full blog content here...',
      publishedDate: '2024-01-05',
      lastModified: '2024-01-05',
      status: 'Published',
      views: 312,
      likes: 45,
      comments: 18,
      tags: ['Vaccination', 'Child Health', 'Immunization'],
      approvalStatus: 'Approved',
      approvedBy: 'Admin',
      approvalDate: '2024-01-05'
    },
    {
      id: 4,
      title: 'Mental Health Support for Caregivers',
      category: 'General Health',
      author: 'Dr. Priya Sharma',
      authorId: 1,
      excerpt: 'Caring for others can take a toll on mental health. This blog discusses strategies for caregiver self-care...',
      content: 'Full blog content here...',
      publishedDate: null,
      lastModified: '2024-01-17',
      status: 'Draft',
      views: 0,
      likes: 0,
      comments: 0,
      tags: ['Mental Health', 'Caregivers', 'Self Care'],
      approvalStatus: 'Rejected',
      approvedBy: 'Admin',
      approvalDate: '2024-01-17',
      rejectionReason: 'Content needs more medical references and expert citations.'
    }
  ];

  const filteredBlogs = healthBlogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || blog.approvalStatus.toLowerCase() === filterStatus;
    const matchesCategory = filterCategory === 'all' || blog.category.toLowerCase() === filterCategory.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'var(--green-600)';
      case 'Pending': return 'var(--yellow-600)';
      case 'Rejected': return 'var(--red-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Approved': return 'var(--green-50)';
      case 'Pending': return 'var(--yellow-50)';
      case 'Rejected': return 'var(--red-50)';
      default: return 'var(--gray-50)';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Maternity': return 'var(--pink-600)';
      case 'Palliative': return 'var(--blue-600)';
      case 'Child Health': return 'var(--green-600)';
      case 'General Health': return 'var(--purple-600)';
      default: return 'var(--gray-600)';
    }
  };

  const handleApprove = (blogId: number) => {
    console.log(`Approving blog ${blogId}`);
    // In real app, make API call to approve
  };

  const handleReject = (blogId: number) => {
    console.log(`Rejecting blog ${blogId}`);
    // In real app, make API call to reject
  };

  const handleDelete = (blogId: number) => {
    console.log(`Deleting blog ${blogId}`);
    // In real app, make API call to delete
  };

  return (
    <AdminLayout title="Health Blogs Management">
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem' }}>
            Review, approve, edit, or delete health blogs created by ASHA workers.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-content" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '300px' }}>
                <Search size={20} color="var(--gray-400)" />
                <input 
                  type="text" 
                  placeholder="Search blogs by title, author, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    flex: 1,
                    padding: '0.75rem', 
                    border: '1px solid var(--gray-300)', 
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ 
                  padding: '0.75rem', 
                  border: '1px solid var(--gray-300)', 
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  minWidth: '130px'
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ 
                  padding: '0.75rem', 
                  border: '1px solid var(--gray-300)', 
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  minWidth: '150px'
                }}
              >
                <option value="all">All Categories</option>
                <option value="maternity">Maternity</option>
                <option value="palliative">Palliative</option>
                <option value="child health">Child Health</option>
                <option value="general health">General Health</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {healthBlogs.filter(b => b.approvalStatus === 'Pending').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending Approval</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {healthBlogs.filter(b => b.approvalStatus === 'Approved').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Approved</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {healthBlogs.reduce((sum, b) => sum + b.views, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Views</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {healthBlogs.reduce((sum, b) => sum + b.likes, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Likes</div>
          </div>
        </div>

        {/* Health Blogs List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Health Blogs</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredBlogs.map((blog) => (
                <div 
                  key={blog.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getStatusColor(blog.approvalStatus)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {blog.title}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getCategoryColor(blog.category),
                          backgroundColor: `${getCategoryColor(blog.category)}20`,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {blog.category}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getStatusColor(blog.approvalStatus),
                          backgroundColor: getStatusBg(blog.approvalStatus),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {blog.approvalStatus}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 1rem', color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                        {blog.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Blog Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <User size={16} color="var(--blue-600)" />
                        <strong style={{ color: 'var(--blue-700)' }}>Author Info</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Author: {blog.author}</div>
                        <div>Last Modified: {blog.lastModified}</div>
                        {blog.publishedDate && <div>Published: {blog.publishedDate}</div>}
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Eye size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-700)' }}>Engagement</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Views: {blog.views}</div>
                        <div>Likes: {blog.likes}</div>
                        <div>Comments: {blog.comments}</div>
                      </div>
                    </div>

                    {blog.approvalStatus === 'Approved' && (
                      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <CheckCircle size={16} color="var(--purple-600)" />
                          <strong style={{ color: 'var(--purple-700)' }}>Approval Info</strong>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                          <div>Approved by: {blog.approvedBy}</div>
                          <div>Date: {blog.approvalDate}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Tag size={14} color="var(--gray-600)" />
                      <strong style={{ color: 'var(--gray-700)', fontSize: '0.875rem' }}>Tags:</strong>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {blog.tags.map((tag, index) => (
                        <span 
                          key={index}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: 'var(--blue-700)',
                            backgroundColor: 'var(--blue-50)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid var(--blue-200)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {blog.approvalStatus === 'Rejected' && blog.rejectionReason && (
                    <div style={{ padding: '1rem', backgroundColor: 'var(--red-50)', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid var(--red-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <XCircle size={16} color="var(--red-600)" />
                        <strong style={{ color: 'var(--red-800)', fontSize: '0.875rem' }}>Rejection Reason:</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--red-700)' }}>
                        {blog.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                    <button 
                      className="btn"
                      style={{ 
                        backgroundColor: 'var(--blue-600)', 
                        color: 'white', 
                        border: 'none',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Eye size={14} />
                      View Full
                    </button>
                    <button 
                      className="btn"
                      style={{ 
                        backgroundColor: 'var(--purple-600)', 
                        color: 'white', 
                        border: 'none',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    {blog.approvalStatus === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(blog.id)}
                          className="btn"
                          style={{ 
                            backgroundColor: 'var(--green-600)', 
                            color: 'white', 
                            border: 'none',
                            fontSize: '0.875rem',
                            padding: '0.5rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(blog.id)}
                          className="btn"
                          style={{ 
                            backgroundColor: 'var(--red-600)', 
                            color: 'white', 
                            border: 'none',
                            fontSize: '0.875rem',
                            padding: '0.5rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleDelete(blog.id)}
                      className="btn"
                      style={{ 
                        backgroundColor: 'var(--red-600)', 
                        color: 'white', 
                        border: 'none',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default HealthBlogsManagement;