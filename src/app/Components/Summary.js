import React from "react";

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
  return (
    <div className="w-full h-[100px] rounded-lg border border-gray-200 bg-white p-3 shadow-sm flex flex-col">
      <div className="flex-1 flex items-center gap-3">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center ${iconBg} shrink-0`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

        <div className="flex flex-col min-w-0 w-full">
          <div className="text-[22px] font-bold leading-none text-slate-900 truncate">
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