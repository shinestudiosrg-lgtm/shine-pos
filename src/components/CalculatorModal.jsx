import React, { useState } from 'react';
import { X, Delete, Equal } from 'lucide-react';

export default function CalculatorModal({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isOpen) return null;

  const handleNum = (val) => {
    if (display === '0') setDisplay(val);
    else setDisplay(prev => prev + val);
  };

  const handleOp = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleEqual = () => {
    try {
      const fullExp = equation + display;
      const sanitized = fullExp.replace(/×/g, '*').replace(/÷/g, '/').replace(/[^0-9+\-*/.]/g, '');
      const res = Function(`"use strict"; return (${sanitized})`)();
      setDisplay(String(res));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#032653]/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xs shine-card p-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#d9e1ec] dark:border-white/10 mb-3">
          <h3 className="font-black text-[#032653] dark:text-white text-sm">Kalkulator Kasir Cepat</h3>
          <button onClick={onClose} className="p-1 rounded-lg bg-[#f4f7fb] dark:bg-white/10 text-[#032653] dark:text-white hover:bg-[#ffd028] hover:text-[#032653] transition-colors">
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-[#032653] border-2 border-[#032653] rounded-xl p-3 mb-3 text-right shadow-inner">
          <p className="text-xs text-[#e8f0ff]/70 font-mono h-4">{equation}</p>
          <p className="text-2xl font-mono font-black text-[#ffd028] truncate">{display}</p>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={handleClear} className="col-span-2 py-2.5 rounded-xl bg-rose-100 border-2 border-rose-300 text-rose-800 font-black text-sm hover:bg-rose-200 transition-colors">C</button>
          <button onClick={() => setDisplay(prev => prev.slice(0, -1) || '0')} className="py-2.5 rounded-xl bg-[#e8f0ff] border-2 border-[#c7d9f7] text-[#063b7a] font-black text-sm flex items-center justify-center hover:bg-[#ffd028] hover:text-[#032653] transition-colors">
            <Delete className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button onClick={() => handleOp('÷')} className="py-2.5 rounded-xl bg-[#032653] text-[#ffd028] border-2 border-[#032653] font-black text-base hover:bg-[#063b7a] transition-colors">÷</button>

          {['7', '8', '9'].map(n => (
            <button key={n} onClick={() => handleNum(n)} className="py-2.5 rounded-xl bg-white dark:bg-[#06346b] text-[#032653] dark:text-white font-black border-2 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653] transition-colors">{n}</button>
          ))}
          <button onClick={() => handleOp('×')} className="py-2.5 rounded-xl bg-[#032653] text-[#ffd028] border-2 border-[#032653] font-black text-base hover:bg-[#063b7a] transition-colors">×</button>

          {['4', '5', '6'].map(n => (
            <button key={n} onClick={() => handleNum(n)} className="py-2.5 rounded-xl bg-white dark:bg-[#06346b] text-[#032653] dark:text-white font-black border-2 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653] transition-colors">{n}</button>
          ))}
          <button onClick={() => handleOp('-')} className="py-2.5 rounded-xl bg-[#032653] text-[#ffd028] border-2 border-[#032653] font-black text-base hover:bg-[#063b7a] transition-colors">-</button>

          {['1', '2', '3'].map(n => (
            <button key={n} onClick={() => handleNum(n)} className="py-2.5 rounded-xl bg-white dark:bg-[#06346b] text-[#032653] dark:text-white font-black border-2 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653] transition-colors">{n}</button>
          ))}
          <button onClick={() => handleOp('+')} className="py-2.5 rounded-xl bg-[#032653] text-[#ffd028] border-2 border-[#032653] font-black text-base hover:bg-[#063b7a] transition-colors">+</button>

          <button onClick={() => handleNum('0')} className="col-span-2 py-2.5 rounded-xl bg-white dark:bg-[#06346b] text-[#032653] dark:text-white font-black border-2 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653] transition-colors">0</button>
          <button onClick={() => handleNum('00')} className="py-2.5 rounded-xl bg-white dark:bg-[#06346b] text-[#032653] dark:text-white font-black border-2 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653] transition-colors">00</button>
          <button onClick={handleEqual} className="py-2.5 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-base shadow-[2px_2px_0_#032653] hover:shadow-[3px_3px_0_#032653] flex items-center justify-center transition-all">
            <Equal className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}
