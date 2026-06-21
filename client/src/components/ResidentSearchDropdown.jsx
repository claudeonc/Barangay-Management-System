import { useState, useEffect, useRef } from 'react';
import { CaretDown } from '@phosphor-icons/react';

const ResidentSearchDropdown = ({ residents, value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (value) {
      const resident = residents.find(r => r.ResidentID === value);
      if (resident) {
        setSearchTerm(`${resident.LastName}, ${resident.FirstName} (ID: ${resident.ResidentID})`);
      }
    } else {
      setSearchTerm('');
    }
  }, [value, residents]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // If they click outside and haven't selected a valid resident, clear the search term
        if (!value) {
          setSearchTerm('');
        } else {
          // Re-sync search term with the selected value
          const resident = residents.find(r => r.ResidentID === value);
          if (resident) {
            setSearchTerm(`${resident.LastName}, ${resident.FirstName} (ID: ${resident.ResidentID})`);
          }
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, residents]);

  const filteredResidents = residents.filter(r => 
    `${r.LastName}, ${r.FirstName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.ResidentID.toString() === searchTerm
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        className="border-2 border-foreground p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all w-full font-bold"
        placeholder="Type to search residents..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          // Only clear value if they actually changed the text
          if (value) onChange(''); 
        }}
        onFocus={() => setIsOpen(true)}
      />
      <CaretDown size={20} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
      
      {isOpen && (
        <ul className="absolute z-50 w-full mt-1 bg-background border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
          {filteredResidents.length > 0 ? (
            filteredResidents.map(r => (
              <li 
                key={r.ResidentID}
                className={`p-3 hover:bg-accent hover:text-white cursor-pointer font-bold border-b-2 border-foreground last:border-b-0 transition-colors ${value === r.ResidentID ? 'bg-muted' : ''}`}
                onClick={() => {
                  onChange(r.ResidentID);
                  setSearchTerm(`${r.LastName}, ${r.FirstName} (ID: ${r.ResidentID})`);
                  setIsOpen(false);
                }}
              >
                {r.LastName}, {r.FirstName} <span className="opacity-70 text-sm ml-2 font-normal">(ID: {r.ResidentID})</span>
              </li>
            ))
          ) : (
            <li className="p-4 text-mutedForeground font-bold uppercase tracking-widest text-center">No residents found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default ResidentSearchDropdown;
