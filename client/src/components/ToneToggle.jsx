export default function ToneToggle({ tones, value, onChange }) {
  return (
    <div className="tone-toggle" role="radiogroup" aria-label="Response tone">
      {tones.map((t) => (
        <button
          key={t.id}
          role="radio"
          aria-checked={t.id === value}
          className={t.id === value ? 'active' : ''}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
