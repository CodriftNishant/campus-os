export default function StatCard({
  label,
  value,
  icon: Icon,
  className = "",
  textClassName = ""
}) {
  return (
   <div
      className={`rounded-lg border border-line shadow-soft p-5 ${
        className || "bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm ${
              textClassName ||
              "text-neutral-500"
            }`}
          >
            {label}
          </p>
         <p
            className={`mt-2 text-3xl font-black ${
              textClassName
            }`}
          >
            {value ?? 0}
          </p>
        </div>
        {Icon && (
          <Icon
            className={
              textClassName ||
              "text-brand"
            }
            size={28}
          />
        )}
      </div>
    </div>
  );
}
