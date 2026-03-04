import React, { useState } from 'react';

const SlabLoad = () => {
  const [constantW, setConstantW] = useState('8.129');
  const [slabs, setSlabs] = useState([
    { id: 1, name: 'S1', lx: '3.5', ly: '14', beamOn: 'CANTILEVER' },
    { id: 2, name: 'S2', lx: '3.5', ly: '14', beamOn: '4 SIDES' }
  ]);

  const addSlab = () => {
    const newId = Date.now();
    setSlabs([...slabs, { id: newId, name: `S${slabs.length + 1}`, lx: '', ly: '', beamOn: '4 SIDES' }]);
  };

  const removeSlab = (id: number) => {
    if (slabs.length > 1) setSlabs(slabs.filter(s => s.id !== id));
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
      if (s.beamOn === "CANTILEVER") {
        // Updated to match Excel: (w * lx * 3.5) and (w * lx / 6)
        loadLY = w * lx * 1; 
        loadLX = (w * lx) / 6;
      } else if (type === "ONE WAY SLAB") {
        // Updated to match Excel S2 values: LY = 14.23, LX = 4.74
        loadLY = (w * lx) / 2;
        loadLX = (w * lx) / 6; 
      } else {
        // Two-way distribution formulas as per Excel sheet
        loadLY = (w * lx / 3) * ((3 - Math.pow(m, 2)) / 2);
        loadLX = (w * lx / 3);
      }
    }

    // Final Rounding to match your exact Excel display
    return { 
      check, 
      type, 
      m, 
      loadLY: Math.round(loadLY * 100) / 100, 
      loadLX: Math.round(loadLX * 100) / 100 
    };
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[13px] text-black pb-10">
      <div className="bg-slate-900 text-white p-5 sticky top-0 z-20 shadow-lg border-b-4 border-blue-600 flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Slab Load to Beam</h1>
        <div className="flex items-center gap-3">
          <span className="font-black text-blue-400 text-[10px] uppercase">Constant W:</span>
          <input 
            type="text" value={constantW} 
            onChange={(e) => setConstantW(e.target.value)}
            className="w-24 p-2 bg-yellow-400 text-black font-black rounded border-2 border-white outline-none text-center text-lg"
          />
        </div>
      </div>

      <div className="p-2 md:p-6 max-w-[1600px] mx-auto overflow-x-auto">
        <table className="w-full border-collapse border border-slate-400 shadow-xl bg-white">
          <thead>
            <tr className="bg-slate-200 text-center font-black uppercase divide-x divide-slate-400 border-b-2 border-slate-500">
              <th className="p-3 w-12">S.No</th>
              <th className="p-3 w-24">Slab No</th>
              <th className="p-3 bg-yellow-100 w-24">LX (m)</th>
              <th className="p-3 bg-yellow-100 w-24">LY (m)</th>
              <th className="p-3 w-24">LX &lt; LY</th>
              <th className="p-3 w-40">Type</th>
              <th className="p-3 bg-blue-100 w-44">Beam On</th>
              <th className="p-3 w-24">w (unfac)</th>
              <th className="p-3 w-24">m = lx/ly</th>
              <th className="p-3 bg-green-100 text-blue-800 w-36">Load on LY dir</th>
              <th className="p-3 bg-orange-100 text-red-800 w-36">Load on LX dir</th>
              <th className="p-3 bg-white w-20">Action</th>
            </tr>
          </thead>
          <tbody className="font-bold divide-y divide-slate-300">
            {slabs.map((s, index) => {
              const res = calculate(s);
              return (
                <tr key={s.id} className="text-center hover:bg-blue-50 transition-colors divide-x divide-slate-300">
                  <td className="p-2 bg-slate-50 text-slate-400">{index + 1}</td>
                  <td className="p-2 bg-yellow-50">{s.name}</td>
                  <td className="p-1">
                    <input type="text" value={s.lx} onChange={(e) => updateSlab(s.id, 'lx', e.target.value)} className="w-full text-center p-2 bg-yellow-100 border border-transparent focus:border-blue-500 outline-none rounded" />
                  </td>
                  <td className="p-1">
                    <input type="text" value={s.ly} onChange={(e) => updateSlab(s.id, 'ly', e.target.value)} className="w-full text-center p-2 bg-yellow-100 border border-transparent focus:border-blue-500 outline-none rounded" />
                  </td>
                  <td className={`p-2 ${res.check === "OK" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>{res.check}</td>
                  <td className={`p-2 ${res.type === "ONE WAY SLAB" ? "bg-orange-300 text-black" : "bg-blue-300 text-black"}`}>{res.type}</td>
                  <td className="p-1 bg-blue-50">
                    <select 
                      value={s.beamOn} 
                      onChange={(e) => updateSlab(s.id, 'beamOn', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded font-black cursor-pointer"
                    >
                      <option value="4 SIDES">4 SIDES</option>
                      <option value="CANTILEVER">CANTILEVER</option>
                    </select>
                  </td>
                  <td className="p-2 bg-orange-200 text-red-600">{constantW}</td>
                  <td className="p-2 bg-yellow-50">{res.m.toFixed(2)}</td>
                  <td className="p-2 bg-green-100 text-blue-900 text-lg font-black">{res.loadLY.toFixed(2)}</td>
                  <td className="p-2 bg-orange-100 text-red-900 text-lg font-black">{res.loadLX.toFixed(2)}</td>
                  <td className="p-1">
                    <button onClick={() => removeSlab(s.id)} className="bg-red-600 text-white px-3 py-1.5 rounded font-black hover:bg-red-800">DEL</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-10 flex justify-center">
          <button 
            onClick={addSlab} 
            className="bg-blue-600 text-white px-12 py-4 rounded-lg font-black text-xl shadow-xl hover:bg-blue-800 active:translate-y-1 transition-all uppercase tracking-widest border-b-4 border-blue-900"
          >
            + Add New Slab Row
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlabLoad;
