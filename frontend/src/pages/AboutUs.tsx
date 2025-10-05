import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Award, Target, ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';
import './LandingPage.css';

const AboutUs: React.FC = () => {
  return (
    <div className="about-page">
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
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1 className="about-hero-title">About AshaAssist</h1>
            <p className="about-hero-description">
              Empowering communities through innovative healthcare solutions and
              strengthening the vital connection between ASHA workers and families.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2 className="section-title">Our Mission</h2>
              <p className="mission-description">
                To revolutionize community healthcare delivery by creating a digital bridge between
                Accredited Social Health Activists (ASHA workers) and the families they serve.
                We believe that every individual deserves access to quality healthcare, and technology
                can play a crucial role in making this vision a reality.
              </p>
              <div className="mission-stats">
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
            <div className="mission-image">
              <div className="mission-card">
                <Heart className="mission-icon" />
                <h3>Healthcare for All</h3>
                <p>Making quality healthcare accessible to every community member</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Values</h2>
            <p className="section-description">
              The principles that guide everything we do at AshaAssist
            </p>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <Users />
              </div>
              <h3 className="value-title">Community First</h3>
              <p className="value-description">
                We put the needs of communities at the heart of everything we do,
                ensuring our solutions address real-world healthcare challenges.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <Target />
              </div>
              <h3 className="value-title">Innovation</h3>
              <p className="value-description">
                We leverage technology to create innovative solutions that improve
                healthcare delivery and make ASHA workers more effective.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <Award />
              </div>
              <h3 className="value-title">Excellence</h3>
              <p className="value-description">
                We are committed to delivering high-quality, reliable healthcare
                solutions that healthcare workers and families can depend on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Team</h2>
            <p className="section-description">
              Meet the dedicated professionals behind AshaAssist
            </p>
          </div>

          <div className="team-grid">
            <div className="team-member">
              <div className="team-member-avatar">
                <Heart />
              </div>
              <h3 className="team-member-name">AshaAssist Team</h3>
              <p className="team-member-role">Healthcare Technology Experts</p>
              <p className="team-member-bio">
                A passionate team of developers, healthcare professionals, and community
                advocates working together to improve healthcare delivery in rural and
                underserved communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="contact-cta">
        <div className="container">
          <div className="contact-cta-content">
            <h2 className="contact-cta-title">Get in Touch</h2>
            <p className="contact-cta-description">
              Have questions about AshaAssist? We'd love to hear from you.
            </p>
            <Link to="/contact" className="btn btn-primary btn-lg">
              Contact Us
            </Link>
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

export default AboutUs;