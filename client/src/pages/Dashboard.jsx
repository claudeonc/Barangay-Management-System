import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { CircleNotch } from '@phosphor-icons/react';

const Dashboard = () => {
  const [stats, setStats] = useState({ residents: 0, households: 0, documents: 0 });
  const [logs, setLogs] = useState([]);
  const [demographics, setDemographics] = useState({ malePct: 0, femalePct: 0, civilStatus: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resRes, hhRes, docRes, logRes] = await Promise.all([
          apiClient.get('/residents').catch(() => ({ data: [] })),
          apiClient.get('/households').catch(() => ({ data: [] })),
          apiClient.get('/documents').catch(() => ({ data: [] })),
          apiClient.get('/logs').catch(() => ({ data: [] })),
        ]);
        
        const residents = resRes.data;
        const maleCount = residents.filter(r => r.Gender === 'Male').length;
        const femaleCount = residents.filter(r => r.Gender === 'Female').length;
        const total = residents.length || 1; // avoid division by zero

        setStats({
          residents: residents.length,
          households: hhRes.data.length,
          documents: docRes.data.length,
        });

        // Civil Status
        const civilStatusCounts = residents.reduce((acc, r) => {
          const status = r.CivilStatus || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        const civilStatus = Object.keys(civilStatusCounts)
          .map(status => ({
            status,
            pct: Math.round((civilStatusCounts[status] / total) * 100)
          }))
          .sort((a, b) => b.pct - a.pct);

        setDemographics({
          malePct: Math.round((maleCount / total) * 100),
          femalePct: Math.round((femaleCount / total) * 100),
          civilStatus
        });

        setLogs(logRes.data.slice(0, 5)); // Get top 5 recent logs
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-mutedForeground p-8">
      <CircleNotch className="animate-spin" size={32} weight="bold" />
      Loading Metrics...
    </div>
  );

  return (
    <div className="flex flex-col gap-12 w-full max-w-6xl mx-auto">
      <header>
        <h2 className="text-5xl font-black tracking-tighter uppercase border-l-8 border-accent pl-6">
          Dashboard
        </h2>
        <p className="text-mutedForeground text-lg mt-4 font-medium">
          System overview and current operational metrics.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Total Residents" value={stats.residents} />
        <StatCard title="Registered Households" value={stats.households} />
        <StatCard title="Documents Issued" value={stats.documents} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Demographics Widget */}
        <div className="border-4 border-foreground p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-background flex flex-col gap-8">
          <h3 className="text-2xl font-black uppercase tracking-widest border-b-2 border-foreground pb-4">Demographics</h3>
          
          {/* Sex */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-sm mb-4 text-mutedForeground">Sex</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="font-bold text-sm w-24 uppercase truncate">Male</span>
                <div className="flex-1 h-6 border-2 border-foreground bg-white">
                  <div className="bg-foreground h-full transition-all duration-1000 ease-out" style={{ width: `${demographics.malePct}%` }}></div>
                </div>
                <span className="font-bold text-sm w-12 text-right">{demographics.malePct}%</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-sm w-24 uppercase truncate">Female</span>
                <div className="flex-1 h-6 border-2 border-foreground bg-white">
                  <div className="bg-foreground h-full transition-all duration-1000 ease-out" style={{ width: `${demographics.femalePct}%` }}></div>
                </div>
                <span className="font-bold text-sm w-12 text-right">{demographics.femalePct}%</span>
              </div>
            </div>
          </div>

          {/* Civil Status */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-sm mb-4 text-mutedForeground">Civil Status</h4>
            <div className="flex flex-col gap-4">
              {demographics.civilStatus?.map(cs => (
                <div key={cs.status} className="flex items-center gap-4">
                  <span className="font-bold text-sm w-24 uppercase truncate" title={cs.status}>{cs.status}</span>
                  <div className="flex-1 h-6 border-2 border-foreground bg-white">
                    <div className="bg-foreground h-full transition-all duration-1000 ease-out" style={{ width: `${cs.pct}%` }}></div>
                  </div>
                  <span className="font-bold text-sm w-12 text-right">{cs.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Widget */}
        <div className="border-4 border-foreground p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-background flex flex-col">
          <h3 className="text-2xl font-black uppercase tracking-widest mb-6 border-b-2 border-foreground pb-4">Recent Activity</h3>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-mutedForeground font-bold uppercase tracking-widest text-center mt-4">No recent activity.</p>
            ) : (
              logs.map(log => (
                <div key={log.LogID} className="border-l-4 border-foreground pl-4">
                  <p className="text-xs font-bold text-mutedForeground tracking-widest uppercase mb-1">
                    {new Date(log.Timestamp).toLocaleString()}
                  </p>
                  <p className="font-medium text-sm">
                    <span className="font-bold">@{log.User?.Username}</span> {log.Action}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="border-2 border-foreground p-8 flex flex-col gap-4 hover:bg-muted transition-colors">
    <h3 className="text-mutedForeground font-bold uppercase tracking-widest text-sm">{title}</h3>
    <p className="text-6xl font-black">{value}</p>
  </div>
);

export default Dashboard;
