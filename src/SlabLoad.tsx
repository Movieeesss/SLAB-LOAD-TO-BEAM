import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
        // Formula per image_e45d2a: LY load = H2 * C2
        loadLY = w * lx; 
        // Formula per image_e4c587 comparison: LX load = (w * lx) / 6
        loadLX = (w * lx) / 6;
      } else {
        // Uniform formula for both One-Way and Two-Way as per image_e45ce6
        // loadLY = (w*lx/3)*((3-(m^2))/2)
        loadLY = (w * lx / 3) * ((3 - Math.pow(m, 2)) / 2);
        // loadLX = (w*lx/3)
        loadLX = (w * lx / 3);
      }
    }

    return { 
      check, 
      type, 
      m: m.toFixed(2), 
      loadLY: loadLY.toFixed(2), 
      loadLX: loadLX.toFixed(2) 
    };
  };

  const downloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(18);
    doc.text("SLAB LOAD TO BEAM CALCULATION REPORT", 14, 15);
    doc.setFontSize(10);
    doc.text(`Constant W: ${constantW} kN/m²`, 14, 22);

    const tableRows = slabs.map((s, index) => {
      const res = calculate(s);
      return [index + 1, s.name, s.lx, s.ly, res.check, res.type, s.beamOn, constantW, res.m, res.loadLY, res.loadLX];
    });

    autoTable(doc, {
      startY: 28,
      head: [['S.No', 'Slab No', 'LX (m)', 'LY (m)', 'Check', 'Type', 'Beam On', 'w', 'm', 'Load LY', 'Load LX']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 8, halign: 'center' }
    });

    doc.save('Slab_Load_Report.pdf');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[13px] text-black pb-10">
      <div className="bg-slate-900 text-white p-5 sticky top-0 z-20 shadow-lg border-b-4 border-blue-600 flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Slab Load to Beam</h1>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-blue-400">CONSTANT W</span>
            <input 
              type="text" value={constantW} 
              onChange={(e) => setConstantW(e.target.value)}
              className="w-24 p-2 bg-yellow-400 text-black font-black rounded outline-none text-center text-lg"
            />
          </div>
          <button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700 p-3 rounded font-black uppercase text-xs">PDF Report</button>
        </div>
      </div>

      <div className="p-4 max-w-[1600px] mx-auto overflow-x-auto">
        <table className="w-full border-collapse border border-slate-400 shadow-xl">
          <thead>
            <tr className="bg-slate-200 text-center font-black uppercase divide-x divide-slate-400 border-b-2 border-slate-500">
              <th className="p-3">S.No</th>
              <th className="p-3">Slab No</th>
              <th className="p-3 bg-yellow-100">LX (m)</th>
              <th className="p-3 bg-yellow-100">LY (m)</th>
              <th className="p-3">LX &lt; LY</th>
              <th className="p-3">Type</th>
              <th className="p-3 bg-blue-100">Beam On</th>
              <th className="p-3">w (unfac)</th>
              <th className="p-3">m = lx/ly</th>
              <th className="p-3 bg-green-100 text-blue-800">Load on LY dir</th>
              <th className="p-3 bg-orange-100 text-red-800">Load on LX dir</th>
              <th className="p-3 bg-white">Action</th>
            </tr>
          </thead>
          <tbody className="font-bold divide-y divide-slate-300">
            {slabs.map((s, index) => {
              const res = calculate(s);
              return (
                <tr key={s.id} className="text-center divide-x divide-slate-300">
                  <td className="p-2 bg-slate-50">{index + 1}</td>
                  <td className="p-2 bg-yellow-50">{s.name}</td>
                  <td className="p-1"><input type="text" value={s.lx} onChange={(e) => updateSlab(s.id, 'lx', e.target.value)} className="w-full text-center p-2 bg-yellow-100 outline-none" /></td>
                  <td className="p-1"><input type="text" value={s.ly} onChange={(e) => updateSlab(s.id, 'ly', e.target.value)} className="w-full text-center p-2 bg-yellow-100 outline-none" /></td>
                  <td className={`p-2 ${res.check === "OK" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>{res.check}</td>
                  <td className="p-2 bg-orange-300">{res.type}</td>
                  <td className="p-1 bg-blue-50">
                    <select value={s.beamOn} onChange={(e) => updateSlab(s.id, 'beamOn', e.target.value)} className="w-full p-2 bg-white font-black cursor-pointer">
                      <option value="4 SIDES">4 SIDES</option>
                      <option value="CANTILEVER">CANTILEVER</option>
                    </select>
                  </td>
                  <td className="p-2 bg-orange-200">{constantW}</td>
                  <td className="p-2">{res.m}</td>
                  <td className="p-2 bg-green-100 text-blue-900 text-lg">{res.loadLY}</td>
                  <td className="p-2 bg-orange-100 text-red-900 text-lg">{res.loadLX}</td>
                  <td className="p-1"><button onClick={() => removeSlab(s.id)} className="bg-red-600 text-white px-3 py-1 rounded font-black">DEL</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-8 flex justify-center">
          <button onClick={addSlab} className="bg-blue-600 text-white px-12 py-4 rounded-lg font-black text-xl shadow-xl uppercase tracking-widest">+ Add New Slab Row</button>
        </div>
      </div>
    </div>
  );
};

export default SlabLoad;
