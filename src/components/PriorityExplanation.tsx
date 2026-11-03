'use client';

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Calculator, ShieldCheck, ArrowRight } from 'lucide-react';
import { CATEGORY_WEIGHTS } from '@/utils/constants';
import { ComplaintCategory } from '@/types/complaint';

export const PriorityExplanation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const categories: { name: ComplaintCategory; weight: number }[] = [
    { name: 'Laboratory', weight: CATEGORY_WEIGHTS['Laboratory'] },
    { name: 'Wi-Fi', weight: CATEGORY_WEIGHTS['Wi-Fi'] },
    { name: 'Hostel', weight: CATEGORY_WEIGHTS['Hostel'] },
    { name: 'Classroom', weight: CATEGORY_WEIGHTS['Classroom'] },
    { name: 'Other', weight: CATEGORY_WEIGHTS['Other'] },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/70 transition"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-900 block">
              How Priority & Urgency Scoring Works
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Formula: Category Weight + floor(Age in Hours / 24)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
          <span>{isOpen ? 'Hide Formula' : 'View Formula & Rules'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
            {/* Formula & Tiers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                Urgency Scoring Formula
              </h4>
              <div className="p-3.5 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                <div className="font-mono text-xs font-bold text-indigo-950 bg-indigo-50/60 p-2.5 rounded border border-indigo-200/60">
                  Urgency Score = Category Weight + floor(Age in Hours / 24)
                </div>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  Every 24 full hours an issue remains unresolved, its urgency score automatically increments by +1 point. Age is calculated dynamically from the original submission timestamp.
                </p>
              </div>

              {/* Priority Tiers */}
              <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                <span className="text-xs font-bold text-slate-700 block mb-2">Priority Classification:</span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="font-bold block">Score ≥ 4</span>
                    <span className="text-[11px]">High Priority</span>
                  </div>
                  <div className="p-2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="font-bold block">Score = 3</span>
                    <span className="text-[11px]">Medium</span>
                  </div>
                  <div className="p-2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    <span className="font-bold block">Score ≤ 2</span>
                    <span className="text-[11px]">Standard / Low</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Weights & Tie Breaking */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Category Weights & Tie-Breaking
              </h4>

              {/* Weights Table */}
              <div className="bg-white rounded-lg border border-slate-200/80 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-1.5">Category</th>
                      <th className="px-3 py-1.5 text-right">Official Weight</th>
                      <th className="px-3 py-1.5 text-slate-500">Benchmark Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {categories.map((c) => (
                      <tr key={c.name} className="hover:bg-slate-50/50">
                        <td className="px-3 py-1.5 font-medium">{c.name}</td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold text-indigo-700">
                          {c.weight}
                        </td>
                        <td className="px-3 py-1.5 text-slate-500 text-[11px]">
                          {c.name === 'Laboratory' && 'Lab (24h) = 3 + 1 = 4'}
                          {c.name === 'Wi-Fi' && 'Wi-Fi (48h) = 2 + 2 = 4'}
                          {c.name === 'Hostel' && 'Hostel (8h) = 2 + 0 = 2'}
                          {c.name === 'Classroom' && 'Classroom (72h) = 1 + 3 = 4'}
                          {c.name === 'Other' && 'Other (24h) = 1 + 1 = 2'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tie breaking note */}
              <div className="p-3 bg-white rounded-lg border border-slate-200/80 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">Strict Tie-Breaking Hierarchy:</span>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                  <li><span className="font-semibold text-slate-700">Urgency Score</span> (descending)</li>
                  <li><span className="font-semibold text-slate-700">Complaint Age</span> (older complaints take precedence)</li>
                  <li><span className="font-semibold text-slate-700">Complaint ID</span> (alphabetical order, e.g. C01 before C03)</li>
                </ol>
                <div className="mt-2 text-[11px] text-amber-700 bg-amber-50/80 border border-amber-200/60 p-1.5 rounded">
                  * Resolved complaints are immediately and permanently excluded from the priority queue.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
