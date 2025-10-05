import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Send, ArrowLeft, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import './LandingPage.css';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Thank you for your message! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <Link to="/" className="nav-back">
              <ArrowLeft size={20} />
              Back to Home
            </Link>
            <div className="nav-links">
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <h1 className="contact-hero-title">Contact Us</h1>
            <p className="contact-hero-description">
              Have questions about AshaAssist? Need support? We're here to help.
              Get in touch with our team and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            {/* Contact Info */}
            <div className="contact-info">
              <h2 className="section-title">Get in Touch</h2>
              <p className="contact-description">
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-method-icon">
                    <Phone />
                  </div>
                  <div className="contact-method-content">
                    <h3>Phone</h3>
                    <p>+91 9497 123400</p>
                    <p className="contact-note">Mon-Fri, 9AM-6PM IST</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-method-icon">
                    <Mail />
                  </div>
                  <div className="contact-method-content">
                    <h3>Email</h3>
                    <p>support@ashaassist.in</p>
                    <p className="contact-note">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-method-icon">
                    <MapPin />
                  </div>
                  <div className="contact-method-content">
                    <h3>Address</h3>
                    <p>Ward 1, Manarcad</p>
                    <p>Kerala, India</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-method-icon">
                    <Clock />
                  </div>
                  <div className="contact-method-content">
                    <h3>Support Hours</h3>
                    <p>Monday - Friday</p>
                    <p>9:00 AM - 6:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form">
              <div className="form-card">
                <div className="form-header">
                  <MessageSquare className="form-icon" />
                  <h3>Send us a Message</h3>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-block"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-description">
              Quick answers to common questions about AshaAssist
            </p>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do I get started with AshaAssist?</h3>
              <p>Simply register for an account, complete your profile setup, and connect with your local ASHA worker.</p>
            </div>

            <div className="faq-item">
              <h3>Is AshaAssist free to use?</h3>
              <p>Yes, AshaAssist is completely free for families and healthcare workers in our supported communities.</p>
            </div>

            <div className="faq-item">
              <h3>What services does AshaAssist provide?</h3>
              <p>We provide maternal care, palliative care, health records management, vaccination tracking, and community health programs.</p>
            </div>

            <div className="faq-item">
              <h3>How can ASHA workers use the platform?</h3>
              <p>ASHA workers can manage schedules, track patient records, handle supply requests, and communicate with families.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <Phone className="logo-icon" />
                <span className="logo-text">AshaAssist</span>
              </div>
              <p className="footer-description">
                Empowering communities through digital healthcare solutions.
              </p>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Contact Info</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <Phone size={16} />
                  <span>+91 9497 123400</span>
                </div>
                <div className="contact-item">
                  <Mail size={16} />
                  <span>support@ashaassist.in</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 AshaAssist. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;