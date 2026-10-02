import React from 'react';
import { ShieldAlert, RefreshCw, Trash2 } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught Game Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetSave = () => {
    try {
      localStorage.removeItem('STORY_GAMBIT_RPG_SAVE_V1');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold font-serif text-amber-200">
                Adventure Anomaly Encountered
              </h2>
              <p className="text-xs text-slate-400">
                An unexpected state error occurred while rendering the game layout.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-slate-950 p-3 rounded-xl border border-red-500/30 text-left font-mono text-[11px] text-red-300 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleResetSave}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-amber-500/20 transition-all"
              >
                <Trash2 className="w-4 h-4 text-amber-400" />
                <span>Reset Local Save & Restart Journey</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
