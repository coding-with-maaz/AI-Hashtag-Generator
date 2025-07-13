import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Search from './pages/Search';
import LikedKeywords from './pages/LikedKeywords';
import SearchHistory from './pages/SearchHistory';
import Statistics from './pages/Statistics';
import AdmobConfig from './pages/AdmobConfig';
import Export from './pages/Export';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { useState } from 'react';

const queryClient = new QueryClient();
const ADMOB_PASSWORD = 'admob2024';

function ProtectedAdmobConfig() {
  const [entered, setEntered] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  if (entered) return <AdmobConfig />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-xs">
        <h2 className="text-lg font-semibold mb-4 text-center">AdMob Config - Password Required</h2>
        <input
          type="password"
          className="w-full border rounded px-3 py-2 mb-2"
          placeholder="Enter password"
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); }}
          onKeyDown={e => { if (e.key === 'Enter') { if (input === ADMOB_PASSWORD) setEntered(true); else setError('Incorrect password'); } }}
        />
        <button
          className="w-full bg-primary text-white rounded py-2 font-semibold hover:bg-primary/90 transition"
          onClick={() => { if (input === ADMOB_PASSWORD) setEntered(true); else setError('Incorrect password'); }}
        >
          Access
        </button>
        {error && <div className="text-red-500 text-xs mt-2 text-center">{error}</div>}
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/trending-keywords" element={<LikedKeywords />} />
          <Route path="/search-history" element={<SearchHistory />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/admob-config" element={<ProtectedAdmobConfig />} />
          <Route path="/export" element={<Export />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;