import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { CircleNotch } from '@phosphor-icons/react';
import ResidentSearchDropdown from './ResidentSearchDropdown';

const HouseholdModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const defaultForm = {
    HouseNo: '',
    Street: '',
    SubVillage: '',
    HeadOfFamily: ''
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
      if (res.data.length > 0 && !formData.HeadOfFamily) {
        setFormData(prev => ({ ...prev, HeadOfFamily: res.data[0].ResidentID }));
      }
    } catch (err) {
      console.error('Failed to fetch residents', err);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    let { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'HouseNo') {
      processedValue = value.replace(/[^a-zA-Z0-9\-]/g, '').slice(0, 20);
    } else if (name === 'Street') {
      processedValue = value.replace(/[^a-zA-Z0-9\s\-\.]/g, '').slice(0, 100);
    } else if (name === 'SubVillage') {
      processedValue = value.replace(/[^a-zA-Z0-9\s\-]/g, '').slice(0, 100);
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

    if (!formData.HeadOfFamily) {
      setError('Please search and select a Head of Family.');
      setLoading(false);
      return;
    }

    try {
      if (initialData) {
        await apiClient.patch(`/households/${initialData.HouseholdID}`, formData);
      } else {
        await apiClient.post('/households', formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${initialData ? 'update' : 'register'} household`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border-4 border-foreground w-full max-w-xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <header className="bg-foreground text-background p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-widest">{initialData ? 'Edit' : 'Register'} Household</h2>
          <button type="button" onClick={onClose} className="text-background hover:text-red-400 font-bold text-xl">X</button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          {error && <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-bold">{error}</div>}
          
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 flex flex-col gap-2">
              <label className="font-bold text-sm uppercase tracking-wider">Head of Family *</label>
              <ResidentSearchDropdown 
                residents={residents} 
                value={formData.HeadOfFamily} 
                onChange={(val) => setFormData({ ...formData, HeadOfFamily: val })} 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm uppercase tracking-wider">House No *</label>
              <input required name="HouseNo" value={formData.HouseNo} onChange={handleChange} maxLength={20} className="border-2 border-foreground p-3 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm uppercase tracking-wider">Street *</label>
              <input required name="Street" value={formData.Street} onChange={handleChange} maxLength={100} className="border-2 border-foreground p-3 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all" />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <label className="font-bold text-sm uppercase tracking-wider">Sub-Village / Zone *</label>
              <input required name="SubVillage" value={formData.SubVillage} onChange={handleChange} maxLength={100} className="border-2 border-foreground p-3 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all" />
            </div>
          </div>

          <footer className="mt-8 flex justify-end gap-4 border-t-2 border-border pt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 font-bold border-2 border-foreground hover:bg-muted transition-colors uppercase tracking-wider">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-foreground text-background px-8 py-3 font-bold hover:bg-accent transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center gap-2">
              {loading && <CircleNotch className="animate-spin" size={20} weight="bold" />}
              {loading ? 'Saving...' : 'Save Household'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default HouseholdModal;
