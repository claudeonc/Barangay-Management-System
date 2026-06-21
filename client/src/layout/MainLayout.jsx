import { Outlet, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { SquaresFour, Users, House, FileText, UserGear, ListDashes, SignOut, CircleNotch, List } from '@phosphor-icons/react';

const MainLayout = () => {
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <SquaresFour size={24} weight="bold" /> },
    { name: 'Residents', path: '/admin/residents', icon: <Users size={24} weight="bold" /> },
    { name: 'Households', path: '/admin/households', icon: <House size={24} weight="bold" /> },
    { name: 'Documents', path: '/admin/documents', icon: <FileText size={24} weight="bold" /> },
    { name: 'Personnel', path: '/admin/personnel', icon: <UserGear size={24} weight="bold" /> },
    { name: 'Activity Logs', path: '/admin/logs', icon: <ListDashes size={24} weight="bold" /> },
  ];

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('bms_token');
      localStorage.removeItem('bms_user');
      window.location.href = '/';
    }, 1000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground">
          <CircleNotch className="animate-spin mb-4" size={64} weight="bold" />
          <h2 className="text-3xl font-black uppercase tracking-widest animate-pulse">Logging Out</h2>
        </div>
      )}
      {/* Sidebar - Sharp, no rounded corners, solid borders */}
      <aside className={`border-r-2 border-foreground flex flex-col justify-between transition-[width] ease-in-out duration-300 overflow-x-hidden ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div>
          <div className="border-b-2 border-foreground bg-foreground text-background flex items-center pl-6 min-h-[110px]">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="text-background hover:text-accent transition-colors flex-shrink-0"
              title="Toggle Sidebar"
            >
              <List size={32} weight="bold" />
            </button>
            <h1 className={`text-2xl font-black uppercase tracking-tighter leading-none whitespace-nowrap transition-all ease-in-out duration-300 ${isSidebarOpen ? 'max-w-[200px] opacity-100 ml-4' : 'max-w-0 opacity-0 ml-0'}`}>
              BRIMS
            </h1>
          </div>
          <nav className="flex flex-col mt-4 gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                title={item.name}
                className={({ isActive }) =>
                  `pl-7 pr-4 py-4 font-bold transition-colors flex items-center ${
                    isActive
                      ? 'bg-foreground text-background'
                      : 'hover:bg-muted text-mutedForeground hover:text-foreground'
                  }`
                }
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <span className={`whitespace-nowrap transition-all ease-in-out duration-300 ${isSidebarOpen ? 'max-w-[200px] opacity-100 ml-4' : 'max-w-0 opacity-0 ml-0 overflow-hidden'}`}>
                  {item.name}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="pl-7 pr-4 py-6 border-t-2 border-foreground text-sm font-semibold">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="LOG OUT"
            className={`w-full text-left hover:text-accent transition-colors font-black tracking-widest uppercase flex items-center`}>
            <div className="flex-shrink-0"><SignOut size={24} weight="bold" /></div>
            <span className={`whitespace-nowrap transition-all ease-in-out duration-300 ${isSidebarOpen ? 'max-w-[200px] opacity-100 ml-4' : 'max-w-0 opacity-0 ml-0 overflow-hidden'}`}>
              {isLoggingOut ? 'LOGGING OUT...' : 'LOG OUT'}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-16 overflow-y-auto">
        <div className="w-full max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
