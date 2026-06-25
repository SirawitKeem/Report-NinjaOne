import React from "react";

const StatMain = ({
  value,
  label,
  icon: Icon,
  iconBg,
  iconColor,
  cardWidth = "w-full",
}) => {
  const valueStr = String(value || "");
  const fontSize = valueStr.length > 5 ? "text-[15px]" : valueStr.length > 4 ? "text-[17px]" : "text-[20px]";

  return (
    <div className={`${cardWidth} h-[100px] rounded-lg border border-gray-200 bg-white p-2 shadow-sm flex flex-col`}>
      <div className="flex-1 flex items-center gap-1.5">
        <div
          className={`h-7 w-7 rounded-full flex items-center justify-center ${iconBg} shrink-0`}
        >
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        </div>

        <div className="flex flex-col min-w-0 w-full">
          <div className={`${fontSize} font-bold leading-none text-slate-900 truncate`}>
            {value}
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1.5 truncate">
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