import React from 'react';

const PieChart = ({ title, icon: Icon, data = [] }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  let accumulatedPercent = 0;

  return (
    <div className="w-full h-full flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 shrink-0">
          {Icon ? <Icon className="h-4 w-4" /> : <div className="h-4 w-4 bg-blue-600 rounded-sm" />}
        </div>
        <h3 className="text-[15px] font-bold text-slate-900">{title}</h3>
      </div>

      {/* Chart Body */}
      <div className="flex-1 flex items-center justify-center gap-10 px-2">
        
        {/* โซนวาดกราฟวงแหวน (Donut Chart) */}
        <div className="relative w-[130px] h-[130px] shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* พื้นหลังวงแหวนสีเทาอ่อน */}
            <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f8fafc" strokeWidth="4" />
            
            {data.map((item, index) => {
              const percent = total > 0 ? (item.value / total) * 100 : 0;
              const dashArray = `${percent} ${100 - percent}`;
              const dashOffset = -accumulatedPercent;
              accumulatedPercent += percent;

              // แปลงคลาสสี Tailwind (bg-green-500 -> text-green-500) เพื่อระบายสีเส้นขอบกราฟ
              const strokeColorClass = item.color ? item.color.replace('bg-', 'text-') : 'text-gray-400';

              return (
                <circle
                  key={item.id || index}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  strokeWidth="4"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  className={`${strokeColorClass} stroke-current transition-all duration-1000 ease-out`}
                />
              );
            })}
          </svg>
          
          {/* ตัวเลข Total ตรงกลางวงแหวน */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[26px] font-bold text-slate-800 leading-none">{total}</span>
            <span className="text-[11px] font-medium text-slate-400 mt-1">Devices</span>
          </div>
        </div>

        {/* โซนคำอธิบายด้านขวา (Legend & Percentage) */}
        <div className="flex flex-col gap-5 flex-1 w-full">
          {data.map((item, index) => {
            // คำนวณเปอร์เซ็นต์โชว์ 1 ตำแหน่ง
            const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            
            // ลบคำว่า (Healthy) ออกจาก Label
            const displayLabel = item.label ? item.label.replace(' (Healthy)', '') : '';
            
            // เช็คสีหลักเพื่อสร้างคลาสสีให้กับกล่อง Badge ด้านขวา
            let badgeBgClass = "bg-gray-50";
            let badgeTextClass = "text-gray-600";
            if (item.color) {
              if (item.color.includes('green')) { badgeBgClass = "bg-green-50"; badgeTextClass = "text-green-600"; }
              else if (item.color.includes('orange')) { badgeBgClass = "bg-orange-50"; badgeTextClass = "text-orange-600"; }
              else if (item.color.includes('red')) { badgeBgClass = "bg-red-50"; badgeTextClass = "text-red-600"; }
              else if (item.color.includes('blue')) { badgeBgClass = "bg-blue-50"; badgeTextClass = "text-blue-600"; }
              else if (item.color.includes('purple')) { badgeBgClass = "bg-purple-50"; badgeTextClass = "text-purple-600"; }
            }

            return (
              <div key={item.id || index} className="flex items-center justify-between w-full">
                
                {/* ฝั่งซ้าย: จุดสี, Label, เปอร์เซ็นต์ */}
                <div className="flex items-start gap-3">
                  <div className={`w-3.5 h-3.5 mt-0.5 rounded-full shrink-0 ${item.color}`} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-medium text-slate-600 leading-none">{displayLabel}</span>
                    <span className="text-[14px] font-semibold text-slate-800 mt-1.5">{percent}%</span>
                  </div>
                </div>

                {/* ฝั่งขวา: กล่องบอกจำนวน Devices (Badge) */}
                <div className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap ${badgeBgClass} ${badgeTextClass}`}>
                  {item.value} Devices
                </div>
                
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default PieChart;