import { Warning, Info, X } from '@phosphor-icons/react';

const ThemeDialog = ({ isOpen, type, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-background border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-8 relative flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-foreground hover:text-accent transition-colors"
        >
          <X size={24} weight="bold" />
        </button>

        <div className="mb-6">
          {type === 'confirm' ? (
            <Warning size={64} weight="fill" className="text-accent" />
          ) : (
            <Info size={64} weight="fill" className="text-foreground" />
          )}
        </div>

        <h2 className="text-2xl font-black uppercase tracking-widest mb-4">
          {type === 'confirm' ? 'Confirm Action' : 'System Alert'}
        </h2>
        
        <p className="font-semibold text-lg mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-4 w-full">
          {type === 'confirm' && (
            <button 
              onClick={onCancel}
              className="flex-1 bg-muted text-foreground font-bold uppercase tracking-widest py-3 border-4 border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Cancel
            </button>
          )}
          <button 
            onClick={onConfirm}
            className={`flex-1 font-bold uppercase tracking-widest py-3 border-4 border-foreground text-background transition-colors ${type === 'confirm' ? 'bg-accent hover:bg-accent/80' : 'bg-foreground hover:bg-accent'}`}
          >
            {type === 'confirm' ? 'Proceed' : 'Understood'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeDialog;
