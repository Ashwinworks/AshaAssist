import React, { useEffect, useMemo, useRef, useState } from 'react';
import PalliativeLayout from './PalliativeLayout';
import {
  Activity,
  FileText,
  Image as ImageIcon,
  UploadCloud,
  Calendar as CalendarIcon,
  Stethoscope,
  HeartPulse,
  Thermometer,
  Droplets,
  Syringe,
  Search,
  Filter,
  Trash2,
  Plus,
  Eye
} from 'lucide-react';
import { palliativeAPI } from '../../services/api';

// Types for records stored locally for now (backend hookup-ready)
interface AttachmentPreview {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'other';
  url: string; // object URL for preview
}

type TestType =
  | 'Blood Pressure'
  | 'Random Blood Sugar'
  | 'Fasting Blood Sugar'
  | 'Postprandial Blood Sugar'
  | 'HbA1c'
  | 'Cholesterol Profile'
  | 'Serum Creatinine'
  | 'Urea'
  | 'Electrolytes (Na/K)'
  | 'Liver Function Test'
  | 'ECG'
  | 'SpO2'
  | 'Pulse Rate'
  | 'Body Temperature'
  | 'Weight/BMI'
  | 'Urine Routine'
;

interface PalliativeRecord {
  id: string;
  date: string; // ISO date
  testType: TestType;
  // Dynamic fields by test
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  value?: number;
  unit?: string;
  subvalues?: Record<string, string | number>; // e.g., LDL/HDL/TG
  notes?: string;
  attachments?: AttachmentPreview[];
}

const TEST_OPTIONS: TestType[] = [
  'Blood Pressure',
  'Random Blood Sugar',
  'Fasting Blood Sugar',
  'Postprandial Blood Sugar',
  'HbA1c',
  'Cholesterol Profile',
  'Serum Creatinine',
  'Urea',
  'Electrolytes (Na/K)',
  'Liver Function Test',
  'ECG',
  'SpO2',
  'Pulse Rate',
  'Body Temperature',
  'Weight/BMI',
  'Urine Routine',
];

const LOCAL_KEY = 'palliative_records_v1';

const iconForTest = (test: TestType) => {
  switch (test) {
    case 'Blood Pressure':
      return <HeartPulse size={16} color="var(--red-600)" />;
    case 'Random Blood Sugar':
    case 'Fasting Blood Sugar':
    case 'Postprandial Blood Sugar':
    case 'HbA1c':
      return <Droplets size={16} color="var(--purple-700)" />;
    case 'Cholesterol Profile':
      return <Syringe size={16} color="var(--blue-700)" />;
    case 'Serum Creatinine':
    case 'Urea':
    case 'Electrolytes (Na/K)':
      return <Stethoscope size={16} color="var(--emerald-700)" />;
    case 'Liver Function Test':
      return <Stethoscope size={16} color="var(--amber-700)" />;
    case 'ECG':
      return <Activity size={16} color="var(--rose-600)" />;
    case 'SpO2':
      return <Activity size={16} color="var(--blue-600)" />;
    case 'Pulse Rate':
      return <Activity size={16} color="var(--indigo-600)" />;
    case 'Body Temperature':
      return <Thermometer size={16} color="var(--orange-600)" />;
    case 'Weight/BMI':
      return <Thermometer size={16} color="var(--teal-700)" />;
    case 'Urine Routine':
      return <Stethoscope size={16} color="var(--cyan-700)" />;
    default:
      return <Stethoscope size={16} />;
  }
};

const unitSuggestion = (test: TestType): string => {
  switch (test) {
    case 'Blood Pressure':
      return 'mmHg';
    case 'HbA1c':
      return '%';
    case 'Random Blood Sugar':
    case 'Fasting Blood Sugar':
    case 'Postprandial Blood Sugar':
      return 'mg/dL';
    case 'Cholesterol Profile':
      return 'mg/dL';
    case 'Serum Creatinine':
      return 'mg/dL';
    case 'Urea':
      return 'mg/dL';
    case 'Electrolytes (Na/K)':
      return 'mEq/L';
    case 'SpO2':
      return '%';
    case 'Pulse Rate':
      return 'bpm';
    case 'Body Temperature':
      return '°C';
    case 'Weight/BMI':
      return 'kg / kg/m²';
    default:
      return '';
  }
};

const HealthRecords: React.FC = () => {
  const [records, setRecords] = useState<PalliativeRecord[]>([]);
  const [testType, setTestType] = useState<TestType>('Blood Pressure');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [pulse, setPulse] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [subvalues, setSubvalues] = useState<Record<string, string>>({ LDL: '', HDL: '', TG: '', Total: '' });
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  // Keep original files to actually upload to backend
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [q, setQ] = useState('');
  const [filterTest, setFilterTest] = useState<'all' | TestType>('all');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Load from backend
    (async () => {
      try {
        const { records } = await palliativeAPI.listRecords();
        setRecords(records as any);
      } catch (e) {
        // fallback from local for offline/dev
        try {
          const raw = localStorage.getItem(LOCAL_KEY);
          if (raw) setRecords(JSON.parse(raw));
        } catch {}
      }
    })();
  }, []);

  useEffect(() => {
    // Keep local backup in case offline
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(records)); } catch {}
  }, [records]);

  useEffect(() => {
    setUnit(unitSuggestion(testType));
  }, [testType]);

  const filtered = useMemo(() => {
    return records
      .filter((r) => (filterTest === 'all' ? true : r.testType === filterTest))
      .filter((r) => {
        if (!q.trim()) return true;
        const text = `${r.testType} ${r.notes || ''}`.toLowerCase();
        return text.includes(q.toLowerCase());
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [records, filterTest, q]);

  const resetForm = () => {
    setTestType('Blood Pressure');
    setDate(new Date().toISOString().slice(0, 10));
    setSystolic('');
    setDiastolic('');
    setPulse('');
    setValue('');
    setUnit(unitSuggestion('Blood Pressure'));
    setNotes('');
    setSubvalues({ LDL: '', HDL: '', TG: '', Total: '' });
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const items: AttachmentPreview[] = [];
    const originals: File[] = [];
    Array.from(files).forEach((f) => {
      const ext = f.name.toLowerCase();
      let type: AttachmentPreview['type'] = 'other';
      if (f.type.startsWith('image/')) type = 'image';
      else if (ext.endsWith('.pdf') || f.type === 'application/pdf') type = 'pdf';
      const url = URL.createObjectURL(f);
      items.push({ id: Math.random().toString(36).slice(2), name: f.name, type, url });
      originals.push(f);
    });
    setAttachments((prev) => [...prev, ...items]);
    setSelectedFiles((prev) => [...prev, ...originals]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const addRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validations
    if (!date) {
      alert('Please select a date');
      return;
    }

    const payload: any = { date, testType, notes: notes.trim() || undefined };

    if (testType === 'Blood Pressure') {
      const sys = Number(systolic);
      const dia = Number(diastolic);
      if (!sys || !dia) {
        alert('Please enter both systolic and diastolic values');
        return;
      }
      payload.systolic = sys;
      payload.diastolic = dia;
      if (pulse) payload.pulse = Number(pulse);
      payload.unit = 'mmHg';
    } else if (testType === 'Cholesterol Profile') {
      const clean: Record<string, string | number> = {};
      Object.entries(subvalues).forEach(([k, v]) => {
        if (v && v.trim()) clean[k] = Number(v);
      });
      if (Object.keys(clean).length === 0 && !value) {
        alert('Please enter at least one cholesterol value (LDL/HDL/TG/Total) or a main value');
        return;
      }
      if (value) {
        payload.value = Number(value);
        payload.unit = 'mg/dL';
      }
      if (Object.keys(clean).length) payload.subvalues = clean;
    } else if (
      testType === 'Random Blood Sugar' ||
      testType === 'Fasting Blood Sugar' ||
      testType === 'Postprandial Blood Sugar' ||
      testType === 'Serum Creatinine' ||
      testType === 'Urea' ||
      testType === 'HbA1c' ||
      testType === 'SpO2' ||
      testType === 'Pulse Rate' ||
      testType === 'Body Temperature'
    ) {
      if (!value) {
        alert('Please enter a value');
        return;
      }
      payload.value = Number(value);
      payload.unit = unit || unitSuggestion(testType);
    } else if (testType === 'Electrolytes (Na/K)') {
      const clean: Record<string, string | number> = {};
      const na = subvalues['Na'];
      const k = subvalues['K'];
      if (!na && !k && !value) {
        alert('Please enter Sodium (Na) and/or Potassium (K)');
        return;
      }
      if (na) clean['Na'] = Number(na);
      if (k) clean['K'] = Number(k);
      if (value) payload.value = Number(value);
      payload.subvalues = clean;
      payload.unit = 'mEq/L';
    } else {
      // ECG, LFT, Urine Routine, Weight/BMI
      if (value) payload.value = Number(value);
      if (unit) payload.unit = unit;
    }

    try {
      // If files selected, send multipart with actual files
      if (selectedFiles.length > 0) {
        const form = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) form.append(k, String(v));
        });
        if (payload.subvalues) {
          Object.entries(payload.subvalues).forEach(([k, v]) => form.append(`subvalues[${k}]`, String(v)));
        }
        // append files
        selectedFiles.forEach((file) => {
          form.append('files', file);
        });
        await palliativeAPI.createRecord(form);
      } else if (attachments.length > 0) {
        // previews exist but no original files retained — save metadata-only
        await palliativeAPI.createRecord(payload);
      } else {
        await palliativeAPI.createRecord(payload);
      }
      // Refresh list
      const { records } = await palliativeAPI.listRecords();
      setRecords(records as any);
      resetForm();
      setSelectedFiles([]);
    } catch (err) {
      alert('Failed to save record');
    }
  };

  const deleteRecord = async (id: string) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await palliativeAPI.deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert('Failed to delete record');
    }
  };

  const renderAttachment = (a: AttachmentPreview) => (
    <div key={a.id} className="card" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {a.type === 'image' ? (
        <img src={a.url} alt={a.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--gray-200)' }} />
      ) : a.type === 'pdf' ? (
        <FileText size={20} color="var(--red-600)" />
      ) : (
        <ImageIcon size={20} color="var(--gray-600)" />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--gray-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
      </div>
      <a className="btn" href={a.url} target="_blank" rel="noreferrer" style={{ background: 'var(--gray-100)', border: '1px solid var(--gray-300)', color: 'var(--gray-800)', padding: '0.35rem 0.5rem' }}>
        <Eye size={16} />
      </a>
      <button className="btn" onClick={() => removeAttachment(a.id)} style={{ background: '#dc2626', border: 'none', color: '#fff', padding: '0.35rem 0.5rem' }}>
        <Trash2 size={16} />
      </button>
    </div>
  );

  const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span style={{ background: 'var(--gray-100)', color: 'var(--gray-700)', padding: '0.15rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600 }}>{children}</span>
  );

  const fmt = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <PalliativeLayout title="Health Records">
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope size={20} color="var(--blue-600)" />
            Palliative Health Records
          </h2>
          <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Securely store your lab results and vitals</div>
        </div>
        <div className="card-content" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <form onSubmit={(e) => { e.preventDefault(); setQ(q); }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1, minWidth: 280 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', top: 10, left: 10, color: 'var(--gray-500)' }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search notes or test name"
                style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', border: '1px solid var(--gray-300)', borderRadius: '0.375rem', outline: 'none' }}
              />
            </div>
          </form>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} color="var(--gray-600)" />
            <select
              value={filterTest}
              onChange={(e) => setFilterTest((e.target.value as any) || 'all')}
              style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: '0.375rem' }}
            >
              <option value="all">All Tests</option>
              {TEST_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Record */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} color="var(--green-700)" />
            Add New Record
          </h3>
          <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>You can attach PDFs or images</div>
        </div>
        <div className="card-content">
          <form onSubmit={addRecord} style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div>
                <label style={labelStyle}>Test Type</label>
                <select value={testType} onChange={(e) => setTestType(e.target.value as TestType)} style={inputStyle}>
                  {TEST_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <div style={{ position: 'relative' }}>
                  <CalendarIcon size={16} style={{ position: 'absolute', top: 12, left: 10, color: 'var(--gray-500)' }} />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, paddingLeft: '2rem' }} />
                </div>
              </div>

              {testType === 'Blood Pressure' && (
                <>
                  <div>
                    <label style={labelStyle}>Systolic (mmHg)</label>
                    <input type="number" placeholder="e.g., 120" value={systolic} onChange={(e) => setSystolic(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Diastolic (mmHg)</label>
                    <input type="number" placeholder="e.g., 80" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Pulse (bpm) — optional</label>
                    <input type="number" placeholder="e.g., 72" value={pulse} onChange={(e) => setPulse(e.target.value)} style={inputStyle} />
                  </div>
                </>
              )}

              {testType === 'Cholesterol Profile' && (
                <>
                  <div>
                    <label style={labelStyle}>LDL (mg/dL)</label>
                    <input type="number" value={subvalues.LDL} onChange={(e) => setSubvalues((p) => ({ ...p, LDL: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>HDL (mg/dL)</label>
                    <input type="number" value={subvalues.HDL} onChange={(e) => setSubvalues((p) => ({ ...p, HDL: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Triglycerides (mg/dL)</label>
                    <input type="number" value={subvalues.TG} onChange={(e) => setSubvalues((p) => ({ ...p, TG: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Total Cholesterol (mg/dL)</label>
                    <input type="number" value={subvalues.Total} onChange={(e) => setSubvalues((p) => ({ ...p, Total: e.target.value }))} style={inputStyle} />
                  </div>
                </>
              )}

              {testType === 'Electrolytes (Na/K)' && (
                <>
                  <div>
                    <label style={labelStyle}>Sodium Na (mEq/L)</label>
                    <input type="number" value={subvalues.Na || ''} onChange={(e) => setSubvalues((p) => ({ ...p, Na: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Potassium K (mEq/L)</label>
                    <input type="number" value={subvalues.K || ''} onChange={(e) => setSubvalues((p) => ({ ...p, K: e.target.value }))} style={inputStyle} />
                  </div>
                </>
              )}

              {/* Generic value/unit input for many tests */}
              {![
                'Blood Pressure',
                'Cholesterol Profile',
                'Electrolytes (Na/K)'
              ].includes(testType) && (
                <>
                  <div>
                    <label style={labelStyle}>Value</label>
                    <input type="number" placeholder="Enter value" value={value} onChange={(e) => setValue(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Unit</label>
                    <input type="text" placeholder={unitSuggestion(testType)} value={unit} onChange={(e) => setUnit(e.target.value)} style={inputStyle} />
                  </div>
                </>
              )}
            </div>

            <div>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea placeholder="Add any remarks" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...inputStyle, minHeight: 80 }} />
            </div>

            {/* Attachments */}
            <div className="card" style={{ background: 'var(--gray-50)' }}>
              <div className="card-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      onChange={(e) => onFilesSelected(e.target.files)}
                      style={{ display: 'none' }}
                    />
                    <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--blue-600)', color: 'white', border: 'none', padding: '0.5rem 0.75rem' }}>
                      <UploadCloud size={16} />
                      Upload PDF / Images
                    </button>
                    <div style={{ color: 'var(--gray-500)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                      Supported: PDF, JPG, PNG (multiple files)
                    </div>
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                    {attachments.map(renderAttachment)}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={resetForm} style={{ background: 'var(--gray-100)', color: 'var(--gray-800)', border: '1px solid var(--gray-300)', padding: '0.5rem 0.75rem' }}>Clear</button>
              <button type="submit" className="btn" style={{ background: 'var(--green-600)', color: 'white', border: 'none', padding: '0.5rem 0.75rem' }}>Save Record</button>
            </div>
          </form>
        </div>
      </div>

      {/* Records List */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope size={18} color="var(--blue-700)" />
            My Records
          </h3>
          <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total: {filtered.length}</div>
        </div>
        <div className="card-content" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-600)' }}>
              No records yet. Add your first record above.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                    <th style={th}>Date</th>
                    <th style={th}>Test</th>
                    <th style={th}>Result</th>
                    <th style={th}>Notes</th>
                    <th style={th}>Attachments</th>
                    <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={td}>{fmt(r.date)}</td>
                      <td style={td}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {iconForTest(r.testType)}
                          <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{r.testType}</span>
                        </div>
                      </td>
                      <td style={td}>
                        {/* Render result nicely */}
                        {r.testType === 'Blood Pressure' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <Badge>{r.systolic}/{r.diastolic} mmHg</Badge>
                            {r.pulse ? <Badge>Pulse {r.pulse} bpm</Badge> : null}
                          </div>
                        )}
                        {r.testType === 'Cholesterol Profile' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {r.subvalues?.LDL !== undefined && <Badge>LDL {r.subvalues.LDL} mg/dL</Badge>}
                            {r.subvalues?.HDL !== undefined && <Badge>HDL {r.subvalues.HDL} mg/dL</Badge>}
                            {r.subvalues?.TG !== undefined && <Badge>TG {r.subvalues.TG} mg/dL</Badge>}
                            {r.subvalues?.Total !== undefined && <Badge>Total {r.subvalues.Total} mg/dL</Badge>}
                            {r.value !== undefined && <Badge>Value {r.value} {r.unit || ''}</Badge>}
                          </div>
                        )}
                        {r.testType === 'Electrolytes (Na/K)' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {r.subvalues?.Na !== undefined && <Badge>Na {r.subvalues.Na} mEq/L</Badge>}
                            {r.subvalues?.K !== undefined && <Badge>K {r.subvalues.K} mEq/L</Badge>}
                            {r.value !== undefined && <Badge>Value {r.value}</Badge>}
                          </div>
                        )}
                        {![
                          'Blood Pressure',
                          'Cholesterol Profile',
                          'Electrolytes (Na/K)'
                        ].includes(r.testType) && (
                          r.value !== undefined ? (
                            <Badge>
                              {r.value} {r.unit}
                            </Badge>
                          ) : (
                            <span style={{ color: 'var(--gray-500)' }}>—</span>
                          )
                        )}
                      </td>
                      <td style={td}>
                        {r.notes ? (
                          <span style={{ color: 'var(--gray-700)' }}>{r.notes}</span>
                        ) : (
                          <span style={{ color: 'var(--gray-400)' }}>—</span>
                        )}
                      </td>
                      <td style={td}>
                        {r.attachments && r.attachments.length > 0 ? (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {r.attachments.map((a) => (
                              <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="btn"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'var(--gray-100)', color: 'var(--gray-800)', border: '1px solid var(--gray-300)', padding: '0.25rem 0.5rem' }}>
                                {a.type === 'image' ? <ImageIcon size={14} /> : <FileText size={14} />}
                                <span style={{ fontSize: '0.75rem', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--gray-400)' }}>—</span>
                        )}
                      </td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <button className="btn" onClick={() => deleteRecord(r.id)} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 500 }}>
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PalliativeLayout>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  color: 'var(--gray-700)'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--gray-300)',
  borderRadius: '0.375rem',
  outline: 'none'
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.75rem 1rem',
  color: 'var(--gray-600)',
  fontWeight: 600,
  fontSize: '0.875rem'
};

const td: React.CSSProperties = {
  padding: '0.75rem 1rem',
  color: 'var(--gray-800)',
  verticalAlign: 'top'
};

export default HealthRecords;