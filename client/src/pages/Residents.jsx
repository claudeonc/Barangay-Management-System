import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import apiClient from '../api/client';
import ResidentModal from '../components/ResidentModal';
import { useDialog } from '../context/DialogContext';
import { PencilSimple, Trash, CircleNotch, CaretDown } from '@phosphor-icons/react';

const Residents = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterCivilStatus, setFilterCivilStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const tableContainerRef = useRef(null);
  const { confirm, alert } = useDialog();



  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/residents');
      setResidents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedResident(null);
    fetchResidents();
  };

  const handleEdit = (resident) => {
    setSelectedResident(resident);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm('Are you sure you want to delete this resident? This cannot be undone.');
    if (confirmed) {
      try {
        await apiClient.delete(`/residents/${id}`);
        fetchResidents();
      } catch (err) {
        await alert(err.response?.data?.error || 'Failed to delete resident. They may be linked to a household or personnel record.');
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await apiClient.post('/residents/bulk', results.data);
          await alert(res.data.message);
          fetchResidents();
        } catch (error) {
          await alert(error.response?.data?.error || 'Failed to upload CSV');
        } finally {
          setIsUploading(false);
          e.target.value = null; // reset input
        }
      },
      error: async (error) => {
        await alert('Error parsing CSV: ' + error.message);
        setIsUploading(false);
      }
    });
  };

  const filteredResidents = residents.filter(r => {
    const matchesSearch = `${r.FirstName} ${r.LastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || r.ResidentID.toString().includes(searchQuery);
    const matchesGender = filterGender ? r.Gender === filterGender : true;
    const matchesCivilStatus = filterCivilStatus ? r.CivilStatus === filterCivilStatus : true;
    return matchesSearch && matchesGender && matchesCivilStatus;
  });

  return (
    <div className="flex flex-col gap-12 w-full max-w-6xl mx-auto">
      <header className="flex justify-between items-end border-b-2 border-foreground pb-6">
        <div>
          <h2 className="text-5xl font-black tracking-tighter uppercase border-l-8 border-accent pl-6">
            Registry
          </h2>
          <p className="text-mutedForeground text-lg mt-4 font-medium">
            Manage the barangay resident population.
          </p>
        </div>
        <div className="flex gap-4">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="border-4 border-foreground text-foreground px-6 py-3 font-bold hover:bg-muted transition-colors flex items-center gap-2">
            {isUploading && <CircleNotch className="animate-spin" size={20} weight="bold" />}
            {isUploading ? 'UPLOADING...' : 'UPLOAD CSV'}
          </button>
          <button
            onClick={() => {
              setSelectedResident(null);
              setIsModalOpen(true);
            }}
            className="bg-foreground text-background px-6 py-3 font-bold hover:bg-accent hover:text-white transition-colors border-4 border-foreground">
            + NEW RESIDENT
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <input
          type="text"
          placeholder="Search by Name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border-4 border-foreground p-4 font-bold focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        />
        <div className="relative w-full md:w-56 flex-shrink-0">
          <select
            value={filterGender}
            onChange={e => setFilterGender(e.target.value)}
            className="appearance-none border-4 border-foreground p-4 pr-14 font-bold uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-background w-full cursor-pointer"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <CaretDown size={24} weight="bold" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
        </div>
        <div className="relative w-full md:w-72 flex-shrink-0">
          <select
            value={filterCivilStatus}
            onChange={e => setFilterCivilStatus(e.target.value)}
            className="appearance-none border-4 border-foreground p-4 pr-14 font-bold uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-background w-full cursor-pointer"
          >
            <option value="">All Civil Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Divorced">Divorced</option>
            <option value="Separated">Separated</option>
          </select>
          <CaretDown size={24} weight="bold" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-mutedForeground p-8">
          <CircleNotch className="animate-spin" size={32} weight="bold" />
          Loading Residents...
        </div>
      ) : (
        <div className="w-full border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-background overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-foreground text-background font-bold tracking-widest text-sm uppercase sticky top-0 z-10 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
              <tr>
                <th className="p-4 border-b-2 border-foreground">#</th>
                <th className="p-4 border-b-2 border-foreground">Name</th>
                <th className="p-4 border-b-2 border-foreground">Gender</th>
                <th className="p-4 border-b-2 border-foreground">Civil Status</th>
                <th className="p-4 border-b-2 border-foreground text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-mutedForeground font-bold uppercase tracking-widest">
                    No residents found.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((resident, index) => (
                  <tr key={resident.ResidentID} className="hover:bg-muted transition-colors font-medium border-b border-border last:border-b-0">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <span className="font-black text-xl">{index + 1}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-background text-foreground px-2 py-1 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hidden md:inline-block">
                          ID-{resident.ResidentID}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-bold">{resident.LastName}, {resident.FirstName}</td>
                    <td className="p-4">{resident.Gender}</td>
                    <td className="p-4">{resident.CivilStatus}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => handleEdit(resident)} className="text-foreground hover:text-accent p-2 transition-colors" title="Edit">
                        <PencilSimple size={20} weight="bold" />
                      </button>
                      <button onClick={() => handleDelete(resident.ResidentID)} className="text-red-600 hover:text-red-800 p-2 transition-colors" title="Delete">
                        <Trash size={20} weight="bold" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <ResidentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedResident(null);
        }}
        onSuccess={handleSuccess}
        initialData={selectedResident}
      />
    </div>
  );
};

export default Residents;
