'use client';

export default function CycleKingsSection() {
  return (
    <div className="mb-12">
      <div className="bg-[#F0E6E1] rounded-xl p-6 shadow-sm">
        <h2 className="font-sketch text-3xl mb-6 flex items-center justify-center">
          <span className="mr-2">Cycle kings</span>
          <span className="text-yellow-500">👑</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-32"></div>
          <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-32"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-24"></div>
          <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-24"></div>
          <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-24"></div>
          <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-24"></div>
          <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-24"></div>
          <div className="bg-[#F6ECE7] border border-black/30 rounded-xl p-6 h-24"></div>
        </div>
      </div>
    </div>
  );
} 