import React, { useState } from 'react';
import MaternityLayout from './MaternityLayout';
import { useAuth } from '../../context/AuthContext';
import { supplyAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface Supply {
  name: string;
  description: string;
  eligibility: string;
}

const SupplyRequests: React.FC = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const maternalSupplies: Supply[] = [
    {
      name: 'Amrutham Podi',
      description: 'Nutritional supplement powder for mothers and children',
      eligibility: 'Available for maternal and child health programs'
    },
    {
      name: 'Baby kits',
      description: 'Essential newborn care kit including clothes, diapers, and hygiene items',
      eligibility: 'For expecting mothers and newborns'
    },
    {
      name: 'Diapers',
      description: 'Disposable diapers for infants',
      eligibility: 'For maternal care and newborn hygiene'
    },
    {
      name: 'Iron tablets',
      description: 'Iron supplements to prevent anemia during pregnancy',
      eligibility: 'For pregnant women with low hemoglobin'
    },
    {
      name: 'Folic Acid Tablets',
      description: 'Essential vitamin supplement for fetal development',
      eligibility: 'For pregnant women in first trimester'
    },
    {
      name: 'Calcium Tablets',
      description: 'Calcium supplements for bone health during pregnancy',
      eligibility: 'For pregnant women and nursing mothers'
    },
    {
      name: 'ORS Packets & Zinc Tablets',
      description: 'Oral rehydration solution and zinc supplements for dehydration and immunity',
      eligibility: 'For maternal and child health emergencies'
    },
    {
      name: 'Thermal Blanket for Newborns',
      description: 'Specialized blanket to maintain newborn body temperature',
      eligibility: 'For newborn care in delivery and postpartum'
    }
  ];

  const palliativeSupplies: Supply[] = [
    {
      name: 'Adult diapers',
      description: 'Adult incontinence products',
      eligibility: 'For palliative care patients with mobility issues'
    },
    {
      name: 'Water beds',
      description: 'Pressure-relieving mattresses for bedridden patients',
      eligibility: 'For patients with pressure sores or long-term bed rest'
    },
    {
      name: 'Tablets',
      description: 'Prescribed medications for pain management and treatment',
      eligibility: 'As per medical prescription for palliative care'
    },
    {
      name: 'Wheelchairs',
      description: 'Manual or powered wheelchairs for mobility assistance',
      eligibility: 'For patients with severe mobility limitations'
    },
    {
      name: 'Walking sticks',
      description: 'Supportive walking aids for balance and stability',
      eligibility: 'For patients with walking difficulties'
    },
    {
      name: 'Adjustable Hospital Bed',
      description: 'Hospital-grade bed with adjustable positions',
      eligibility: 'For home care of bedridden palliative patients'
    },
    {
      name: 'Crutches / Walkers',
      description: 'Mobility aids for support during walking',
      eligibility: 'For patients requiring walking assistance'
    },
    {
      name: 'BP Monitor & Glucometer Kits',
      description: 'Blood pressure monitor and glucose testing kit',
      eligibility: 'For monitoring vital signs in palliative care'
    },
    {
      name: 'Urine Bags',
      description: 'Urinary collection bags for incontinence management',
      eligibility: 'For patients with urinary incontinence'
    }
  ];

  const supplies = user?.beneficiaryCategory === 'maternity' ? maternalSupplies : palliativeSupplies;

  const handleRequestClick = (supply: Supply) => {
    setSelectedSupply(supply);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedSupply || !description.trim()) {
      toast.error('Please provide a description of your medical need');
      return;
    }

    if (!file) {
      toast.error('Please upload proof (medical certificate or prescription)');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('supplyName', selectedSupply.name);
      formData.append('description', description);
      formData.append('proof', file);
      formData.append('category', user?.beneficiaryCategory || '');

      await supplyAPI.submitRequest(formData);
      toast.success('Supply request submitted successfully!');
      setModalOpen(false);
      setDescription('');
      setFile(null);
      setSelectedSupply(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MaternityLayout title="Supply Requests">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Request Supplies</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            Request essential supplies for {user?.beneficiaryCategory === 'maternity' ? 'maternal and child health' : 'palliative care'}.
            Select from the available supplies below and submit your request with necessary documentation.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {supplies.map((supply, index) => (
              <div key={index} className="card" style={{ margin: 0 }}>
                <div className="card-header">
                  <h3 className="card-title" style={{ fontSize: '1rem' }}>{supply.name}</h3>
                </div>
                <div className="card-content">
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                    {supply.description}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--blue-600)', marginBottom: '1rem' }}>
                    <strong>Eligibility:</strong> {supply.eligibility}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleRequestClick(supply)}
                    style={{ width: '100%' }}
                  >
                    Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalOpen && selectedSupply && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', background: 'white', padding: '1rem', border: '1px solid var(--gray-200)' }}>
            <div className="card-header">
              <h3 className="card-title">Request {selectedSupply.name}</h3>
            </div>
            <div className="card-content" style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Upload Proof (Medical Certificate/Prescription)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Description of Medical Need
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe your medical condition and why you need this supply..."
                  rows={4}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn" onClick={() => setModalOpen(false)} disabled={loading}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading || !description.trim() || !file}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MaternityLayout>
  );
};

export default SupplyRequests;