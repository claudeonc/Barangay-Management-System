import { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { CircleNotch, CaretDown } from '@phosphor-icons/react';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('ALL_TIME');
  const [roleFilter, setRoleFilter] = useState('ALL_ROLES');
  const currentUser = JSON.parse(localStorage.getItem('bms_user') || '{}');
  const tableContainerRef = useRef(null);

  useEffect(() => {
    const mainElement = document.querySelector('main');
    const tableContainer = tableContainerRef.current;
    if (!mainElement || !tableContainer) return;

    const handleWheel = (e) => {
      if (e.deltaY > 0) {
        const prev = mainElement.scrollTop;
        mainElement.scrollTop += e.deltaY;
        if (mainElement.scrollTop !== prev) {
          e.preventDefault();
        }
      } else if (e.deltaY < 0 && tableContainer.scrollTop <= 0) {
        const prev = mainElement.scrollTop;
        mainElement.scrollTop += e.deltaY;
        if (mainElement.scrollTop !== prev) {
          e.preventDefault();
        }
      }
    };

    tableContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => tableContainer.removeEventListener('wheel', handleWheel);
  }, [logs, activeTab, searchQuery, timeFilter, roleFilter]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await apiClient.get('/logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (activeTab === 'ME' && log.UserID !== currentUser.id) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const actionMatch = log.Action.toLowerCase().includes(q);
      const userMatch = log.User?.Username?.toLowerCase().includes(q) || log.User?.Role?.toLowerCase().includes(q);
      if (!actionMatch && !userMatch) return false;
    }

    if (timeFilter !== 'ALL_TIME') {
      const logDate = new Date(log.Timestamp);
      const now = new Date();
      if (timeFilter === 'TODAY') {
        if (logDate.toDateString() !== now.toDateString()) return false;
      } else if (timeFilter === 'THIS_WEEK') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        if (logDate < oneWeekAgo) return false;
      } else if (timeFilter === 'THIS_MONTH') {
        if (logDate.getMonth() !== now.getMonth() || logDate.getFullYear() !== now.getFullYear()) return false;
      }
    }

    if (roleFilter !== 'ALL_ROLES') {
      if (log.User?.Role !== roleFilter) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      <header className="flex justify-between items-end border-b-2 border-foreground pb-6">
        <div>
          <h2 className="text-5xl font-black tracking-tighter uppercase border-l-8 border-accent pl-6">
            Activity Logs
          </h2>
          <p className="text-mutedForeground text-lg mt-4 font-medium">
            System-wide audit trail of personnel actions.
          </p>
        </div>
        <button onClick={fetchLogs} className="bg-foreground text-background px-6 py-3 font-bold hover:bg-accent hover:text-white transition-colors">
          REFRESH
        </button>
      </header>

      <div className="flex flex-col gap-6">
        <div className="flex gap-4 border-b-2 border-border">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-6 py-3 font-bold tracking-widest uppercase border-b-4 -mb-[2px] transition-colors ${activeTab === 'ALL' ? 'border-foreground text-foreground' : 'border-transparent text-mutedForeground hover:text-foreground hover:border-foreground/30'}`}
          >
            System-Wide
          </button>
          <button
            onClick={() => setActiveTab('ME')}
            className={`px-6 py-3 font-bold tracking-widest uppercase border-b-4 -mb-[2px] transition-colors ${activeTab === 'ME' ? 'border-foreground text-foreground' : 'border-transparent text-mutedForeground hover:text-foreground hover:border-foreground/30'}`}
          >
            My Activity
          </button>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="SEARCH LOGS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-4 border-foreground p-4 font-bold uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
          <div className="relative w-64 flex-shrink-0">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none border-4 border-foreground p-4 pr-14 font-bold uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full cursor-pointer"
            >
              <option value="ALL_ROLES">ALL ROLES</option>
              <option value="ADMIN">ADMINS</option>
              <option value="CLERK">CLERKS</option>
            </select>
            <CaretDown size={24} weight="bold" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
          </div>
          <div className="relative w-72 flex-shrink-0">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none border-4 border-foreground p-4 pr-14 font-bold uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-accent/20 transition-all bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full cursor-pointer"
            >
              <option value="ALL_TIME">ALL TIME</option>
              <option value="TODAY">TODAY</option>
              <option value="THIS_WEEK">LAST 7 DAYS</option>
              <option value="THIS_MONTH">THIS MONTH</option>
            </select>
            <CaretDown size={24} weight="bold" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-mutedForeground p-8">
            <CircleNotch className="animate-spin" size={32} weight="bold" />
            Loading Logs...
          </div>
        ) : (
          <div ref={tableContainerRef} className="border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-background max-h-[60vh] relative overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-foreground text-background sticky top-0 z-10 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                <tr>
                  <th className="p-4 font-black uppercase tracking-widest border-b-2 border-background">Timestamp</th>
                  <th className="p-4 font-black uppercase tracking-widest border-b-2 border-background">User</th>
                  <th className="p-4 font-black uppercase tracking-widest border-b-2 border-background">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-mutedForeground font-bold uppercase tracking-widest">
                      No activity logs found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.LogID} className="border-b-2 border-border hover:bg-muted transition-colors">
                      <td className="p-4 font-bold whitespace-nowrap">
                        {new Date(log.Timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 font-semibold">
                        @{log.User?.Username} <span className="text-xs text-mutedForeground">({log.User?.Role})</span>
                      </td>
                      <td className="p-4 font-medium">{log.Action}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
