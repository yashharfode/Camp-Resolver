'use client';

import React from 'react';
import { Info, Scale } from 'lucide-react';

export const PriorityExplanation: React.FC = () => {
  return (
    <div
      id="section-urgency-info"
      className="bg-white rounded-2xl border border-teal-100/80 p-5 sm:p-6 shadow-xs"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Column: How Urgency Score Works */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#007A78] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Info className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              How Urgency Score Works?
            </h3>
          </div>

          {/* Formula pill */}
          <div className="inline-block bg-[#F0FDFA] text-[#0F766E] font-bold px-4 py-2.5 rounded-xl text-xs sm:text-xs tracking-tight border border-[#99F6E4]">
            Urgency Score = Category Weight + floor(Hours Pending / 24)
          </div>

          {/* Category weights subtext */}
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Category Weight: Wi-Fi = 2, Hostel = 2, Classroom = 1, Laboratory = 3
          </p>
        </div>

        {/* Right Column: Tie-Breaking Rules */}
        <div className="md:border-l md:border-slate-100 md:pl-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-[#007A78] shrink-0" />
            <h3 className="text-sm font-bold text-slate-900">
              Tie-Breaking Rules:
            </h3>
          </div>

          <div className="space-y-2 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-2.5">
              <span className="w-4.5 h-4.5 rounded-full bg-[#007A78] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span>Higher urgency score first.</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-4.5 h-4.5 rounded-full bg-[#007A78] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span>If scores are equal, older complaint first.</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-4.5 h-4.5 rounded-full bg-[#007A78] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span>If age is also equal, sort by complaint ID (A → Z).</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
