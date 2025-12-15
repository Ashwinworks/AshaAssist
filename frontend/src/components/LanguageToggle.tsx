import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
    const { i18n, t } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ml' : 'en';
        i18n.changeLanguage(newLang);
        localStorage.setItem('i18nextLng', newLang);
    };

    const isEnglish = i18n.language === 'en' || i18n.language?.startsWith('en');

    return (
        <button
            onClick={toggleLanguage}
            className="language-toggle"
            title={t('nav.language')}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--primary-50, #fce7f3)',
                border: '1px solid var(--primary-200, #fbcfe8)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--primary-700, #be185d)',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-100, #fce7f3)';
                e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-50, #fce7f3)';
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            <Globe size={18} />
            <span style={{
                fontWeight: 600,
                minWidth: '60px',
                textAlign: 'center'
            }}>
                {isEnglish ? 'മലയാളം' : 'English'}
            </span>
        </button>
    );
};

export default LanguageToggle;
