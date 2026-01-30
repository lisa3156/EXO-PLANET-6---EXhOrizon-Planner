
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Download, Search, Trash2, Edit2, Plane, Hotel, MapPin, 
  Ticket, X, ChevronRight, Globe, Upload, FileJson, FileSpreadsheet, MessageSquare
} from 'lucide-react';
import { ConcertPlan, SortField, SortOrder } from './types';
import ConcertForm from './components/ConcertForm';
import { exportToExcel, exportToJSON, handleImportFile } from './services/dataService';

const App: React.FC = () => {
  const [plans, setPlans] = useState<ConcertPlan[]>(() => {
    const saved = localStorage.getItem('exhorizon_plans_v5');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ConcertPlan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<ConcertPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('exhorizon_plans_v5', JSON.stringify(plans));
  }, [plans]);

  const calculatePlanTotals = (plan: ConcertPlan) => {
    const ticketTotal = plan.tickets.reduce((s, x) => s + (x.price || 0), 0);
    const hotelTotal = plan.hotels.reduce((s, x) => s + (x.price || 0), 0);
    const transportTotal = [...plan.departureFlights, ...plan.returnFlights].reduce((s, x) => s + (x.price || 0), 0);
    return {
      ticketTotal,
      hotelTotal,
      transportTotal,
      grandTotal: ticketTotal + hotelTotal + transportTotal
    };
  };

  const getWeekday = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  };

  const filteredAndSortedPlans = useMemo(() => {
    return plans
      .filter(plan => 
        plan.concertName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let valA: any = a[sortField as keyof ConcertPlan];
        let valB: any = b[sortField as keyof ConcertPlan];
        if (sortField === 'totalCost' as any) {
          valA = calculatePlanTotals(a).grandTotal;
          valB = calculatePlanTotals(b).grandTotal;
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [plans, searchTerm, sortField, sortOrder]);

  const handleAddPlan = (newPlan: Omit<ConcertPlan, 'id' | 'createdAt'>) => {
    const plan: ConcertPlan = { ...newPlan, id: crypto.randomUUID(), createdAt: Date.now() };
    setPlans(prev => [plan, ...prev]);
    setIsModalOpen(false);
  };

  const handleUpdatePlan = (updatedData: Omit<ConcertPlan, 'id' | 'createdAt'>) => {
    if (!editingPlan) return;
    setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...updatedData } : p));
    setEditingPlan(null);
    setIsModalOpen(false);
    if (viewingPlan?.id === editingPlan.id) setViewingPlan(prev => prev ? { ...prev, ...updatedData } : null);
  };

  const onImportClick = () => fileInputRef.current?.click();
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await handleImportFile(file);
        if (imported.length > 0) {
          setPlans(prev => [...imported, ...prev]);
        }
      } catch (err) {
        alert('导入失败，请检查文件格式。');
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 relative overflow-hidden text-slate-200">
      <div className="fixed top-0 left-0 w-full h-[60vh] horizon-glow pointer-events-none -z-10" />
      
      <header className="px-6 py-10 md:py-16 text-center relative">
        <div className="inline-block px-4 py-1 border border-white/20 rounded-full text-[9px] md:text-[10px] tracking-[0.4em] font-black text-white/40 mb-6 uppercase">
          PLANET ADVENTURE
        </div>
        <h1 className="font-serif-epic text-4xl md:text-7xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
          EXhOrizon
        </h1>
        <p className="font-serif-epic text-[9px] md:text-xs text-slate-500 tracking-[0.5em] uppercase">
          CONCERT TRAVEL LEDGER
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 relative">
        <div className="flex flex-col md:flex-row gap-4 mb-10 md:mb-12">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH TOUR CITY OR TITLE..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-full focus:ring-1 focus:ring-white/30 outline-none text-[10px] tracking-[0.2em] uppercase transition-all placeholder:text-slate-600" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="grid grid-cols-2 md:flex gap-2">
             <div className="relative group">
                <button className="w-full md:w-auto px-6 py-3.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> EXPORT
                </button>
                <div className="absolute top-full mt-2 right-0 hidden group-hover:block z-50">
                  <div className="bg-slate-900 border border-white/10 rounded-2xl p-2 w-40 shadow-2xl">
                    <button onClick={() => exportToJSON(plans)} className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-xl text-[10px] font-bold flex items-center gap-2 uppercase tracking-tighter"><FileJson className="w-4 h-4" /> JSON BACKUP</button>
                    <button onClick={() => exportToExcel(plans)} className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-xl text-[10px] font-bold flex items-center gap-2 uppercase tracking-tighter"><FileSpreadsheet className="w-4 h-4" /> EXCEL REPORT</button>
                  </div>
                </div>
             </div>
             <button onClick={onImportClick} className="px-6 py-3.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2">
               <Upload className="w-4 h-4" /> IMPORT
             </button>
             <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".json,.xlsx" />
             <button onClick={() => { setEditingPlan(null); setIsModalOpen(true); }} className="col-span-2 md:col-span-1 px-8 py-3.5 bg-white text-black rounded-full text-[10px] font-black tracking-widest uppercase hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
               <Plus className="w-4 h-4" /> NEW ADVENTURE
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredAndSortedPlans.map(plan => {
            const totals = calculatePlanTotals(plan);
            return (
              <div 
                key={plan.id} 
                onClick={() => setViewingPlan(plan)} 
                className="card-glass group p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] hover:border-white/30 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute -top-4 -right-4 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                  <Globe className="w-24 md:w-32 h-24 md:h-32" />
                </div>
                
                <div className="mb-8 md:mb-10">
                  <div className="text-[9px] md:text-[10px] font-black text-white/30 tracking-[0.3em] mb-2 md:mb-3 uppercase flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> {plan.city}
                  </div>
                  <h3 className="font-serif-epic text-xl md:text-2xl font-bold text-white leading-tight group-hover:tracking-wider transition-all duration-500 line-clamp-2">
                    {plan.concertName}
                  </h3>
                </div>

                <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                  <div className="flex justify-between items-center text-[8px] md:text-[9px] font-black text-slate-500 tracking-widest uppercase border-b border-white/5 pb-2">
                    <span>SESSIONS</span>
                    <span className="text-white/80">{plan.tickets.length} <span className="text-white/40 font-normal ml-1">(¥{totals.ticketTotal.toLocaleString()})</span></span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] md:text-[9px] font-black text-slate-500 tracking-widest uppercase border-b border-white/5 pb-2">
                    <span>STATUS</span>
                    <div className="flex gap-1.5">
                      <StatusDot active={plan.tickets.length > 0 && plan.tickets.every(t => t.status === 'Booked')} />
                      <StatusDot active={[...plan.departureFlights, ...plan.returnFlights].length > 0 && [...plan.departureFlights, ...plan.returnFlights].every(f => f.status === 'Booked')} />
                      <StatusDot active={plan.hotels.length > 0 && plan.hotels.every(h => h.status === 'Booked')} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-lg md:text-xl font-black text-white tracking-tighter">
                    <span className="text-[8px] md:text-[9px] text-slate-600 mr-2 uppercase tracking-widest font-bold">EST. BUDGET</span>
                    ¥{totals.grandTotal.toLocaleString()}
                  </div>
                  <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-all">
                     <button onClick={(e) => { e.stopPropagation(); setEditingPlan(plan); setIsModalOpen(true); }} className="p-2 hover:text-white text-slate-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                     <button onClick={(e) => { e.stopPropagation(); if(confirm('DELETE THIS PLAN?')) setPlans(p => p.filter(x => x.id !== plan.id)); }} className="p-2 hover:text-red-400 text-slate-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAndSortedPlans.length === 0 && (
          <div className="text-center py-20 md:py-40 border-t border-white/5 mt-10 md:mt-20 opacity-40">
            <div className="font-serif-epic text-xl md:text-2xl tracking-[0.5em] uppercase mb-6">NO HORIZONS FOUND</div>
            <button onClick={() => setIsModalOpen(true)} className="text-[10px] font-black text-white/60 tracking-[0.3em] uppercase hover:text-white transition-all underline underline-offset-8">START YOUR JOURNEY</button>
          </div>
        )}
      </main>

      {viewingPlan && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setViewingPlan(null)} />
          <div className="relative w-full md:max-w-xl bg-[#0f172a] h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500 border-l border-white/5">
            <div className="sticky top-0 bg-[#0f172a]/80 backdrop-blur-xl px-6 md:px-10 py-6 md:py-8 flex justify-between items-center border-b border-white/5 z-20">
               <div className="font-serif-epic text-[10px] md:text-xs tracking-[0.4em] text-white/40 uppercase">ITINERARY DETAILS</div>
               <button onClick={() => setViewingPlan(null)} className="p-2 text-slate-500 hover:text-white"><X className="w-6 md:w-8 h-6 md:h-8" /></button>
            </div>

            <div className="px-6 md:px-10 py-10 space-y-12 md:space-y-16 pb-40">
              <div className="text-center space-y-4">
                <div className="inline-block px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-black text-white/50 tracking-[0.3em] uppercase">{viewingPlan.city}</div>
                <h2 className="font-serif-epic text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-lg leading-tight">{viewingPlan.concertName}</h2>
              </div>

              {/* SESSIONS DETAIL */}
              <DetailSection title="SESSIONS" icon={<Ticket className="w-5 h-5" />}>
                <div className="space-y-4">
                  {viewingPlan.tickets.map((t, i) => (
                    <div key={t.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex justify-between items-center">
                      <div>
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">SESSION {i+1}</div>
                        <div className="text-base md:text-lg font-bold text-white">{t.date} <span className="text-[10px] text-white/40 font-normal ml-2">{getWeekday(t.date)}</span></div>
                        <div className="text-xs text-slate-500 mt-1 italic">{t.seat || '无位置信息'}</div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase mb-3 ${t.status === 'Booked' ? 'bg-white text-black' : 'bg-white/10 text-slate-600'}`}>
                          {t.status === 'Booked' ? '已入账' : '待处理'}
                        </div>
                        <div className="text-lg md:text-xl font-black text-white">¥{t.price}</div>
                      </div>
                    </div>
                  ))}
                  {/* 分类总计展示 */}
                  <div className="flex justify-between items-center pt-6 border-t border-white/5 px-2">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">门票费用合计</div>
                    <div className="text-xl font-black text-white tracking-tighter">¥{calculatePlanTotals(viewingPlan).ticketTotal.toLocaleString()}</div>
                  </div>
                </div>
              </DetailSection>

              {/* TRANSPORTATION DETAIL */}
              <DetailSection title="TRANSPORTATION" icon={<Plane className="w-5 h-5" />}>
                 <div className="space-y-8">
                    <FlightTimeline title="去程航线" segments={viewingPlan.departureFlights} getWeekday={getWeekday} />
                    <FlightTimeline title="返程航线" segments={viewingPlan.returnFlights} getWeekday={getWeekday} />
                    <div className="flex justify-between items-center pt-8 border-t border-white/5 px-2">
                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">交通费用合计</div>
                      <div className="text-xl font-black text-white tracking-tighter">¥{calculatePlanTotals(viewingPlan).transportTotal.toLocaleString()}</div>
                    </div>
                 </div>
              </DetailSection>

              {/* ACCOMMODATIONS DETAIL */}
              <DetailSection title="ACCOMMODATIONS" icon={<Hotel className="w-5 h-5" />}>
                 <div className="space-y-6">
                    {viewingPlan.hotels.map((h, i) => (
                      <div key={h.id} className="relative pl-8 p-6 bg-white/5 rounded-3xl border border-white/5 mb-4 last:mb-0">
                        <div className="absolute left-4 top-8 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex-1">
                             <div className="text-base md:text-lg font-bold text-white">{h.name || '未命名住宿'}</div>
                             <div className="flex items-center gap-4 text-[10px] font-black text-slate-600 tracking-widest uppercase mt-2">
                                <span>{h.checkIn || 'TBD'} <span className="lowercase opacity-40 ml-1">{getWeekday(h.checkIn)}</span></span>
                                <div className="w-8 h-[1px] bg-white/10" />
                                <span>{h.checkOut || 'TBD'} <span className="lowercase opacity-40 ml-1">{getWeekday(h.checkOut)}</span></span>
                             </div>
                           </div>
                           <div className="text-right">
                             <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase mb-2 ${h.status === 'Booked' ? 'bg-white text-black' : 'bg-white/10 text-slate-600'}`}>
                                {h.status === 'Booked' ? '已预订' : '待处理'}
                             </div>
                             <div className="text-lg md:text-xl font-black text-white">¥{h.price}</div>
                           </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-8 border-t border-white/5 px-2">
                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">住宿费用合计</div>
                      <div className="text-xl font-black text-white tracking-tighter">¥{calculatePlanTotals(viewingPlan).hotelTotal.toLocaleString()}</div>
                    </div>
                 </div>
              </DetailSection>

              <DetailSection title="MEMO" icon={<MessageSquare className="w-5 h-5" />}>
                 <div className="bg-white/5 p-6 md:p-8 rounded-[2rem] border border-white/5">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed tracking-wide italic">
                       {viewingPlan.remarks || 'No remarks recorded.'}
                    </p>
                 </div>
              </DetailSection>

              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] flex justify-between items-center shadow-[0_0_60px_rgba(255,255,255,0.1)]">
                 <div className="text-black font-black uppercase text-[10px] md:text-xs tracking-[0.3em]">GRAND TOTAL</div>
                 <div className="text-2xl md:text-4xl font-black text-black tracking-tighter italic">¥{calculatePlanTotals(viewingPlan).grandTotal.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ConcertForm 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={editingPlan ? handleUpdatePlan : handleAddPlan} 
          initialData={editingPlan} 
        />
      )}
    </div>
  );
};

// Sub-components
const DetailSection: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-6 md:space-y-8">
    <div className="flex items-center gap-4">
      <div className="w-10 md:w-12 h-10 md:h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/70 border border-white/10 shadow-inner">{icon}</div>
      <h4 className="font-serif-epic text-lg md:text-xl font-bold text-white tracking-[0.2em] uppercase">{title}</h4>
    </div>
    <div className="md:pl-4">{children}</div>
  </div>
);

const FlightTimeline: React.FC<{ title: string, segments: any[], getWeekday: (s: string) => string }> = ({ title, segments, getWeekday }) => (
  <div className="space-y-4">
    <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4">{title}</div>
    {segments.length > 0 ? segments.map((f, i) => (
      <div key={i} className="bg-white/5 p-5 md:p-6 rounded-[2rem] border border-white/5 space-y-4">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{f.flightNo || '未知航班'}</span>
              <div className="flex items-center mt-2 gap-3">
                <div className="text-sm font-bold text-white">
                  {f.depAirport} 
                  <span className="text-[10px] text-slate-600 ml-1">
                    {f.depTime?.split(' ')[1] || f.depTime?.split('T')[1]} ({getWeekday(f.depTime?.split('T')[0])})
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20" />
                <div className="text-sm font-bold text-white">
                  {f.arrAirport} 
                  <span className="text-[10px] text-slate-600 ml-1">
                    {f.arrTime?.split(' ')[1] || f.arrTime?.split('T')[1]} ({getWeekday(f.arrTime?.split('T')[0])})
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right w-full md:w-auto">
              <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase mb-2 ${f.status === 'Booked' ? 'bg-white text-black' : 'bg-white/10 text-slate-600'}`}>
                {f.status === 'Booked' ? '已出票' : '待处理'}
              </div>
              <div className="text-lg font-black text-white">¥{f.price || 0}</div>
            </div>
         </div>
      </div>
    )) : <div className="text-[10px] text-slate-700 italic px-2">尚未登记航段</div>}
  </div>
);

const StatusDot: React.FC<{ active: boolean }> = ({ active }) => (
  <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-white shadow-[0_0_12px_white]' : 'bg-white/5'}`} />
);

export default App;
