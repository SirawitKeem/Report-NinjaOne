import React from 'react';

const BarGraph = ({ title, icon: Icon, data = [] }) => {

  // ✅ กรองเฉพาะ item ที่มีข้อมูลจริง (value > 0)
  const filteredData = data.filter(item => item.value > 0);

  const currentMax = Math.max(...filteredData.map(item => item.value), 0);
  const tickCount = 5;

  const rawStep = currentMax / tickCount || 40;
  const power = Math.floor(Math.log10(rawStep > 0 ? rawStep : 1));
  const factor = Math.pow(10, power);
  const step = Math.ceil(rawStep / factor) * factor;

  const maxValue = step * tickCount;

  const gridMarks = [];
  for (let i = 0; i <= maxValue; i += step) {
    gridMarks.push(i);
  }

  // ✅ ถ้าไม่มีข้อมูลเลย แสดง empty state
  if (filteredData.length === 0) {
    return (
      <div className="w-full h-full flex flex-col rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3 mb-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 shrink-0">
            {Icon ? <Icon className="h-4 w-4" /> : <div className="h-4 w-4 bg-blue-600 rounded-sm" />}
          </div>
          <h3 className="text-[15px] font-bold text-slate-900">{title}</h3>
        </div>
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  // ✅ คำนวณ minBarWidth เพื่อให้ค่าน้อยๆ (เช่น 2) ยังมองเห็นได้
  const MIN_BAR_WIDTH_PX = 36;

  return (
    <div className="w-full h-full flex flex-col rounded-xl border border-gray-100 bg-white p-3 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 shrink-0">
          {Icon ? <Icon className="h-4 w-4" /> : <div className="h-4 w-4 bg-blue-600 rounded-sm" />}
        </div>
        <h3 className="text-[15px] font-bold text-slate-900">{title}</h3>
      </div>

      {/* Chart Area */}
      <div className="relative w-full pl-[128px] flex-1 flex flex-col">

        {/* Background Grid Lines */}
        <div className="absolute top-0 bottom-5 left-[128px] right-0 flex justify-between pointer-events-none">
          {gridMarks.map((mark, index) => (
            <div key={index} className="relative h-full flex flex-col border-l border-dashed border-gray-200">
              <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[11px] text-gray-400">
                {mark.toLocaleString()}
               </span>
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="relative z-10 flex flex-col justify-evenly h-full pb-5">
          {filteredData.map((item) => {
            const widthPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

            return (
              <div key={item.id} className="flex items-center relative flex-1 max-h-9 min-h-[12px] py-[1px]">

                {/* Y-Axis Label */}
                <div className="absolute -left-[128px] w-[120px] text-right text-[12px] font-medium text-slate-700 truncate pr-3">
                  {item.label}
                </div>

                {/* ✅ Bar — ใช้ minWidth เพื่อให้ค่าน้อยๆ ยังเห็นได้ */}
                <div
                  className={`h-full ${item.color} flex items-center justify-end rounded-r-md px-3 transition-all duration-700 ease-out`}
                  style={{
                    width: `${widthPercent}%`,
                    minWidth: `${MIN_BAR_WIDTH_PX}px`,
                  }}
                >
                  <span className="text-[11px] font-semibold text-white">
                    {item.value.toLocaleString()}
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default BarGraph;