export default function ModelSelect({ models, value, onChange }) {
  if (models.length === 0) return null;
  return (
    <select
      className="model-select"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      aria-label="AI model"
    >
      {!value && <option value="">Mock mode (no API key)</option>}
      {models.map((m) => (
        <option key={m.id} value={m.id} disabled={!m.available}>
          {m.label}
          {m.available ? '' : ' - API key required'}
        </option>
      ))}
    </select>
  );
}
