import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { CircleNotch, CaretDown } from '@phosphor-icons/react';
import ResidentSearchDropdown from './ResidentSearchDropdown';

const PersonnelModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const defaultForm = {
    ResidentID: '',
    Position: 'Clerk',
    EmploymentType: 'Full-Time',
    createAccount: false,
    username: '',
    password: '',
    role: 'STAFF'
  };

  const [formData, setFormData] = useState(defaultForm);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        createAccount: false
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
      console.error('Failed to fetch residents', err);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    let processedValue = value;
    if (e.target.name === 'username') {
      processedValue = value.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 20);
    } else if (e.target.name === 'password') {
      if (typeof value === 'string') processedValue = value.slice(0, 64);
    }
    
    if (typeof value === 'string' && processedValue !== value) {
      e.target.value = processedValue;
    }
    
    setFormData({ ...formData, [e.target.name]: processedValue });
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

    if (!initialData && formData.createAccount) {
      if (formData.username.length < 4) {
        setError('Username must be at least 4 characters.');
        setLoading(false);
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters.');
        setLoading(false);
        return;
      }
    }

    try {
      if (initialData) {
        await apiClient.patch(`/personnel/${initialData.PersonnelID}`, formData);
      } else {
        await apiClient.post('/personnel', formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${initialData ? 'update' : 'register'} personnel`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border-4 border-foreground w-full max-w-xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <header className="bg-foreground text-background p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-widest">{initialData ? 'Edit' : 'Register'} Staff</h2>
          <button type="button" onClick={onClose} className="text-background hover:text-red-400 font-bold text-xl">X</button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          {error && <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-bold">{error}</div>}
          
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm uppercase tracking-wider">Select Resident *</label>
            <ResidentSearchDropdown 
              residents={residents} 
              value={formData.ResidentID} 
              onChange={(val) => setFormData({ ...formData, ResidentID: val })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm uppercase tracking-wider">Position *</label>
              <div className="relative w-full">
                <select required name="Position" value={formData.Position} onChange={handleChange} className="appearance-none w-full border-2 border-foreground p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all bg-background cursor-pointer">
                  <option value="Clerk">Clerk</option>
                  <option value="Kagawad">Kagawad</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Tanod">Tanod</option>
                  <option value="IT Administrator">IT Administrator</option>
                  <option value="Barangay Captain">Barangay Captain</option>
                  <option value="SK Chairman">SK Chairman</option>
                </select>
                <CaretDown size={20} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm uppercase tracking-wider">Type *</label>
              <div className="relative w-full">
                <select required name="EmploymentType" value={formData.EmploymentType} onChange={handleChange} className="appearance-none w-full border-2 border-foreground p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all bg-background cursor-pointer">
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
                <CaretDown size={20} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
              </div>
            </div>
          </div>

          {!initialData && (
            <div className="border-t-2 border-foreground pt-6 mt-2">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input type="checkbox" name="createAccount" checked={formData.createAccount} onChange={handleChange} className="w-6 h-6 border-2 border-foreground accent-foreground" />
                <span className="font-black uppercase tracking-widest">Generate System Login</span>
              </label>

              {formData.createAccount && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border-2 border-foreground bg-muted">
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm uppercase tracking-wider">Username *</label>
                    <input required name="username" value={formData.username} onChange={handleChange} minLength={4} maxLength={20} className="border-2 border-foreground p-3 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm uppercase tracking-wider">Password *</label>
                    <input required type="password" name="password" value={formData.password} onChange={handleChange} minLength={8} maxLength={64} className="border-2 border-foreground p-3 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm uppercase tracking-wider">Role *</label>
                    <div className="relative w-full">
                      <select required name="role" value={formData.role} onChange={handleChange} className="appearance-none w-full border-2 border-foreground p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all cursor-pointer bg-background">
                        <option value="STAFF">STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <CaretDown size={20} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <footer className="mt-8 flex justify-end gap-4 border-t-2 border-border pt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 font-bold border-2 border-foreground hover:bg-muted transition-colors uppercase tracking-wider">
              Cancel
            </button>
            <button type="submit" disabled={loading || residents.length === 0} className="bg-foreground text-background px-8 py-3 font-bold hover:bg-accent transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center gap-2">
              {loading && <CircleNotch className="animate-spin" size={20} weight="bold" />}
              {loading ? 'Processing...' : (initialData ? 'Save Changes' : 'Register Staff')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default PersonnelModal;
