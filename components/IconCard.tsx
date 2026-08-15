export default function IconCard({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/20 bg-white text-ink hover:border-ink/50"
      }`}
    >
      <span className="text-3xl leading-none" aria-hidden="true">
        {icon}
      </span>
      <span className="text-sm font-medium leading-snug">{label}</span>
    </button>
  );
}
