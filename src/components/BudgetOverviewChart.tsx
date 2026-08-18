import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { DollarSign, TrendingUp, AlertCircle, PieChart as PieIcon, BarChart3, CheckCircle2, Sliders, ArrowUpRight } from 'lucide-react';
import { MobilityProfile, RelocationPlan } from '../types';

interface BudgetOverviewChartProps {
  profile: MobilityProfile;
  plan: RelocationPlan;
}

export const BudgetOverviewChart: React.FC<BudgetOverviewChartProps> = ({ profile, plan }) => {
  const [activeView, setActiveView] = useState<'bar' | 'pie'>('bar');

  // Derive categories from plan.budgetAllocation with sensible defaults for full budget coverage
  const alloc = plan.budgetAllocation || { visaFees: 850, housing: 12000, flight: 1100, emergencyFund: 15000 };
  const totalProfileBudget = profile.budget || 45000;

  // Compute calculated categories
  const visaFeesAlloc = alloc.visaFees || 850;
  const visaFeesProj = Math.round(visaFeesAlloc * 1.12);

  const housingAlloc = alloc.housing || 12000;
  const housingProj = Math.round(housingAlloc * 1.1);

  const flightAlloc = alloc.flight || 1100;
  const flightProj = Math.round(flightAlloc * 1.15);

  const emergencyAlloc = alloc.emergencyFund || 15000;
  const emergencyProj = emergencyAlloc;

  const legalAlloc = Math.max(2500, Math.round((totalProfileBudget - (visaFeesAlloc + housingAlloc + flightAlloc + emergencyAlloc)) * 0.4));
  const legalProj = Math.round(legalAlloc * 1.08);

  const settlementAlloc = Math.max(0, totalProfileBudget - (visaFeesAlloc + housingAlloc + flightAlloc + emergencyAlloc + legalAlloc));
  const settlementProj = Math.round(settlementAlloc * 1.05);

  const chartData = [
    { category: 'Visa & Consular', allocated: visaFeesAlloc, projected: visaFeesProj },
    { category: 'Housing & Lease', allocated: housingAlloc, projected: housingProj },
    { category: 'Flight & Transit', allocated: flightAlloc, projected: flightProj },
    { category: 'Legal & Apostille', allocated: legalAlloc, projected: legalProj },
    { category: 'Emergency Fund', allocated: emergencyAlloc, projected: emergencyProj },
    { category: 'Settlement Reserve', allocated: settlementAlloc, projected: settlementProj },
  ];

  const totalAllocated = chartData.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalProjected = chartData.reduce((acc, curr) => acc + curr.projected, 0);
  const totalVariance = totalProjected - totalAllocated;
  const remainingBudget = totalProfileBudget - totalProjected;

  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-[#111111] border border-[#333] rounded-sm text-xs font-mono text-white shadow-xl space-y-1.5">
          <p className="font-bold text-yellow-400 border-b border-[#333] pb-1 uppercase">{label}</p>
          <div className="flex justify-between items-center gap-4 text-[#CCC]">
            <span>Allocated:</span>
            <span className="font-bold text-blue-400">${payload[0]?.value?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center gap-4 text-[#CCC]">
            <span>Projected:</span>
            <span className="font-bold text-amber-400">${payload[1]?.value?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center gap-4 pt-1 border-t border-[#222]">
            <span>Variance:</span>
            <span className={`font-bold ${
              (payload[1]?.value - payload[0]?.value) > 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              {payload[1]?.value - payload[0]?.value > 0 ? '+' : ''}
              ${(payload[1]?.value - payload[0]?.value)?.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black uppercase text-white tracking-wider">
              Relocation Budget Allocation vs Projected Expenses
            </h3>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-mono font-bold uppercase rounded">
              FINANCIAL OVERSIGHT
            </span>
          </div>
          <p className="text-xs text-[#888] mt-0.5">
            Compare initial capital allocations against live projected expense forecasts for {plan.destinationCountry || 'destination'}.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-1 bg-[#0A0A0A] border border-[#333] p-1 rounded-sm self-start sm:self-auto">
          <button
            onClick={() => setActiveView('bar')}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-sm flex items-center gap-1.5 transition-colors ${
              activeView === 'bar' ? 'bg-white text-black' : 'text-[#888] hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Comparison</span>
          </button>
          <button
            onClick={() => setActiveView('pie')}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-sm flex items-center gap-1.5 transition-colors ${
              activeView === 'pie' ? 'bg-white text-black' : 'text-[#888] hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Share Breakdown</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#0A0A0A] border border-[#222] rounded-sm">
          <p className="text-[9px] text-[#666] font-mono font-bold uppercase">Total Budget</p>
          <p className="text-lg font-black text-white font-mono mt-1">
            ${totalProfileBudget.toLocaleString()}
          </p>
          <span className="text-[9px] font-mono text-[#777]">Self-Funded Profile</span>
        </div>

        <div className="p-3.5 bg-[#0A0A0A] border border-[#222] rounded-sm">
          <p className="text-[9px] text-[#666] font-mono font-bold uppercase">Allocated Plan</p>
          <p className="text-lg font-black text-blue-400 font-mono mt-1">
            ${totalAllocated.toLocaleString()}
          </p>
          <span className="text-[9px] font-mono text-[#777]">Baseline Target</span>
        </div>

        <div className="p-3.5 bg-[#0A0A0A] border border-[#222] rounded-sm">
          <p className="text-[9px] text-[#666] font-mono font-bold uppercase">Projected Forecast</p>
          <p className="text-lg font-black text-amber-400 font-mono mt-1">
            ${totalProjected.toLocaleString()}
          </p>
          <span className="text-[9px] font-mono text-amber-500/90 font-bold">
            +${totalVariance.toLocaleString()} est. inflation
          </span>
        </div>

        <div className="p-3.5 bg-[#0A0A0A] border border-[#222] rounded-sm">
          <p className="text-[9px] text-[#666] font-mono font-bold uppercase">Remaining Cushion</p>
          <p className={`text-lg font-black font-mono mt-1 ${
            remainingBudget >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            ${remainingBudget.toLocaleString()}
          </p>
          <span className="text-[9px] font-mono text-[#777]">
            {remainingBudget >= 0 ? 'Within Safe Limits' : 'Deficit Expected'}
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-72 bg-[#0A0A0A] border border-[#222] rounded-sm p-4 pt-6">
        <ResponsiveContainer width="100%" height="100%">
          {activeView === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis 
                dataKey="category" 
                stroke="#666" 
                tick={{ fill: '#AAA', fontSize: 10, fontFamily: 'monospace' }} 
                interval={0}
              />
              <YAxis 
                stroke="#666" 
                tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontFamily: 'monospace' }}
                formatter={(value) => <span style={{ color: '#CCC', textTransform: 'uppercase' }}>{value}</span>}
              />
              <Bar dataKey="allocated" name="Allocated Budget" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="projected" name="Projected Expense" fill="#F59E0B" radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie
                data={chartData}
                dataKey="projected"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={45}
                paddingAngle={3}
                label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} 
                formatter={(value) => <span style={{ color: '#CCC' }}>{value}</span>}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Notes */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-[#777] pt-2 border-t border-[#222] gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Projected costs reflect a ~10% buffer for consular fees, currency conversion shifts, and Lisbon deposit standards.</span>
        </div>
        <span className="text-[#999] font-bold">Updated: July 2026</span>
      </div>
    </div>
  );
};
