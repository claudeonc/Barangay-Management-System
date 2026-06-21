import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import HouseholdModal from '../components/HouseholdModal';
import { useDialog } from '../context/DialogContext';
import { PencilSimple, Trash, CircleNotch } from '@phosphor-icons/react';

const Households = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const { confirm, alert } = useDialog();

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const fetchHouseholds = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/households');
      setHouseholds(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedHousehold(null);
    fetchHouseholds();
  };

  const handleEdit = (hh) => {
    setSelectedHousehold(hh);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm('Are you sure you want to delete this household? This cannot be undone.');
    if (confirmed) {
      try {
        await apiClient.delete(`/households/${id}`);
        fetchHouseholds();
      } catch (err) {
        await alert(err.response?.data?.error || 'Failed to delete household. There may be residents linked to it.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-12 w-full max-w-6xl mx-auto">
      <header className="flex justify-between items-end border-b-2 border-foreground pb-6">
        <div>
          <h2 className="text-5xl font-black tracking-tighter uppercase border-l-8 border-accent pl-6">
            Households
          </h2>
          <p className="text-mutedForeground text-lg mt-4 font-medium">
            Manage families and zoning assignments.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedHousehold(null);
            setIsModalOpen(true);
          }}
          className="bg-foreground text-background px-6 py-3 font-bold hover:bg-accent hover:text-white transition-colors">
          + NEW HOUSEHOLD
        </button>
      </header>

      {loading ? (
        <div className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-mutedForeground p-8">
          <CircleNotch className="animate-spin" size={32} weight="bold" />
          Loading Households...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {households.length === 0 ? (
            <div className="col-span-full border-2 border-foreground p-8 text-center text-mutedForeground font-semibold italic">
              No households registered yet.
            </div>
          ) : (
            households.map((hh, index) => (
              <div key={hh.HouseholdID} className="border-2 border-foreground p-6 flex flex-col gap-4 hover:bg-muted transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <span className="bg-foreground text-background px-3 py-1 text-sm font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      #{index + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-background text-foreground px-2 py-1 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      ID-{hh.HouseholdID}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Family {hh.HeadResident?.LastName}</h3>
                  <p className="text-mutedForeground text-sm mt-1">Head: {hh.HeadResident?.FirstName} {hh.HeadResident?.LastName}</p>
                </div>
                <div className="border-t-2 border-foreground pt-4 mt-auto">
                  <p className="text-sm font-semibold truncate uppercase tracking-widest">{hh.HouseNo} {hh.Street}</p>
                  <p className="text-sm text-mutedForeground truncate">{hh.SubVillage}</p>
                </div>
                <div className="border-t-2 border-foreground pt-4 flex gap-2">
                  <button onClick={() => handleEdit(hh)} className="flex-1 flex justify-center items-center bg-background border-2 border-foreground text-foreground px-4 py-2 hover:bg-muted transition-colors" title="Edit">
                    <PencilSimple size={20} weight="bold" />
                  </button>
                  <button onClick={() => handleDelete(hh.HouseholdID)} className="flex-1 flex justify-center items-center bg-red-600 border-2 border-red-600 text-white px-4 py-2 hover:bg-red-700 transition-colors" title="Delete">
                    <Trash size={20} weight="bold" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      <HouseholdModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHousehold(null);
        }}
        onSuccess={handleSuccess}
        initialData={selectedHousehold}
      />
    </div>
  );
};

export default Households;
