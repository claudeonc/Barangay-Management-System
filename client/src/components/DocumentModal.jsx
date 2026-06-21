import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { CircleNotch, CaretDown } from '@phosphor-icons/react';
import ResidentSearchDropdown from './ResidentSearchDropdown';

const DocumentModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const currentUser = JSON.parse(localStorage.getItem('bms_user') || '{}');
  const defaultForm = {
    ResidentID: '',
    DocumentType: 'Barangay Clearance',
    Purpose: '',
    Status: 'PENDING',
    IssuedBy: currentUser?.personnel?.PersonnelID || 1, 
  };

  const [formData, setFormData] = useState(defaultForm);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData
      });
    } else {
      setFormData(defaultForm);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchResidents();
    }
  }, [isOpen]);

  const fetchResidents = async () => {
    try {
      const res = await apiClient.get('/residents');
      setResidents(res.data);
      if (res.data.length > 0 && !formData.ResidentID) {
        setFormData(prev => ({ ...prev, ResidentID: res.data[0].ResidentID }));
      }
    } catch (err) {
      console.error('Failed to fetch residents for document form', err);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    let { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'Purpose') {
      processedValue = value.replace(/[^a-zA-Z0-9ñÑ\s\-\.,!?']/g, '').slice(0, 200);
    }

    if (processedValue !== value) {
      e.target.value = processedValue;
    }

    setFormData({ ...formData, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.ResidentID) {
      setError('Please search and select a resident.');
      setLoading(false);
      return;
    }

    try {
      if (initialData) {
        await apiClient.patch(`/documents/${initialData.DocumentID}`, formData);
      } else {
        await apiClient.post('/documents', formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${initialData ? 'update' : 'issue'} document`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border-4 border-foreground w-full max-w-xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <header className="bg-foreground text-background p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-widest">{initialData ? 'Edit' : 'Issue'} Document</h2>
          <button type="button" onClick={onClose} className="text-background hover:text-red-400 font-bold text-xl">X</button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          {error && <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-bold">{error}</div>}

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm uppercase tracking-wider">Resident *</label>
            <ResidentSearchDropdown 
              residents={residents} 
              value={formData.ResidentID} 
              onChange={(val) => setFormData({ ...formData, ResidentID: val })} 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm uppercase tracking-wider">Document Type *</label>
            <div className="relative w-full">
              <select required name="DocumentType" value={formData.DocumentType} onChange={handleChange} className="appearance-none w-full border-2 border-foreground p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all bg-background cursor-pointer">
                <option value="Barangay Clearance">Barangay Clearance</option>
                <option value="Certificate of Indigency">Certificate of Indigency</option>
                <option value="Business Clearance">Business Clearance</option>
                <option value="Certificate of Residency">Certificate of Residency</option>
              </select>
              <CaretDown size={20} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm uppercase tracking-wider">Purpose *</label>
            <input required name="Purpose" value={formData.Purpose} onChange={handleChange} maxLength={200} placeholder="e.g., Employment, Scholarship" className="border-2 border-foreground p-3 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm uppercase tracking-wider">Status *</label>
            <div className="relative w-full">
              <select required name="Status" value={formData.Status} onChange={handleChange} className="appearance-none w-full border-2 border-foreground p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all bg-background cursor-pointer">
                <option value="PENDING">Pending (For Signature)</option>
                <option value="RELEASED">Released</option>
              </select>
              <CaretDown size={20} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
            </div>
          </div>

          <footer className="mt-8 flex justify-end gap-4 border-t-2 border-border pt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 font-bold border-2 border-foreground hover:bg-muted transition-colors uppercase tracking-wider">
              Cancel
            </button>
            <button type="submit" disabled={loading || residents.length === 0} className="bg-foreground text-background px-8 py-3 font-bold hover:bg-accent transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center gap-2">
              {loading && <CircleNotch className="animate-spin" size={20} weight="bold" />}
              {loading ? 'Processing...' : (initialData ? 'Save Changes' : 'Issue Document')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default DocumentModal;
