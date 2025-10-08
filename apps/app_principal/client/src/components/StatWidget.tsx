interface StatWidgetProps {
  icon: string;
  label: string;
  value: string;
  unit: string;
  color: string;
}

export default function StatWidget({ icon, label, value, unit, color }: StatWidgetProps) {
  return (
    <div className="p-4 rounded-lg shadow-sm bg-white flex items-center space-x-4">
      <div className={`p-3 rounded-full`} style={{ backgroundColor: color, opacity: 0.1 }}>
        <span className="material-icons text-2xl" style={{ color: color }}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">
          {value} <span className="text-base font-normal text-gray-600">{unit}</span>
        </p>
      </div>
    </div>
  );
}
