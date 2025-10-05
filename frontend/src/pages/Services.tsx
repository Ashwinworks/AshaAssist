import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Users, FileText, Calendar, Bell, ArrowLeft, CheckCircle } from 'lucide-react';
import './LandingPage.css';

const Services: React.FC = () => {
  const services = [
    {
      id: 'maternal-care',
      icon: Heart,
      title: 'Maternal Care',
      description: 'Complete support for pregnant women and new mothers with digital MCP cards, antenatal visit tracking, and vaccination schedules.',
      features: [
        'Digital MCP (Mother & Child Protection) cards',
        'Antenatal visit scheduling and tracking',
        'Vaccination reminders and booking',
        'Weekly ration distribution',
        'Emergency contact and support',
        'Postnatal care monitoring'
      ],
      color: 'text-red-500'
    },
    {
      id: 'palliative-care',
      icon: Shield,
      title: 'Palliative Care',
      description: 'Specialized care management for chronic and terminal illness patients with medication tracking and health status updates.',
      features: [
        'Health record management',
        'Medication and supply requests',
        'Regular health monitoring',
        'Emergency response coordination',
        'Family support and counseling',
        'End-of-life care planning'
      ],
      color: 'text-blue-500'
    },
    {
      id: 'health-records',
      icon: FileText,
      title: 'Digital Health Records',
      description: 'Secure digital storage of health records, medical history, and treatment plans accessible to authorized healthcare providers.',
      features: [
        'Centralized health records',
        'Medical history tracking',
        'Treatment plan management',
        'Test results storage',
        'Secure data sharing',
        'Privacy protection'
      ],
      color: 'text-green-500'
    },
    {
      id: 'community-programs',
      icon: Users,
      title: 'Community Programs',
      description: 'Community health initiatives including vaccination drives, health camps, nutrition programs, and educational sessions.',
      features: [
        'Vaccination campaigns',
        'Health awareness sessions',
        'Nutrition programs',
        'Community health camps',
        'Educational workshops',
        'Preventive care initiatives'
      ],
      color: 'text-purple-500'
    }
  ];

  const scrollToService = (serviceId: string) => {
    const element = document.getElementById(serviceId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="services-page">
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
      <section className="services-hero">
        <div className="container">
          <div className="services-hero-content">
            <h1 className="services-hero-title">Our Services</h1>
            <p className="services-hero-description">
              Comprehensive healthcare solutions designed to meet the unique needs of communities,
              families, and healthcare workers through innovative digital platforms.
            </p>
          </div>
        </div>
      </section>

      {/* Services Navigation */}
      <section className="services-nav">
        <div className="container">
          <div className="services-nav-grid">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => scrollToService(service.id)}
                  className="service-nav-card"
                >
                  <IconComponent className={`service-nav-icon ${service.color}`} />
                  <h3 className="service-nav-title">{service.title}</h3>
                  <p className="service-nav-description">{service.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="services-detail">
        <div className="container">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div key={service.id} id={service.id} className="service-detail-card">
                <div className="service-detail-header">
                  <div className="service-detail-icon">
                    <IconComponent className={service.color} />
                  </div>
                  <div className="service-detail-title-section">
                    <h2 className="service-detail-title">{service.title}</h2>
                    <p className="service-detail-description">{service.description}</p>
                  </div>
                </div>

                <div className="service-detail-content">
                  <div className="service-features">
                    <h3>What We Offer</h3>
                    <div className="features-grid">
                      {service.features.map((feature, index) => (
                        <div key={index} className="feature-item">
                          <CheckCircle className="feature-check" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="service-benefits">
                    <h3>Benefits</h3>
                    <div className="benefits-content">
                      <div className="benefit-item">
                        <Calendar className="benefit-icon" />
                        <div>
                          <h4>Regular Monitoring</h4>
                          <p>Consistent health check-ups and follow-ups</p>
                        </div>
                      </div>
                      <div className="benefit-item">
                        <Bell className="benefit-icon" />
                        <div>
                          <h4>Timely Notifications</h4>
                          <p>Automated reminders for appointments and medications</p>
                        </div>
                      </div>
                      <div className="benefit-item">
                        <Users className="benefit-icon" />
                        <div>
                          <h4>Community Support</h4>
                          <p>Connected healthcare ecosystem for better care</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="container">
          <div className="services-cta-content">
            <h2 className="services-cta-title">Ready to Experience Better Healthcare?</h2>
            <p className="services-cta-description">
              Join AshaAssist today and discover how our comprehensive healthcare services
              can improve health outcomes in your community.
            </p>
            <div className="services-cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
              </Link>
              <Link to="/contact" className="btn btn-outline btn-lg">
                Contact Us
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
              <h4 className="footer-title">Services</h4>
              <ul className="footer-links">
                <li><Link to="/services#maternal-care">Maternal Care</Link></li>
                <li><Link to="/services#palliative-care">Palliative Care</Link></li>
                <li><Link to="/services#health-records">Health Records</Link></li>
                <li><Link to="/services#community-programs">Community Programs</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Contact Info</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <Heart size={16} />
                  <span>+91 9497 123400</span>
                </div>
                <div className="contact-item">
                  <Shield size={16} />
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

export default Services;