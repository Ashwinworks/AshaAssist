import React, { useEffect, useMemo, useRef, useState } from 'react';
import MaternityLayout from './MaternityLayout';
import { maternityAPI } from '../../services/api';
import { Calendar, Syringe, FileText, Download } from 'lucide-react';

interface VisitItem {
  id: string;
  visitDate: string; // ISO string from backend
  week?: number | null;
  center?: string;
  notes?: string;
}

const formatDate = (isoOrDate: string | Date) => {
  try {
    const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString();
  } catch {
    return '-';
  }
};

const colors = {
  pink50: '#fff1f5',
  pink100: '#ffe4ef',
  pink200: '#fecdd3',
  pink300: '#fda4af',
  pink500: '#ec4899',
  pink600: '#db2777',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  white: '#ffffff',
};

const MCPCard: React.FC = () => {
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const printRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await maternityAPI.getVisits();
        if (!mounted) return;
        const items: VisitItem[] = (data?.visits || []).map((v: any) => ({
          id: v._id || v.id,
          visitDate: v.visitDate,
          week: v.week ?? null,
          center: v.center || '',
          notes: v.notes || '',
        }));
        setVisits(items);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to load visits');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const visitRows = useMemo(() => visits, [visits]);

  const handleDownloadPdf = () => {
    // Use native print-to-PDF. Print CSS will scope to card only.
    window.print();
  };

  return (
    <MaternityLayout title="Digital MCP Card">
      {/* Print stylesheet scoped for PDF export */}
      <style>
        {`
        @media print {
          body * { visibility: hidden; }
          #mcp-print-area, #mcp-print-area * { visibility: visible; }
          #mcp-print-area { position: absolute; left: 0; top: 0; width: 210mm; }
          @page { size: A4 portrait; margin: 12mm; }
        }
      `}
      </style>

      <div className="card" style={{ border: `1px solid ${colors.gray200}`, borderRadius: 12, overflow: 'hidden' }}>
        {/* Header band inspired by Kerala MCP */}
        <div
          style={{
            background: `linear-gradient(90deg, ${colors.pink500}, ${colors.pink300})`,
            color: colors.white,
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={22} />
            <div>
              <div style={{ fontSize: '0.75rem', letterSpacing: 1.5, opacity: 0.9 }}>Antenatal Care</div>
              <h2 className="card-title" style={{ margin: 0 }}>Mother and Child Protection Card</h2>
            </div>
          </div>

          <button
            onClick={handleDownloadPdf}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: colors.white,
              color: colors.pink600,
              border: 'none',
              padding: '0.5rem 0.875rem',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>

        {/* Printable content wrapper */}
        <div id="mcp-print-area" ref={printRef} style={{ backgroundColor: colors.pink50 }}>
          {/* Card meta */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${colors.gray200}`, backgroundColor: colors.white }}>
            <p style={{ margin: 0, color: colors.gray600 }}>
              This digital MCP card summarizes your antenatal visits and vaccinations.
            </p>
          </div>

          {/* Antenatal Visits */}
          <section style={{ padding: '1.25rem 1.5rem' }}>
            <div
              style={{
                backgroundColor: colors.pink100,
                border: `1px solid ${colors.pink200}`,
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderBottom: `1px solid ${colors.pink200}`,
                  backgroundColor: colors.white,
                }}
              >
                <Calendar size={18} style={{ color: colors.pink600 }} />
                <h3 style={{ margin: 0, fontWeight: 800, color: colors.gray800 }}>Antenatal Visits</h3>
              </div>

              <div style={{ overflow: 'auto', backgroundColor: colors.white }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ backgroundColor: colors.pink100 }}>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Gestational Week</th>
                      <th style={thStyle}>Facility/Center</th>
                      <th style={thStyle}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={4} style={tdEmptyStyle}>Loading visits...</td>
                      </tr>
                    )}
                    {!loading && error && (
                      <tr>
                        <td colSpan={4} style={{ ...tdEmptyStyle, color: '#b91c1c' }}>{error}</td>
                      </tr>
                    )}
                    {!loading && !error && visitRows.length === 0 && (
                      <tr>
                        <td colSpan={4} style={tdEmptyStyle}>No visits recorded yet.</td>
                      </tr>
                    )}
                    {!loading && !error && visitRows.map((v, idx) => (
                      <tr key={v.id} style={{ backgroundColor: idx % 2 ? colors.gray50 : colors.white }}>
                        <td style={tdStyle}>{formatDate(v.visitDate)}</td>
                        <td style={tdStyle}>{v.week ?? '-'}</td>
                        <td style={tdStyle}>{v.center || '-'}</td>
                        <td style={tdStyle}>{v.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Vaccination Records Placeholder */}
          <section style={{ padding: '0 1.5rem 1.5rem' }}>
            <div
              style={{
                backgroundColor: colors.pink100,
                border: `1px dashed ${colors.pink300}`,
                borderRadius: 10,
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Syringe size={18} style={{ color: colors.pink600 }} />
                <h3 style={{ margin: 0, fontWeight: 800, color: colors.gray800 }}>Vaccination Records</h3>
              </div>
              <div style={{ backgroundColor: colors.white, borderRadius: 8, padding: '0.75rem 1rem', border: `1px solid ${colors.gray200}` }}>
                <p style={{ margin: 0, color: colors.gray600 }}>
                  Vaccination data will appear here once added in the Vaccination option. Fields planned: vaccine, dose, date, batch number, and next due date.
                </p>
              </div>
            </div>
          </section>

          {/* Footer note */}
          <div style={{ padding: '0 1.5rem 1.25rem', color: colors.gray600 }}>
            <small>Design inspired by Kerala MCP card layout. This is a digital adaptation for personal records.</small>
          </div>
        </div>
      </div>
    </MaternityLayout>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.625rem 0.875rem',
  fontWeight: 700,
  color: '#6b7280',
  borderBottom: '1px solid #e5e7eb',
  fontSize: '0.875rem',
};

const tdStyle: React.CSSProperties = {
  padding: '0.625rem 0.875rem',
  color: '#1f2937',
  borderBottom: '1px solid #f3f4f6',
  fontSize: '0.95rem',
};

const tdEmptyStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: 'center',
  color: '#6b7280',
};

export default MCPCard;