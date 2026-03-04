import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define a type for our Slab object to satisfy TypeScript
interface Slab {
  id: number;
  name: string;
  lx: string;
  ly: string;
  beamOn: '4 SIDES' | 'CANTILEVER';
}

const SlabLoad: React.FC = () => {
  const [constantW, setConstantW] = useState('8.129');
  const [slabs, setSlabs] = useState<Slab[]>([
    { id: 1, name: 'S1', lx: '3.5', ly: '14', beamOn: 'CANTILEVER' },
    { id: 2, name: 'S2', lx: '3.5', ly: '14', beamOn: '4 SIDES' }
  ]);

  const num = (val: string) => (val === '' ? 0 : parseFloat(val));

  const calculate = (s: Slab) => {
    const lx = num(s.lx);
    const ly = num(s.ly);
    const w = num(constantW);
    
    const m = ly !== 0 ? lx / ly : 0;
    const ratio = lx !== 0 ? ly / lx : 0;
    const type = ratio > 2 ? "ONE WAY SLAB" : "TWO WAY SLAB";

    let loadLY = 0;
    let loadLX = 0;

    if (lx > 0 && ly > 0) {
      if (s.beamOn === "CANTILEVER") {
        // Cantilever Slab Logic
        loadLY = w * lx; 
        loadLX = (w * lx) / 6;
      } else {
        // 13.93 Logic: Using Trapezoidal formula for One-Way too
        // Formula: (w * lx / 3) * ((3 - m^2) / 2)
        loadLY = (w * lx / 3) * ((3 - Math.pow(m, 2)) / 2);
        
        if (type === "ONE WAY SLAB") {
          loadLX = (w * lx) / 6; 
        } else {
          loadLX = (w * lx / 3);
        }
      }
    }

    return { 
      check: (lx > 0 && ly > 0 && lx <= ly) ? "OK" : "CHECK",
      type, 
      m: m.toFixed(2), 
      loadLY: loadLY.toFixed(2), 
      loadLX: loadLX.toFixed(2) 
    };
  };

  const updateSlab = (id: number, field: keyof Slab, value: string) => {
    setSlabs(slabs.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSlab = (id: number) => {
    setSlabs(slabs.filter(s => s.id !== id));
  };

  const downloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text("SLAB LOAD TO BEAM CALCULATION REPORT", 14, 15);
    
    const tableRows = slabs.map((s, i) => {
      const res = calculate(s);
      return [i + 1, s.name, s.lx, s.ly, res.check, res.type, s.beamOn, constantW, res.m, res.loadLY, res.loadLX];
    });

    autoTable(doc, {
      startY: 25,
      head: [['S.No', 'Slab', 'LX (m)', 'LY (m)', 'Check', 'Type', 'Beam On', 'w', 'm', 'Load LY', 'Load LX']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 8, halign: 'center' }
    });

    doc.save('Slab_Load_Report.pdf');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[13px] text-black pb-10">
      <div className="bg-slate-900 text-white p-5 sticky top-0 z-20 flex justify-between items-center border-b-4 border-blue-600 shadow-xl">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Slab Load To Beam</h1>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-blue-400">CONSTANT W</span>
            <input 
              type="text" 
              value={constantW} 
              onChange={(e) => setConstantW(e.target.value)} 
              className="w-24 p-2 bg-yellow-400 text-black font-black rounded outline-none text-center text-lg shadow-inner" 
            />
          </div>
          <button 
            onClick={downloadPDF} 
            className="bg-green-600 hover:bg-green-700 p-3 rounded font-black uppercase text-xs transition-all active:scale-95"
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="p-4 max-w-[1600px] mx-auto overflow-x-auto">
        <table className="w-full border-collapse border border-slate-400 bg-white shadow-2xl">
          <thead className="bg-slate-800 text-white font-black uppercase text-center">
            <tr>
              <th className="p-3 border border-slate-600">S.No</th>
              <th className="p-3 border border-slate-600">Slab No</th>
              <th className="p-3 border border-slate-600 bg-yellow-600">LX (m)</th>
              <th className="p-3 border border-slate-600 bg-yellow-600">LY (m)</th>
              <th className="p-3 border border-slate-600">Check</th>
              <th className="p-3 border border-slate-600">Type</th>
              <th className="p-3 border border-slate-600 bg-blue-700">Beam On</th>
              <th className="p-3 border border-slate-600">m</th>
              <th className="p-3 border border-slate-600 bg-green-700">Load LY</th>
              <th className="p-3 border border-slate-600 bg-orange-700">Load LX</th>
              <th className="p-3 border border-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="font-bold">
            {slabs.map((s, index) => {
              const res = calculate(s);
              return (
                <tr key={s.id} className="text-center hover:bg-blue-50 transition-colors border-b border-slate-300">
                  <td className="p-2 bg-slate-100">{index + 1}</td>
                  <td className="p-2">{s.name}</td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      value={s.lx} 
                      onChange={(e) => updateSlab(s.id, 'lx', e.target.value)} 
                      className="w-full text-center p-2 bg-yellow-50 border border-yellow-200 outline-none rounded" 
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      value={s.ly} 
                      onChange={(e) => updateSlab(s.id, 'ly', e.target.value)} 
                      className="w-full text-center p-2 bg-yellow-50 border border-yellow-200 outline-none rounded" 
                    />
                  </td>
                  <td className={`p-2 border-x ${res.check === "OK" ? "text-green-600" : "text-red-600 animate-pulse"}`}>
                    {res.check}
                  </td>
                  <td className="p-2 text-[11px]">{res.type}</td>
                  <td className="p-1">
                    <select 
                      value={s.beamOn} 
                      onChange={(e) => updateSlab(s.id, 'beamOn', e.target.value as any)} 
                      className="w-full p-2 bg-blue-50 font-black cursor-pointer border-none rounded"
                    >
                      <option value="4 SIDES">4 SIDES</option>
                      <option value="CANTILEVER">CANTILEVER</option>
                    </select>
                  </td>
                  <td className="p-2 text-slate-500">{res.m}</td>
                  <td className="p-2 bg-green-50 text-green-900 text-lg border-x border-green-200">{res.loadLY}</td>
                  <td className="p-2 bg-orange-50 text-orange-900 text-lg border-x border-orange-200">{res.loadLX}</td>
                  <td className="p-1">
                    <button 
                      onClick={() => removeSlab(s.id)} 
                      className="bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-600 hover:text-white transition-all"
                    >
                      DEL
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => setSlabs([...slabs, { id: Date.now(), name: `S${slabs.length + 1}`, lx: '', ly: '', beamOn: '4 SIDES' }])} 
            className="bg-blue-600 text-white px-10 py-3 rounded-full font-black text-lg shadow-lg hover:bg-blue-700 hover:shadow-2xl transition-all uppercase tracking-widest"
          >
            + Add Slab
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlabLoad;
