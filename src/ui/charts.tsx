import type { HistoricalPoint } from "../data/rates";

export interface PriceHistoryChartProps {
  points: HistoricalPoint[];
  currencyCode: string;
}

export function PriceHistoryChart({ points, currencyCode }: PriceHistoryChartProps) {
  if (points.length < 2) {
    return (
      <p className="subtitle">Sem dados suficientes para exibir o histórico</p>
    );
  }

  const width = 420;
  const height = 140;
  const pad = 12;

  const rates = points.map((p) => p.rate);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const span = max - min || 1;

  const coords = points.map((p, idx) => {
    const x = pad + (idx / (points.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (p.rate - min) / span) * (height - pad * 2);
    return `${x.toFixed(1)}.${y.toFixed(1)}`;
  });

  const polylinePoints = coords.join(" ");
  const areaPoints = `${pad},${height - pad} ${polylinePoints} ${width - pad},${height - pad}`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`Histórico de cotação de ${currencyCode} em BRL nos últimos 30 dias`}>
        <defs>
          <linearGradient id="goldChartArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <polygon points={areaPoints} fill="url(#goldChartArea)" />
        <polyline fill="none" stroke="var(--gold)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={polylinePoints}/>
      </svg>

      <div className="breakdown-row" style={{ marginTop: 8, fontSize: "0.78rem" }}>
        <span>Mín: R$ {min.toFixed(4)}</span>
        <span>Máx: R$ {max.toFixed(4)}</span>
      </div>
    </div>
  );
}
