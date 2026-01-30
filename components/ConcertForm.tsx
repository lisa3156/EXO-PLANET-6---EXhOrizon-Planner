
import React, { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { ConcertPlan, BookingStatus } from '../types';

interface ConcertFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: ConcertPlan | null;
}

const ConcertForm: React.FC<ConcertFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    concertName: initialData?.concertName || '',
    city: initialData?.city || '',
    tickets: initialData?.tickets || [{ id: crypto.randomUUID(), date: '', seat: '', price: 0, status: 'Pending' as BookingStatus }],
    departureFlights: initialData?.departureFlights || [{ id: crypto.randomUUID(), flightNo: '', depAirport: '', arrAirport: '', depTime: '', arrTime: '', price: 0, status: 'Pending' as BookingStatus }],
    returnFlights: initialData?.returnFlights || [{ id: crypto.randomUUID(), flightNo: '', depAirport: '', arrAirport: '', depTime: '', arrTime: '', price: 0, status: 'Pending' as BookingStatus }],
    hotels: initialData?.hotels || [{ id: crypto.randomUUID(), name: '', checkIn: '', checkOut: '', price: 0, status: 'Pending' as BookingStatus }],
    remarks: initialData?.remarks || '',
    flightStatus: initialData?.flightStatus || 'Pending' as BookingStatus,
    hotelStatus: initialData?.hotelStatus || 'Pending' as BookingStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const calculateGrandTotal = () => {
    const t = formData.tickets.reduce((s, x) => s + (x.price || 0), 0);
    const f = [...formData.departureFlights, ...formData.returnFlights].reduce((s, x) => s + (x.price || 0), 0);
    const h = formData.hotels.reduce((s, x) => s + (x.price || 0), 0);
    return t + f + h;
  };

  const getWeekday = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  };

  const inputClass = "w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-1 focus:ring-white/40 outline-none text-white transition-all placeholder:text-slate-700 text-sm appearance-none";
  const labelClass = "block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 px-1";
  
  const handleNumberFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const updateItem = (listName: string, id: string, updates: any) => {
    setFormData(p => ({
      ...p,
      [listName]: (p as any)[listName].map((item: any) => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[1000] flex items-center justify-center md:p-4">
      <div className="bg-[#0f172a] w-full max-w-4xl h-full md:h-auto md:max-h-[95vh] md:rounded-[3.5rem] border-x md:border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-6 md:px-12 py-8 md:py-10 bg-white/5 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="font-serif-epic text-xl md:text-2xl font-bold text-white tracking-[0.3em] uppercase">{initialData ? 'EDIT ADVENTURE' : 'NEW HORIZON'}</h2>
            <p className="text-[9px] font-black text-slate-600 tracking-[0.5em] uppercase mt-2">DATA ENTRY SYSTEM</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-600 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-12 overflow-y-auto flex-1 space-y-12 md:space-y-16 pb-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <label className={labelClass}>巡演项目全称</label>
              <input required value={formData.concertName} onChange={e => setFormData({...formData, concertName: e.target.value})} className={inputClass} placeholder="例如：EXO PLANET #6" />
            </div>
            <div>
              <label className={labelClass}>目的地城市</label>
              <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputClass} placeholder="例如：SEOUL" />
            </div>
          </div>

          {/* SESSIONS */}
          <div className="space-y-6">
            <SectionHeader title="演出场次" onAdd={() => setFormData(p => ({...p, tickets: [...p.tickets, {id: crypto.randomUUID(), date:'', seat:'', price:0, status:'Pending'}]}))} />
            {formData.tickets.map((t, i) => (
              <div key={t.id} className="p-6 md:p-8 bg-white/5 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 space-y-6 relative group">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-600 tracking-widest uppercase">STAGE #{i+1}</span>
                  <div className="flex items-center gap-4">
                    <StatusSwitch active={t.status === 'Booked'} onToggle={() => updateItem('tickets', t.id, {status: t.status === 'Booked' ? 'Pending' : 'Booked'})} />
                    {formData.tickets.length > 1 && <button type="button" onClick={() => setFormData(p => ({...p, tickets: p.tickets.filter(x => x.id !== t.id)}))} className="text-red-900 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>演出日期 <span className="text-white/40 lowercase ml-1">{getWeekday(t.date)}</span></label>
                    <div className="date-input-wrapper">
                      <input 
                        type="date" 
                        max="9999-12-31"
                        value={t.date} 
                        onChange={e => updateItem('tickets', t.id, {date: e.target.value})} 
                        className={`${inputClass} ${!t.date ? 'is-empty' : ''}`} 
                      />
                      <span className="date-custom-placeholder">年 / 月 / 日</span>
                    </div>
                  </div>
                  <div><label className={labelClass}>座位备注</label><input value={t.seat} onChange={e => updateItem('tickets', t.id, {seat: e.target.value})} className={inputClass} placeholder="座位信息..." /></div>
                  <div><label className={labelClass}>门票价格</label><input type="number" value={t.price} onFocus={handleNumberFocus} onChange={e => updateItem('tickets', t.id, {price: Number(e.target.value)})} className={inputClass} /></div>
                </div>
              </div>
            ))}
          </div>

          {/* TRANSPORTATION */}
          <div className="space-y-6">
            <SectionHeader title="交通行程" onAdd={() => {}} hideButton />
            {['departureFlights', 'returnFlights'].map(type => (
              <React.Fragment key={type}>
                <div className="flex justify-between items-center px-2 mt-4">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{type === 'departureFlights' ? '去程航段' : '返程航段'}</h4>
                  <button type="button" onClick={() => setFormData(p => ({...(p as any), [type]: [...(p as any)[type], {id: crypto.randomUUID(), flightNo:'', depAirport:'', arrAirport:'', depTime:'', arrTime:'', price:0, status: 'Pending'}]}))} className="text-[9px] font-black text-white/30 hover:text-white uppercase transition-colors">+ 增加条目</button>
                </div>
                {(formData as any)[type].map((f: any, i: number) => (
                  <div key={f.id} className="p-6 md:p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-600 tracking-widest uppercase">LEG #{i+1}</span>
                      <div className="flex items-center gap-4">
                        <StatusSwitch active={f.status === 'Booked'} onToggle={() => updateItem(type, f.id, {status: f.status === 'Booked' ? 'Pending' : 'Booked'})} />
                        <button type="button" onClick={() => setFormData(p => ({...(p as any), [type]: (p as any)[type].filter((x: any) => x.id !== f.id)}))} className="text-red-900 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-1"><label className={labelClass}>航班号</label><input value={f.flightNo} onChange={e => updateItem(type, f.id, {flightNo: e.target.value})} className={inputClass} placeholder="航班号" /></div>
                      <div className="col-span-1"><label className={labelClass}>单段价格</label><input type="number" value={f.price} onFocus={handleNumberFocus} onChange={e => updateItem(type, f.id, {price: Number(e.target.value)})} className={inputClass} /></div>
                      <div className="col-span-2"><label className={labelClass}>起/降机场</label>
                        <div className="flex flex-col md:flex-row items-center gap-2">
                          <input value={f.depAirport} onChange={(e) => updateItem(type, f.id, {depAirport: e.target.value})} className={inputClass} placeholder="出发" />
                          <span className="hidden md:block text-white/20">→</span>
                          <input value={f.arrAirport} onChange={(e) => updateItem(type, f.id, {arrAirport: e.target.value})} className={inputClass} placeholder="到达" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>起飞 <span className="text-white/40 lowercase ml-1">{getWeekday(f.depTime?.split('T')[0])}</span></label>
                        <div className="date-input-wrapper">
                          <input 
                            type="datetime-local" 
                            max="9999-12-31T23:59" 
                            value={f.depTime} 
                            onChange={e => updateItem(type, f.id, {depTime: e.target.value})} 
                            className={`${inputClass} ${!f.depTime ? 'is-empty' : ''}`} 
                          />
                          <span className="date-custom-placeholder">年 / 月 / 日 -- : --</span>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>到达 <span className="text-white/40 lowercase ml-1">{getWeekday(f.arrTime?.split('T')[0])}</span></label>
                        <div className="date-input-wrapper">
                          <input 
                            type="datetime-local" 
                            max="9999-12-31T23:59" 
                            value={f.arrTime} 
                            onChange={e => updateItem(type, f.id, {arrTime: e.target.value})} 
                            className={`${inputClass} ${!f.arrTime ? 'is-empty' : ''}`} 
                          />
                          <span className="date-custom-placeholder">年 / 月 / 日 -- : --</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* ACCOMMODATIONS */}
          <div className="space-y-6">
            <SectionHeader title="住宿计划" onAdd={() => setFormData(p => ({...p, hotels: [...p.hotels, {id: crypto.randomUUID(), name:'', checkIn:'', checkOut:'', price:0, status: 'Pending'}]}))} />
            {formData.hotels.map((h, i) => (
              <div key={h.id} className="p-6 md:p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-600 tracking-widest uppercase">STAY #{i+1}</span>
                  <div className="flex items-center gap-4">
                    <StatusSwitch active={h.status === 'Booked'} onToggle={() => updateItem('hotels', h.id, {status: h.status === 'Booked' ? 'Pending' : 'Booked'})} />
                    <button type="button" onClick={() => setFormData(p => ({...p, hotels: p.hotels.filter(x => x.id !== h.id)}))} className="text-red-900 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <input value={h.name} onChange={e => updateItem('hotels', h.id, {name: e.target.value})} className={inputClass} placeholder="酒店名称及地址..." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>入住 <span className="text-white/40 lowercase ml-1">{getWeekday(h.checkIn)}</span></label>
                    <div className="date-input-wrapper">
                      <input 
                        type="date" 
                        max="9999-12-31" 
                        value={h.checkIn} 
                        onChange={e => updateItem('hotels', h.id, {checkIn: e.target.value})} 
                        className={`${inputClass} ${!h.checkIn ? 'is-empty' : ''}`} 
                      />
                      <span className="date-custom-placeholder">年 / 月 / 日</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>离店 <span className="text-white/40 lowercase ml-1">{getWeekday(h.checkOut)}</span></label>
                    <div className="date-input-wrapper">
                      <input 
                        type="date" 
                        max="9999-12-31" 
                        value={h.checkOut} 
                        onChange={e => updateItem('hotels', h.id, {checkOut: e.target.value})} 
                        className={`${inputClass} ${!h.checkOut ? 'is-empty' : ''}`} 
                      />
                      <span className="date-custom-placeholder">年 / 月 / 日</span>
                    </div>
                  </div>
                  <div><label className={labelClass}>费用</label><input type="number" value={h.price} onFocus={handleNumberFocus} onChange={e => updateItem('hotels', h.id, {price: Number(e.target.value)})} className={inputClass} /></div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
             <label className={labelClass}>备注 / MEMO</label>
             <textarea 
               value={formData.remarks} 
               onChange={e => setFormData({...formData, remarks: e.target.value})} 
               className={`${inputClass} min-h-[120px] resize-none py-4`} 
               placeholder="记录其他重要信息..."
             />
          </div>

          <div className="fixed md:absolute bottom-0 left-0 right-0 bg-[#0f172a] md:bg-[#0f172a]/80 md:backdrop-blur-xl pt-6 md:pt-10 pb-6 md:pb-8 border-t border-white/5 z-50 px-6 md:px-12">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between max-w-4xl mx-auto w-full">
              <div className="text-center md:text-left">
                <div className="text-[8px] font-black text-slate-600 uppercase mb-1">TOTAL BUDGET</div>
                <div className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">¥{calculateGrandTotal().toLocaleString()}</div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button type="button" onClick={onClose} className="flex-1 px-8 md:px-10 py-4 md:py-5 border border-white/10 rounded-full font-black text-[10px] tracking-widest text-slate-500 uppercase hover:text-white transition-all">CANCEL</button>
                <button type="submit" className="flex-[2] px-10 md:px-12 py-4 md:py-5 bg-white text-black rounded-full font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 hover:scale-105 active:scale-95 shadow-2xl transition-all">
                  <Save className="w-5 h-5" /> COMMIT DATA
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ title: string, onAdd: () => void, hideButton?: boolean }> = ({ title, onAdd, hideButton }) => (
  <div className="flex justify-between items-center px-2">
    <h3 className="font-serif-epic text-base font-bold text-white tracking-[0.2em] uppercase">{title}</h3>
    {!hideButton && (
      <button type="button" onClick={onAdd} className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] hover:text-white transition-all flex items-center gap-2 border-b border-white/10 pb-1">+ 增加条目</button>
    )}
  </div>
);

const StatusSwitch: React.FC<{ active: boolean, onToggle: () => void }> = ({ active, onToggle }) => (
  <button type="button" onClick={onToggle} className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border transition-all ${active ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-slate-700 border-white/5'}`}>
    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">{active ? 'BOOKED' : 'PENDING'}</span>
  </button>
);

export default ConcertForm;
