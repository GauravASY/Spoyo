import './Waveform.css';

const BARS = [0.35, 0.55, 0.8, 0.45, 1.0, 0.6, 0.75, 0.4, 0.9, 0.5, 0.65, 0.3, 0.85, 0.5, 0.4];
const DELAYS = [0, 0.18, 0.36, 0.12, 0.52, 0.08, 0.44, 0.28, 0.64, 0.20, 0.40, 0.56, 0.16, 0.32, 0.48];

export function Waveform() {
  return (
    <div className="waveform" aria-hidden="true">
      {BARS.map((h, i) => (
        <span
          key={i}
          className="waveform-bar"
          style={{
            '--bar-height': h,
            '--bar-delay': `${DELAYS[i]}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
