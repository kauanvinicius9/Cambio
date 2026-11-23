import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAllCurrencies, fetchCurrencyHistory, fetchLatestRatesFromBRL, type HistoricalPoint, type WorldCurrency } from "./data/rates";
import { calculateUniversalExchange } from "./core/simulate";
import { ConversorForm } from "./ui/form";
import { ResultView } from "./ui/result";
import { PriceHistoryChart } from "./ui/charts";
import type { SimulationParams } from "./core/types";
import "./App.css";

export function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  const [currencies, setCurrencies] = useState<WorldCurrency[]>([]);
  const [ratesInBRL, setRatesInBRL] = useState<Record<string, number>>({});
  const [rateDate, setRateDate] = useState<string>("Carregando cotações...");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [params, setParams] = useState<SimulationParams>({ currency: "USD", amount: 1000, direction: "foreign_to_brl", paymentMethod: "cash_money", exchangeHouseSpread: 2.0, iofPercent: 1.1 });
  const [history, setHistory] = useState<HistoricalPoint[]>([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [allCurrencies, latest] = await Promise.all([ fetchAllCurrencies(), fetchLatestRatesFromBRL(),
        ]);

        if (!active) return;
        setCurrencies(allCurrencies);
        setRatesInBRL(latest.ratesInBRL);
        setRateDate(`Cotação atualizada em ${latest.date}`);
        setError(null);

      } catch {
        if (!active) return;
        setError("Não foi possível carregar as cotações agora.");
        setRateDate("Erro ao carregar cotações");

      } finally {
        if (active) setLoading(false);
      }

    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchCurrencyHistory(params.currency, 30).then((pts) => { if (active) setHistory(pts) }).catch(() => { if (active) setHistory([]) });
    return () => {
      active = false;
    };
  }, [params.currency]);

  const handleParamsChange = useCallback((next: SimulationParams) => {setParams(next)}, []);
  const currentRate = ratesInBRL[params.currency] ?? 0;
  const simulation = useMemo(() => {
    if (!currentRate || params.amount <= 0) return null;
    return calculateUniversalExchange(params, currentRate);
  }, [params, currentRate]);

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1 className="title">Câmbio</h1>
          <p id="rate-date" className="subtitle">{rateDate}</p>
        </div>
        <button type="button" id="theme-toggle" className="theme-btn" aria-label="Alternar tema" onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}>{theme === "dark" ? "☀" : "☾"}</button>
      </header>

      {error && (
        <div className="card">
          <p className="subtitle">{error}</p>
        </div>
      )}

      <main className="card">
        {loading ? (
          <p className="subtitle">Carregando moedas...</p>
        ) : (
          <ConversorForm currencies={currencies} onChange={handleParamsChange}/>
        )}
      </main>

      {simulation && (
        <ResultView result={simulation} currencyCode={params.currency} direction={params.direction}/>
      )}

      <section className="card chart-card">
        <div className="chart-header">
          <h2 className="chart-title">Histórico (30 dias)</h2>
          <span id="chart-pair" className="badge-gold">
            {params.currency} / BRL
          </span>
          
        </div>
        <div id="chart-container" className="chart-box">
          <PriceHistoryChart points={history} currencyCode={params.currency} />
        </div>
      </section>
    </div>
  );
}

export default App;