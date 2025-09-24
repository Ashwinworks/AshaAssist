import React, { useState, useEffect } from 'react';
import MaternityLayout from './MaternityLayout';
import { Calendar, MapPin, Phone, AlertCircle, CheckCircle, Clock, Check, X } from 'lucide-react';

const MaternityVisitRequests: React.FC = () => {
  const [formData, setFormData] = useState({
    reason: '',
    address: '',
    phone: '',
    requestedDate: '',
    priority: 'Medium'
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Validation functions
  const validatePhone = (phone: string): string => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone.trim()) return 'Phone number is required';
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) return 'Please enter a valid 10-digit Indian phone number';
    return '';
  };

  const validateAddress = (address: string): string => {
    if (!address.trim()) return 'Address is required';
    if (address.trim().length < 10) return 'Please provide a complete address (minimum 10 characters)';
    if (address.trim().length > 500) return 'Address is too long (maximum 500 characters)';
    return '';
  };

  const validateReason = (reason: string): string => {
    if (!reason.trim()) return 'Reason for visit is required';
    if (reason.trim().length < 20) return 'Please provide more details about the visit reason (minimum 20 characters)';
    if (reason.trim().length > 1000) return 'Reason is too long (maximum 1000 characters)';
    return '';
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'phone': return validatePhone(value);
      case 'address': return validateAddress(value);
      case 'reason': return validateReason(value);
      default: return '';
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    errors.phone = validatePhone(formData.phone);
    errors.address = validateAddress(formData.address);
    errors.reason = validateReason(formData.reason);

    // Remove empty errors
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field if it has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const fetchUserRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/visit-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setUserRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <Check size={16} color="var(--green-600)" />;
      case 'Rejected': return <X size={16} color="var(--red-600)" />;
      case 'Scheduled': return <Calendar size={16} color="var(--blue-600)" />;
      default: return <Clock size={16} color="var(--gray-600)" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'var(--red-600)';
      case 'High': return 'var(--orange-600)';
      case 'Medium': return 'var(--yellow-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'var(--red-50)';
      case 'High': return 'var(--orange-50)';
      case 'Medium': return 'var(--yellow-50)';
      default: return 'var(--gray-50)';
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      phone: true,
      address: true,
      reason: true
    });

    // Validate form
    if (!validateForm()) {
      setSubmitError('Please correct the errors below before submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSubmitError('Authentication required');
        return;
      }

      const response = await fetch('/api/visit-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          requestType: 'maternity'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          reason: '',
          address: '',
          phone: '',
          requestedDate: '',
          priority: 'Medium'
        });
        setValidationErrors({});
        setTouched({});
        // Refresh requests list
        fetchUserRequests();
      } else {
        setSubmitError(data.error || 'Failed to submit request');
      }
    } catch (error) {
      setSubmitError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <MaternityLayout title="Visit Requests">
        <div className="card">
          <div className="card-content" style={{ textAlign: 'center', padding: '3rem' }}>
            <CheckCircle size={48} color="var(--green-600)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--green-700)', marginBottom: '1rem' }}>Request Submitted Successfully!</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
              Your home visit request has been submitted. Your assigned ASHA worker will review and respond to your request shortly.
            </p>
            <button
              className="btn"
              onClick={() => setSubmitSuccess(false)}
              style={{ backgroundColor: 'var(--blue-600)', color: 'white' }}
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </MaternityLayout>
    );
  }

  return (
    <MaternityLayout title="Visit Requests">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Request Home Visit</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            Request a home visit from your assigned ASHA worker for maternity care services.
            This will allow you to schedule home visits for antenatal checkups, consultations, vaccination
            administration, postnatal care, and emergency support.
          </p>

          {submitError && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--red-50)',
              border: '1px solid var(--red-200)',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} color="var(--red-600)" />
              <span style={{ color: 'var(--red-700)' }}>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

              {/* Priority */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                  Priority Level *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                  className="input"
                >
                  <option value="Medium">Medium - Regular checkup needed</option>
                  <option value="High">High - Urgent medical attention needed</option>
                  <option value="Urgent">Urgent - Emergency situation</option>
                </select>
              </div>

              {/* Requested Date */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                  Preferred Visit Date
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
                  <input
                    type="date"
                    name="requestedDate"
                    value={formData.requestedDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="input"
                    style={{
                      paddingLeft: '2.5rem'
                    }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                  Contact Phone Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="9876543210"
                    required
                    className={`input${validationErrors.phone && touched.phone ? ' input-error' : ''}`}
                    style={{
                      paddingLeft: '2.5rem'
                    }}
                  />
                </div>
                {validationErrors.phone && touched.phone && (
                  <span style={{ color: 'var(--red-600)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {validationErrors.phone}
                  </span>
                )}
              </div>

              {/* Address */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                  Complete Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: 'var(--gray-500)' }} />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="House No., Street, Ward, City, PIN Code"
                    required
                    rows={3}
                    className={`input${validationErrors.address && touched.address ? ' input-error' : ''}`}
                    style={{
                      paddingLeft: '2.5rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
                {validationErrors.address && touched.address && (
                  <span style={{ color: 'var(--red-600)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {validationErrors.address}
                  </span>
                )}
              </div>

              {/* Reason */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                  Reason for Visit *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Please describe the reason for the home visit (e.g., antenatal checkup, postnatal care, vaccination, consultation, etc.)"
                  required
                  rows={4}
                  className={`input${validationErrors.reason && touched.reason ? ' input-error' : ''}`}
                  style={{
                    resize: 'vertical'
                  }}
                />
                {validationErrors.reason && touched.reason && (
                  <span style={{ color: 'var(--red-600)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {validationErrors.reason}
                  </span>
                )}
              </div>

            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-200)' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn"
                style={{
                  backgroundColor: isSubmitting ? 'var(--gray-400)' : 'var(--blue-600)',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  width: '100%'
                }}
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Visit Request'}
              </button>
            </div>
          </form>

          {/* User's Existing Requests */}
          {loadingRequests ? (
            <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--gray-600)' }}>Loading your requests...</p>
            </div>
          ) : userRequests.length > 0 ? (
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '1.5rem' }}>
                Your Visit Requests
              </h3>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {userRequests.map((request) => (
                  <div
                    key={request.id}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid var(--gray-200)',
                      borderRadius: '0.5rem',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                          {request.requestType} Care Visit
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {getStatusIcon(request.status)}
                          <span style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: request.status === 'Approved' ? 'var(--green-700)' :
                                   request.status === 'Rejected' ? 'var(--red-700)' :
                                   request.status === 'Scheduled' ? 'var(--blue-700)' :
                                   'var(--gray-700)'
                          }}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: getPriorityColor(request.priority),
                        backgroundColor: getPriorityBg(request.priority),
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem'
                      }}>
                        {request.priority}
                      </span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                        <strong>Reason:</strong> {request.reason}
                      </p>
                      {request.status === 'Scheduled' && request.scheduledDateTime && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--green-700)', marginBottom: '0.5rem', fontWeight: '500' }}>
                          <strong>🗓️ Scheduled:</strong> {request.scheduledDate}
                          {request.scheduledTime && ` at ${request.scheduledTime}`}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} color="var(--gray-500)" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          {request.address}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={16} color="var(--gray-500)" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          {request.phone}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} color="var(--gray-500)" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          Requested: {request.requestedDate}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--gray-600)' }}>No visit requests found. Submit a new request above.</p>
            </div>
          )}
        </div>
      </div>
    </MaternityLayout>
  );
};

export default MaternityVisitRequests;