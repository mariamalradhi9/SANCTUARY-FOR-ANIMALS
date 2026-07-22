"use client";

const LEVELS = [1, 2, 3, 4, 5];

export default function ScoreScale({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selected = Number(value) || 0;

  return (
    <div className="score-scale" role="radiogroup" aria-label="Score from 1 (low) to 5 (high)">
      <span className="score-scale-label">Low</span>
      {LEVELS.map((n) => (
        <button
          key={n}
          type="button"
          className={`score-circle${n <= selected ? " filled" : ""}${n === selected ? " selected" : ""}`}
          onClick={() => onChange(String(n))}
          aria-pressed={n === selected}
          title={`Score ${n}`}
        >
          {n}
        </button>
      ))}
      <span className="score-scale-label">High</span>
    </div>
  );
}
