import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { CircleNotch, CaretDown } from '@phosphor-icons/react';

const ResidentModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const defaultForm = {
    FirstName: '',
    LastName: '',
    Birthdate: '',
    Gender: 'Male',
    CivilStatus: 'Single',
    Occupation: '',
    ContactNo: ''
  };

  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        Birthdate: initialData.Birthdate ? new Date(initialData.Birthdate).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData(defaultForm);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    let { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'FirstName' || name === 'LastName') {
      processedValue = value.replace(/[^a-zA-ZñÑ\s\-\.']/g, '').slice(0, 50);
    } else if (name === 'ContactNo') {
      processedValue = value.replace(/\D/g, '').slice(0, 11);
    } else if (name === 'Occupation') {
      processedValue = value.replace(/[^a-zA-ZñÑ0-9\s\-\.,]/g, '').slice(0, 100);
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

    const birthDate = new Date(formData.Birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (birthDate > today) {
      setError('Birthdate cannot be in the future.');
      setLoading(false);
      return;
    }
    if (age > 150) {
      setError('Age cannot exceed 150 years.');
      setLoading(false);
      return;
    }

    try {
      if (initialData) {
        await apiClient.patch(`/residents/${initialData.ResidentID}`, formData);
      } else {
        await apiClient.post('/residents', formData);
      }
      onSuccess(); // Triggers table refresh and closes modal
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${initialData ? 'update' : 'create'} resident`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border-4 border-foreground w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <header className="bg-foreground text-background p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-widest">{initialData ? 'Edit' : 'Register'} Resident</h2>
          <button onClick={onClose} className="text-background hover:text-red-400 font-bold text-xl">X</button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          {error && <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-bold">{error}</div>}
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm uppercase tracking-wider">First Name *</label>
              <input required name="FirstName" value={formData.FirstName} onChange={handleChange} maxLength={50} className="border-2 border-foreground p-3 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm uppercase tracking-wider">Last Name *</label>
              <input required name="LastName" value={formData.LastName} onChange={handleChange} maxLength={50} className="border-2 border-foreground p-3 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm uppercase tracking-wider">Birthdate *</label>
              <input required type="date" name="Birthdate" max={new Date().toISOString().split('T')[0]} value={formData.Birthdate} onChange={handleChange} className="border-2 border-foreground p-3 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm uppercase tracking-wider">Gender *</label>
              <div className="relative w-full">
                <select name="Gender" value={formData.Gender} onChange={handleChange} className="appearance-none w-full border-2 border-foreground p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all bg-background cursor-pointer">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <CaretDown size={20} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm uppercase tracking-wider">Civil Status *</label>
              <div className="relative w-full">
                <select name="CivilStatus" value={formData.CivilStatus} onChange={handleChange} className="appearance-none w-full border-2 border-foreground p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all bg-background cursor-pointer">
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
                <CaretDown size={20} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm uppercase tracking-wider">Contact No</label>
              <input name="ContactNo" value={formData.ContactNo} onChange={handleChange} maxLength={11} placeholder="e.g. 09123456789" className="border-2 border-foreground p-3 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all" />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <label className="font-bold text-sm uppercase tracking-wider">Occupation</label>
              <input name="Occupation" value={formData.Occupation} onChange={handleChange} maxLength={100} className="border-2 border-foreground p-3 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all" />
            </div>
          </div>

          <footer className="mt-8 flex justify-end gap-4 border-t-2 border-border pt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 font-bold border-2 border-foreground hover:bg-muted transition-colors uppercase tracking-wider">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-foreground text-background px-8 py-3 font-bold hover:bg-accent transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center gap-2">
              {loading && <CircleNotch className="animate-spin" size={20} weight="bold" />}
              {loading ? 'Saving...' : 'Save Resident'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ResidentModal;
