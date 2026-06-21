import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import DocumentModal from '../components/DocumentModal';
import { Link } from 'react-router-dom';
import { useDialog } from '../context/DialogContext';
import { PencilSimple, Trash, Printer, CircleNotch, CaretDown } from '@phosphor-icons/react';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { confirm, alert } = useDialog();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
    fetchDocuments();
  };

  const handleEdit = (doc) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm('Are you sure you want to delete this document? This cannot be undone.');
    if (confirmed) {
      try {
        await apiClient.delete(`/documents/${id}`);
        fetchDocuments();
      } catch (err) {
        await alert(err.response?.data?.error || 'Failed to delete document.');
      }
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.DocumentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${doc.Resident?.FirstName} ${doc.Resident?.LastName}`.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || doc.Status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-12 w-full max-w-6xl mx-auto">
      <header className="flex justify-between items-end border-b-2 border-foreground pb-6">
        <div>
          <h2 className="text-5xl font-black tracking-tighter uppercase border-l-8 border-accent pl-6">
            Documents
          </h2>
          <p className="text-mutedForeground text-lg mt-4 font-medium">
            Issue and track barangay clearances and certificates.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedDocument(null);
            setIsModalOpen(true);
          }}
          className="bg-foreground text-background px-6 py-3 font-bold hover:bg-accent hover:text-white transition-colors">
          ISSUE DOCUMENT
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <input
          type="text"
          placeholder="Search by Resident Name or Document Type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border-4 border-foreground p-4 font-bold focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        />
        <div className="relative w-full md:w-72 flex-shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none border-4 border-foreground p-4 pr-14 font-bold uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-background w-full cursor-pointer">
            <option value="ALL">ALL STATUSES</option>
            <option value="PENDING">PENDING</option>
            <option value="RELEASED">RELEASED</option>
          </select>
          <CaretDown size={24} weight="bold" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-mutedForeground p-8">
          <CircleNotch className="animate-spin" size={32} weight="bold" />
          Loading Documents...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.length === 0 ? (
            <div className="col-span-full border-2 border-foreground p-8 text-center text-mutedForeground font-bold uppercase tracking-widest">
              No documents match your filters.
            </div>
          ) : (
            filteredDocuments.map((doc, index) => (
              <div key={doc.DocumentID} className="border-4 border-foreground p-6 flex flex-col gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-background">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <span className="text-sm font-black tracking-widest px-3 py-1 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-background">
                      #{index + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-background text-foreground px-2 py-1 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      ID-{doc.DocumentID}
                    </span>
                    <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest ${doc.Status === 'PENDING' ? 'bg-yellow-300 text-black border-2 border-black' : 'bg-foreground text-background'}`}>
                      {doc.Status}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-mutedForeground">
                    {new Date(doc.DateIssued).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black uppercase leading-tight mb-2">{doc.DocumentType}</h3>
                  <p className="text-sm font-bold uppercase text-mutedForeground tracking-widest">
                    {doc.Resident?.LastName}, {doc.Resident?.FirstName}
                  </p>
                </div>

                <div className="border-t-2 border-foreground pt-4 mt-auto">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1 text-mutedForeground">Purpose:</p>
                  <p className="text-sm font-bold truncate">{doc.Purpose}</p>
                </div>

                <div className="border-t-2 border-foreground pt-4 flex gap-2">
                  <button onClick={() => handleEdit(doc)} className="flex-[0.5] flex justify-center items-center bg-background border-2 border-foreground text-foreground px-2 py-2 hover:bg-muted transition-colors" title="Edit">
                    <PencilSimple size={20} weight="bold" />
                  </button>
                  <button onClick={() => handleDelete(doc.DocumentID)} className="flex-[0.5] flex justify-center items-center bg-red-600 border-2 border-red-600 text-white px-2 py-2 hover:bg-red-700 transition-colors" title="Delete">
                    <Trash size={20} weight="bold" />
                  </button>
                  <Link
                    to={`/admin/print/${doc.DocumentID}`}
                    target="_blank"
                    className="flex-1 flex justify-center items-center gap-2 bg-foreground border-2 border-foreground text-background px-2 py-2 font-black text-xs uppercase tracking-widest hover:bg-accent transition-colors" title="Print">
                    <Printer size={20} weight="bold" />
                    PRINT
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDocument(null);
        }}
        onSuccess={handleSuccess}
        initialData={selectedDocument}
      />
    </div>
  );
};

export default Documents;
