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
  const valueFontSize = valueStr.length > 8 ? "text-[14px]" : valueStr.length > 5 ? "text-[17px]" : "text-[22px]";

  const labelStr = String(label || "");
  const labelFontSize = labelStr.length > 20 ? "text-[8.5px]" : labelStr.length > 13 ? "text-[9.5px]" : "text-[10.5px]";

  return (
    <div className="w-full h-[100px] rounded-lg border border-gray-200 bg-white p-3 shadow-sm flex flex-col">
      <div className="flex-1 flex items-center gap-3">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center ${iconBg} shrink-0`}
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
// Summary Component
// =========================
const Summary = ({
  mainStats = [],
}) => {
  return (
    <div className="grid grid-cols-5 w-full pr-10 gap-2 items-start">
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
  );
};

export default Summary;