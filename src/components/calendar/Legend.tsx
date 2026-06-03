export function Legend() {
  const items = [
    { label: '采收（主季）', className: 'bg-coffee-amber' },
    { label: '采收（副季）', className: 'bg-coffee-amber/40 stripe-pattern' },
    { label: '到港（主季）', className: 'bg-teal-500' },
    { label: '到港（副季）', className: 'bg-teal-500/40 stripe-pattern' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-4 h-4 rounded-[3px] ${item.className}`} />
          <span className="text-xs text-ink-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}