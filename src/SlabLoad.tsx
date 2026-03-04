import React, { useState } from 'react';

const SlabLoad = () => {
  const [constantW, setConstantW] = useState('11.129');
  const [slabs, setSlabs] = useState([
    { id: 1, name: 'S1', lx: '3.5', ly: '14', beamOn: '4 SIDES' }
  ]);

  const addSlab = () => {
    const newId = slabs.length + 1;
    setSlabs([...slabs, { id: newId, name: `S${newId}`, lx: '', ly: '', beamOn: '4 SIDES' }]);
  };

  const removeSlab = (id: number) => {
    if (slabs.length > 1) {
      setSlabs(slabs.filter(s => s.id !== id));
    }
  };

  const updateSlab = (id: number, field: string, value: string) => {
    setSlabs(slabs.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculate = (s: any) => {
    const lx = parseFloat(s.lx) || 0;
    const ly = parseFloat(s.ly) || 0;
    const w = parseFloat(constantW) || 0;
    
    const check = (lx > 0 && ly > 0 && lx <= ly) ? "OK" : "CHECK";
    const m = ly !== 0 ? lx / ly : 0;
    const ratio = lx !== 0 ? ly / lx : 0;
    const type = ratio > 2 ? "ONE WAY SLAB" : "TWO WAY SLAB";

    let loadLY = 0;
    let loadLX = 0;

    if (lx > 0 && ly > 0) {
      if (type === "ONE WAY SLAB") {
        loadLY = (w * lx) / 2;
        loadLX = 0;
      } else {
        // Two-way distribution formulas
        loadLY = (w * lx / 3) * ((3 - Math.pow(m, 2)) / 2);
        loadLX = (w * lx / 3);
      }
    }

    return { check, type, m, loadLY, loadLX };
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-10">
      {/* Fixed Header */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-20 shadow-xl border-b-4 border-blue-600">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Slab Load to Beam</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase">Marriage Hall Site Load Calculator</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase">Constant W (kN/m²)</span>
            <input 
              type="text" 
              value={constantW} 
              onChange={(e) => setConstantW(e.target.value)}
              className="w-20 p-2 text-center font-black bg-yellow-400 text-slate-900 rounded border-2 border-white outline-none"
            />
          </div>
        </div>
      </div>

      <div className="p-2 md:p-6 max-w-7xl mx-auto">
        {/* Desktop Table - Hidden on small mobile */}
        <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow-2xl border border-slate-300">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-200 text-center font-black uppercase text-slate-700">
                <th className="p-2 border border-slate-300">S.No</th>
                <th className="p-2 border border-slate-300">Slab No</th>
                <th className="p-2 border border-slate-300 bg-yellow-50">LX (m)</th>
                <th className="p-2 border border-slate-300 bg-yellow-50">LY (m)</th>
                <th className="p-2 border border-slate-300">LX &lt; LY</th>
                <th className="p-2 border border-slate-300">TYPE</th>
                <th className="p-2 border border-slate-300">BEAM ON</th>
                <th className="p-2 border border-slate-300">m = lx/ly</th>
                <th className="p-2 border border-slate-300 bg-green-50 text-blue-800">Load on LY dir</th>
                <th className="p-2 border border-slate-300 bg-orange-50 text-red-800">Load on LX dir</th>
                <th className="p-2 border border-slate-300 bg-white">Action</th>
              </tr>
            </thead>
            <tbody className="font-bold">
              {slabs.map((s, index) => {
                const res = calculate(s);
                return (
                  <tr key={s.id} className="text-center border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 border border-slate-200 bg-slate-50 text-slate-500">{index + 1}</td>
                    <td className="p-2 border border-slate-200 bg-yellow-100">{s.name}</td>
                    <td className="p-1 border border-slate-200">
                      <input type="text" value={s.lx} onChange={(e) => updateSlab(s.id, 'lx', e.target.value)} className="w-full text-center p-1 bg-white border border-slate-200 outline-none focus:border-blue-500" />
                    </td>
                    <td className="p-1 border border-slate-200">
                      <input type="text" value={s.ly} onChange={(e) => updateSlab(s.id, 'ly', e.target.value)} className="w-full text-center p-1 bg-white border border-slate-200 outline-none focus:border-blue-500" />
                    </td>
                    <td className={`p-2 border border-slate-200 ${res.check === "OK" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>{res.check}</td>
                    <td className={`p-2 border border-slate-200 ${res.type === "ONE WAY SLAB" ? "bg-orange-400" : "bg-blue-400 text-white"}`}>{res.type}</td>
                    <td className="p-2 border border-slate-200 bg-blue-100 text-[10px]">{s.beamOn}</td>
                    <td className="p-2 border border-slate-200 bg-yellow-50">{res.m.toFixed(2)}</td>
                    <td className="p-2 border border-slate-200 bg-green-100 text-blue-900 text-lg">{res.loadLY.toFixed(2)}</td>
                    <td className="p-2 border border-slate-200 bg-orange-100 text-red-900 text-lg">{res.loadLX.toFixed(2)}</td>
                    <td className="p-1 border border-slate-200">
                      <button onClick={() => removeSlab(s.id)} className="bg-red-600 text-white px-2 py-1 rounded-md text-[9px] hover:bg-red-800">DEL</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="lg:hidden space-y-3">
          {slabs.map((s, index) => {
            const res = calculate(s);
            return (
              <div key={s.id} className="bg-white rounded-lg shadow-md border border-slate-300 overflow-hidden">
                <div className="bg-slate-800 p-2 flex justify-between items-center text-white">
                  <span className="font-black">#{index + 1} - {s.name}</span>
                  <button onClick={() => removeSlab(s.id)} className="text-[10px] bg-red-600 px-2 py-1 rounded">DEL</button>
                </div>
                <div className="p-3 grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400">LX (Short)</span>
                    <input type="text" value={s.lx} onChange={(e) => updateSlab(s.id, 'lx', e.target.value)} className="p-2 bg-yellow-50 border-2 border-yellow-200 rounded font-black text-lg text-center outline-none" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400">LY (Long)</span>
                    <input type="text" value={s.ly} onChange={(e) => updateSlab(s.id, 'ly', e.target.value)} className="p-2 bg-yellow-50 border-2 border-yellow-200 rounded font-black text-lg text-center outline-none" />
                  </div>
                  <div className={`p-2 rounded text-center font-black text-xs ${res.check === "OK" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>CHECK: {res.check}</div>
                  <div className={`p-2 rounded text-center font-black text-[10px] ${res.type === "ONE WAY SLAB" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>{res.type}</div>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Load LY dir</span>
                    <div className="text-xl font-black text-blue-700">{res.loadLY.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Load LX dir</span>
                    <div className="text-xl font-black text-red-700">{res.loadLX.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer Action */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={addSlab} 
            className="bg-blue-600 text-white px-10 py-4 rounded-full font-black text-lg shadow-[0_8px_0_0_rgba(30,58,138,1)] active:shadow-none active:translate-y-2 transition-all uppercase tracking-widest"
          >
            + Add New Slab Row
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlabLoad;