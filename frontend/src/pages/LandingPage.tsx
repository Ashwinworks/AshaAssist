import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Users, Calendar, Shield, Phone, Mail, ArrowRight, TrendingUp, FileText, Bell } from 'lucide-react';
import Orb from '../components/Orb';
import LanguageToggle from '../components/LanguageToggle';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
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
              <LanguageToggle />
              <Link to="/login" className="btn btn-outline">
                {t('landing.login')}
              </Link>
              <Link to="/register" className="btn btn-primary">
                {t('landing.getStarted')}
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
                {t('landing.heroTitle')}
                <span className="text-primary-600"> {t('landing.heroHighlight')}</span>
              </h1>
              <p className="hero-description">
                {t('landing.heroDesc')}
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">
                  {t('landing.joinUs')}
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  {t('landing.signIn')}
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-card">
                <div className="hero-card-content">
                  <div className="hero-stats">
                    <div className="stat">
                      <div className="stat-number">500+</div>
                      <div className="stat-label">{t('landing.familiesServed')}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-number">1</div>
                      <div className="stat-label">{t('landing.ashaWorker')}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-number">24/7</div>
                      <div className="stat-label">{t('landing.support')}</div>
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
            <h2 className="section-title">{t('landing.featuresTitle')}</h2>
            <p className="section-description">
              {t('landing.featuresDesc')}
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Heart />
              </div>
              <h3 className="feature-title">{t('landing.maternalCare')}</h3>
              <p className="feature-description">
                {t('landing.maternalCareDesc')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Shield />
              </div>
              <h3 className="feature-title">{t('landing.palliativeCare')}</h3>
              <p className="feature-description">
                {t('landing.palliativeCareDesc')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users />
              </div>
              <h3 className="feature-title">{t('landing.communityConnect')}</h3>
              <p className="feature-description">
                {t('landing.communityConnectDesc')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Calendar />
              </div>
              <h3 className="feature-title">{t('landing.smartScheduling')}</h3>
              <p className="feature-description">
                {t('landing.smartSchedulingDesc')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FileText />
              </div>
              <h3 className="feature-title">{t('landing.digitalRecords')}</h3>
              <p className="feature-description">
                {t('landing.digitalRecordsDesc')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Bell />
              </div>
              <h3 className="feature-title">{t('landing.healthNotifications')}</h3>
              <p className="feature-description">
                {t('landing.healthNotificationsDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="user-types">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('landing.whyChoose')}</h2>
            <p className="section-description">
              {t('landing.whyChooseDesc')}
            </p>
          </div>

          <div className="user-types-grid">
            <div className="user-type-card">
              <div className="user-type-header">
                <div className="user-type-icon">
                  <Users />
                </div>
                <h3 className="user-type-title">{t('landing.familiesTitle')}</h3>
                <p className="user-type-subtitle">{t('landing.familiesSubtitle')}</p>
              </div>
              <ul className="user-type-features">
                <li>{t('landing.familiesItem1')}</li>
                <li>{t('landing.familiesItem2')}</li>
                <li>{t('landing.familiesItem3')}</li>
                <li>{t('landing.familiesItem4')}</li>
                <li>{t('landing.familiesItem5')}</li>
              </ul>
            </div>

            <div className="user-type-card">
              <div className="user-type-header">
                <div className="user-type-icon">
                  <ArrowRight />
                </div>
                <h3 className="user-type-title">{t('landing.howItWorksTitle')}</h3>
                <p className="user-type-subtitle">{t('landing.howItWorksSubtitle')}</p>
              </div>
              <ul className="user-type-features">
                <li>{t('landing.howItWorksItem1')}</li>
                <li>{t('landing.howItWorksItem2')}</li>
                <li>{t('landing.howItWorksItem3')}</li>
                <li>{t('landing.howItWorksItem4')}</li>
                <li>{t('landing.howItWorksItem5')}</li>
              </ul>
            </div>

            <div className="user-type-card">
              <div className="user-type-header">
                <div className="user-type-icon">
                  <TrendingUp />
                </div>
                <h3 className="user-type-title">{t('landing.impactTitle')}</h3>
                <p className="user-type-subtitle">{t('landing.impactSubtitle')}</p>
              </div>
              <ul className="user-type-features">
                <li>{t('landing.impactItem1')}</li>
                <li>{t('landing.impactItem2')}</li>
                <li>{t('landing.impactItem3')}</li>
                <li>{t('landing.impactItem4')}</li>
                <li>{t('landing.impactItem5')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">{t('landing.ctaTitle')}</h2>
            <p className="cta-description">
              {t('landing.ctaDesc')}
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                {t('landing.getStartedToday')}
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                {t('landing.alreadyAccount')}
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