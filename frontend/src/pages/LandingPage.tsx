import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Calendar, Shield, Phone, Mail, ArrowRight, TrendingUp, FileText, Bell } from 'lucide-react';
import Orb from '../components/Orb';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <div className="logo">
              <Heart className="logo-icon" />
              <span className="logo-text">AshaAssist</span>
            </div>
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
      <section className="hero">
        <div className="hero-orb">
          <Orb
            hue={240}
            hoverIntensity={0.5}
            rotateOnHover={true}
            forceHoverState={false}
          />
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Connecting Communities with
                <span className="text-primary-600"> Healthcare Excellence</span>
              </h1>
              <p className="hero-description">
                AshaAssist bridges the gap between ASHA workers and families, 
                providing seamless healthcare service delivery, maternal care support, 
                and palliative care management in your community.
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Join AshaAssist
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-card">
                <div className="hero-card-content">
                  <div className="hero-stats">
                    <div className="stat">
                      <div className="stat-number">500+</div>
                      <div className="stat-label">Families Served</div>
                    </div>
                    <div className="stat">
                      <div className="stat-number">1</div>
                      <div className="stat-label">ASHA Worker</div>
                    </div>
                    <div className="stat">
                      <div className="stat-number">24/7</div>
                      <div className="stat-label">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Comprehensive Healthcare Solutions</h2>
            <p className="section-description">
              Our platform provides everything needed for effective community healthcare management
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Heart />
              </div>
              <h3 className="feature-title">Maternal Care</h3>
              <p className="feature-description">
                Complete support for pregnant women and new mothers with digital MCP cards, 
                antenatal visit tracking, and vaccination schedules.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Shield />
              </div>
              <h3 className="feature-title">Palliative Care</h3>
              <p className="feature-description">
                Specialized care management for chronic and terminal illness patients 
                with medication tracking and health status updates.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Users />
              </div>
              <h3 className="feature-title">Community Connect</h3>
              <p className="feature-description">
                Direct communication between families and ASHA workers for service requests, 
                supply distribution, and health consultations.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Calendar />
              </div>
              <h3 className="feature-title">Smart Scheduling</h3>
              <p className="feature-description">
                Integrated calendar system for health visits, vaccination days, 
                community classes, and monthly health camps.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FileText />
              </div>
              <h3 className="feature-title">Digital Health Records</h3>
              <p className="feature-description">
                Secure digital storage of health records, medical history, 
                and treatment plans accessible to authorized healthcare providers.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Bell />
              </div>
              <h3 className="feature-title">Health Notifications</h3>
              <p className="feature-description">
                Automated reminders for medications, appointments, vaccinations, 
                and health checkups to ensure continuous care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="user-types">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose AshaAssist?</h2>
            <p className="section-description">
              Discover how AshaAssist transforms healthcare delivery and creates positive impact in communities
            </p>
          </div>
          
          <div className="user-types-grid">
            <div className="user-type-card">
              <div className="user-type-header">
                <div className="user-type-icon">
                  <Users />
                </div>
                <h3 className="user-type-title">Families & Individuals</h3>
                <p className="user-type-subtitle">Healthcare Recipients</p>
              </div>
              <ul className="user-type-features">
                <li>Request home visits and medical supplies</li>
                <li>Track health records and vaccination schedules</li>
                <li>Receive personalized health notifications</li>
                <li>Access maternal or palliative care services</li>
                <li>Provide feedback on ASHA worker services</li>
              </ul>
            </div>
            
            <div className="user-type-card">
              <div className="user-type-header">
                <div className="user-type-icon">
                  <ArrowRight />
                </div>
                <h3 className="user-type-title">How AshaAssist Works</h3>
                <p className="user-type-subtitle">Simple Steps to Better Healthcare</p>
              </div>
              <ul className="user-type-features">
                <li>Sign up and complete your health profile</li>
                <li>Connect with your local ASHA worker</li>
                <li>Request services like home visits or supplies</li>
                <li>Track your health records and appointments</li>
                <li>Receive timely health notifications and reminders</li>
              </ul>
            </div>
            
            <div className="user-type-card">
              <div className="user-type-header">
                <div className="user-type-icon">
                  <TrendingUp />
                </div>
                <h3 className="user-type-title">Community Impact</h3>
                <p className="user-type-subtitle">Making a Difference Together</p>
              </div>
              <ul className="user-type-features">
                <li>Reduced waiting times for healthcare services</li>
                <li>Better maternal and child health outcomes</li>
                <li>Improved medication adherence tracking</li>
                <li>Enhanced communication with healthcare providers</li>
                <li>Digital health records for better care continuity</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Healthcare in Your Community?</h2>
            <p className="cta-description">
              Join thousands of families and healthcare workers already using AshaAssist 
              to improve healthcare delivery and outcomes.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Today
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Already have an account?
              </Link>
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
                <Heart className="logo-icon" />
                <span className="logo-text">AshaAssist</span>
              </div>
              <p className="footer-description">
                Empowering communities through digital healthcare solutions and 
                seamless ASHA worker-family connections.
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
              <h4 className="footer-title">Services</h4>
              <ul className="footer-links">
                <li><a href="#maternal-care">Maternal Care</a></li>
                <li><a href="#palliative-care">Palliative Care</a></li>
                <li><a href="#health-records">Health Records</a></li>
                <li><a href="#community-programs">Community Programs</a></li>
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
            <div className="footer-bottom-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;