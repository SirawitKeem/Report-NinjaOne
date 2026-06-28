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

const StatMain = ({
  value,
  label,
  icon: Icon,
  iconBg,
  iconColor,
  cardWidth = "w-full",
}) => {
  const formattedValue = formatStatValue(value);
  const valueStr = String(formattedValue || "");
  const fontSize = valueStr.length > 8 ? "text-[11px]" : valueStr.length > 5 ? "text-[13px]" : valueStr.length > 4 ? "text-[16px]" : "text-[18px]";

  const labelStr = String(label || "");
  const labelFontSize = labelStr.length > 20 ? "text-[8px]" : labelStr.length > 13 ? "text-[9px]" : "text-[10.5px]";

  return (
    <div className={`${cardWidth} h-[100px] rounded-lg border border-gray-200 bg-white p-2 shadow-sm flex flex-col`}>
      <div className="flex-1 flex items-center gap-1.5">
        <div
          className={`h-7 w-7 rounded-full flex items-center justify-center ${iconBg} shrink-0`}
        >
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        </div>

        <div className="flex flex-col min-w-0 w-full">
          <div className={`${fontSize} font-bold leading-none text-slate-900 break-all`}>
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
  const colCount = mainStats.length === 5 ? "grid-cols-5" : "grid-cols-6";
  return (
    <div className={`grid ${colCount} w-full pr-10 gap-2 items-start`}>
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