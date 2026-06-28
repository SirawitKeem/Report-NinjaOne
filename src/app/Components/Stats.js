import React from "react";

const formatStatValue = (val) => {
  if (typeof val === 'number') {
    return val.toLocaleString('en-US');
  }
  if (typeof val === 'string' && /^\d+$/.test(val)) {
    return parseInt(val, 10).toLocaleString('en-US');
  }
  return val;
};

// =========================
// Main Card
// =========================
const StatMain = ({
  value,
  label,
  icon: Icon,
  iconBg,
  iconColor,
  barColor,
}) => {
  const formattedValue = formatStatValue(value);
  const valueStr = String(formattedValue || "");
  const valueFontSize = valueStr.length > 8 ? "text-[16px]" : valueStr.length > 5 ? "text-[18px]" : "text-[24px]";
  
  const labelStr = String(label || "");
  const labelFontSize = labelStr.length > 20 ? "text-[8px]" : labelStr.length > 13 ? "text-[9px]" : "text-[10.5px]";

  return (
    <div className="w-[145px] h-full rounded-lg border border-gray-200 bg-white p-3 shadow-sm flex flex-col shrink-0">
      <div className="flex-1 flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${iconBg} shrink-0`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

        <div className="flex flex-col min-w-0 w-full">
          <div className={`${valueFontSize} font-bold leading-none text-slate-900 break-all`}>
            {formattedValue}
          </div>
          <div className={`${labelFontSize} text-slate-500 mt-1.5 leading-tight break-words`}>
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================
// Small Card
// =========================
const StatCell = ({
  value,
  label,
  icon: Icon,
  iconColor,
}) => {
  const formattedValue = formatStatValue(value);
  const valueStr = String(formattedValue || "");
  const valueFontSize = valueStr.length > 8 ? "text-[10px]" : valueStr.length > 5 ? "text-[12px]" : "text-[14px]";

  const labelStr = String(label || "");
  const labelFontSize = labelStr.length > 20 ? "text-[7.5px]" : labelStr.length > 13 ? "text-[8.5px]" : "text-[10px]";

  return (
    <div className="h-[59px] rounded-lg border border-gray-200 bg-white shadow-sm p-2 flex items-center gap-1.5 overflow-hidden">
      <div className="flex items-center justify-center shrink-0 w-6">
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-w-0">
        <div className={`${valueFontSize} font-bold leading-none text-slate-900 break-all w-full text-center`}>
          {formattedValue}
        </div>
        <div className={`${labelFontSize} text-slate-500 mt-0.5 leading-tight break-words w-full text-center`}>
          {label}
        </div>
      </div>
    </div>
  );
};

// =========================
// Summary Component
// =========================
const Summary = ({
  mainStats = [],
  subStats = [],
}) => {
  return (
    <div className="flex w-full h-full pr-10 gap-3 items-start">
      
      {/* Left - กล่องใหญ่ 2 กล่อง */}
      <div className="flex flex-row gap-3 shrink-0 h-full">
        {mainStats.map((item, index) => (
          <StatMain
            key={item.id || index}
            value={item.value}
            label={item.label}
            icon={item.icon}
            iconBg={item.iconBg}
            iconColor={item.iconColor}
            barColor={item.barColor}
          />
        ))}
      </div>

      {/* Right - กล่องเล็ก 8 กล่อง */}
      <div className="grid flex-1 grid-cols-4 gap-x-2 gap-y-2">
        {subStats.map((item, index) => (
          <StatCell
            key={item.id || index}
            value={item.value}
            label={item.label}
            icon={item.icon}
            iconColor={item.iconColor}
          />
        ))}
      </div>

    </div>
  );
};

export default Summary;