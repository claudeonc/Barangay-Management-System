import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import PersonnelModal from '../components/PersonnelModal';
import { useDialog } from '../context/DialogContext';
import { PencilSimple, Trash, CircleNotch } from '@phosphor-icons/react';

const Personnel = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('bms_user') || '{}');
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const { confirm, alert } = useDialog();

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/personnel');
      setPersonnel(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedPersonnel(null);
    fetchPersonnel();
  };

  const handleEdit = (p) => {
    setSelectedPersonnel(p);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm('Are you sure you want to delete this staff member? This cannot be undone.');
    if (confirmed) {
      try {
        await apiClient.delete(`/personnel/${id}`);
        fetchPersonnel();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete personnel.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-12 w-full max-w-6xl mx-auto">
      <header className="flex justify-between items-end border-b-2 border-foreground pb-6">
        <div>
          <h2 className="text-5xl font-black tracking-tighter uppercase border-l-8 border-accent pl-6">
            Personnel
          </h2>
          <p className="text-mutedForeground text-lg mt-4 font-medium">
            Manage barangay staff and system users.
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => {
              setSelectedPersonnel(null);
              setIsModalOpen(true);
            }}
            className="bg-foreground text-background px-6 py-3 font-bold hover:bg-accent hover:text-white transition-colors">
            + REGISTER STAFF
          </button>
        )}
      </header>

      {loading ? (
        <div className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-mutedForeground p-8">
          <CircleNotch className="animate-spin" size={32} weight="bold" />
          Loading Personnel...
        </div>
      ) : (
        <div className="border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-background overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-foreground text-background">
              <tr>
                <th className="p-4 font-black uppercase tracking-widest border-b-2 border-background">#</th>
                <th className="p-4 font-black uppercase tracking-widest border-b-2 border-background">Name</th>
                <th className="p-4 font-black uppercase tracking-widest border-b-2 border-background">Position</th>
                <th className="p-4 font-black uppercase tracking-widest border-b-2 border-background">Type</th>
                <th className="p-4 font-black uppercase tracking-widest border-b-2 border-background text-center">System Access</th>
                {isSuperAdmin && <th className="p-4 font-black uppercase tracking-widest border-b-2 border-background text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {personnel.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-mutedForeground font-bold uppercase tracking-widest">
                    No personnel registered yet.
                  </td>
                </tr>
              ) : (
                personnel.map((p, index) => (
                  <tr key={p.PersonnelID} className="border-b-2 border-border hover:bg-muted transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <span className="font-black text-xl">{index + 1}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-background text-foreground px-2 py-1 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hidden md:inline-block">
                          ID-{p.PersonnelID}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold uppercase">{p.Resident?.LastName}, {p.Resident?.FirstName}</td>
                    <td className="p-4 font-bold tracking-widest">{p.Position}</td>
                    <td className="p-4 text-sm text-mutedForeground font-semibold">{p.EmploymentType}</td>
                    <td className="p-4">
                      {p.Users && p.Users.length > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-sm text-green-700 bg-green-100 border border-green-700 px-2 py-1 inline-block w-max">
                            ACTIVE
                          </span>
                          <span className="text-xs font-semibold text-mutedForeground mt-1">
                            @{p.Users[0].Username} ({p.Users[0].Role})
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <span className="font-bold text-sm text-gray-500 bg-gray-100 border border-gray-400 px-2 py-1 inline-block">
                            NONE
                          </span>
                        </div>
                      )}
                    </td>
                    {isSuperAdmin && (
                      <td className="p-4 flex justify-center gap-2">
                        <button onClick={() => handleEdit(p)} className="text-foreground hover:text-accent p-2 transition-colors" title="Edit">
                          <PencilSimple size={20} weight="bold" />
                        </button>
                        <button onClick={() => handleDelete(p.PersonnelID)} className="text-red-600 hover:text-red-800 p-2 transition-colors" title="Delete">
                          <Trash size={20} weight="bold" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <PersonnelModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPersonnel(null);
        }}
        onSuccess={handleSuccess}
        initialData={selectedPersonnel}
      />
    </div>
  );
};

export default Personnel;
