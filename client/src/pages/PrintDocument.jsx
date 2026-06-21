import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const PrintDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await apiClient.get(`/documents/${id}`);
        setDoc(res.data);
      } catch (err) {
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (loading) return <div className="p-8 text-xl font-bold">Loading document...</div>;
  if (error) return <div className="p-8 text-xl font-bold text-red-600">{error}</div>;
  if (!doc) return <div className="p-8 text-xl font-bold">Document not found</div>;

  const resident = doc.Resident;
  const household = resident.Household;
  const issuer = doc.Issuer;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-black min-h-screen p-8 flex flex-col items-center">
      {/* Hide this print action bar when actually printing via CSS */}
      <div className="w-full max-w-4xl flex justify-between mb-8 print:hidden">
        <button onClick={() => navigate(-1)} className="border-2 border-black px-4 py-2 font-bold hover:bg-gray-100">
          ← BACK
        </button>
        <button onClick={handlePrint} className="bg-black text-white px-8 py-2 font-black uppercase tracking-widest hover:bg-gray-800">
          PRINT
        </button>
      </div>

      {/* The Printable A4 Page Area */}
      <div className="w-full max-w-4xl border border-gray-300 p-16 shadow-lg print:border-none print:shadow-none print:p-0">
        <header className="text-center mb-12 border-b-4 border-black pb-8">
          <p className="uppercase tracking-widest text-sm font-bold">Republic of the Philippines</p>
          <p className="uppercase tracking-widest text-sm font-bold">Province of X, Municipality of Y</p>
          <h1 className="text-3xl font-black uppercase tracking-widest mt-4">Barangay Z</h1>
          <p className="text-lg font-bold mt-2">Office of the Punong Barangay</p>
        </header>

        <h2 className="text-4xl font-black text-center uppercase tracking-[0.2em] mb-16 underline underline-offset-8">
          {doc.DocumentType}
        </h2>

        <main className="text-lg leading-loose text-justify mb-24">
          <p className="mb-8"><strong>TO WHOM IT MAY CONCERN:</strong></p>
          
          <p className="indent-12 mb-6">
            This is to certify that <strong>{resident.FirstName} {resident.LastName}</strong>, 
            {resident.CivilStatus.toLowerCase()}, is a bona fide resident of 
            {household ? ` ${household.HouseNo} ${household.Street}, ${household.SubVillage}` : ' this barangay'}.
          </p>

          <p className="indent-12 mb-6">
            Based on the records of this office, the said individual is known to be of good moral character 
            and has no pending derogatory record or case filed against them as of this date.
          </p>

          <p className="indent-12 mb-6">
            This certification is being issued upon the request of the interested party for the purpose of:
            <br/>
            <span className="font-bold uppercase inline-block mt-4 border-b-2 border-black px-8">
              {doc.Purpose}
            </span>
          </p>

          <p className="indent-12 mb-6">
            Issued this <strong>{new Date(doc.DateIssued).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> at Barangay Z.
          </p>
        </main>

        <footer className="mt-32 grid grid-cols-2 gap-16">
          <div className="flex flex-col items-center">
            <div className="w-48 border-b-2 border-black text-center pb-2 mb-2 font-bold uppercase">
              {issuer.Resident.FirstName} {issuer.Resident.LastName}
            </div>
            <p className="text-sm tracking-widest uppercase">{issuer.Position}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-48 border-b-2 border-black text-center pb-2 mb-2 font-bold uppercase">
              Punong Barangay
            </div>
            <p className="text-sm tracking-widest uppercase">Barangay Captain</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PrintDocument;
