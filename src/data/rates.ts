export interface WorldCurrency {
  code: string;
  name: string;
}

export interface HistoricalPoint {
  date: string;
  rate: number;
}

const APIBase = "https://api.frankfurter.dev/v1";

// Tradutor nativo do navegador para nomes de moedas em Português
const currencyFormatterPT = new Intl.DisplayNames(["pt-BR"], { type: "currency" });

function getCurrencyNamePT(code: string, fallbackName: string): string {
  try {
    const translated = currencyFormatterPT.of(code);
    if (!translated) return fallbackName;

    // Deixa a primeira letra maiúscula (ex: "dólar americano" -> "Dólar americano")
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  } catch {
    return fallbackName;
  }
}

// Busca todas as moedas disponíveis no mundo
export async function fetchAllCurrencies(): Promise<WorldCurrency[]> {
  const res = await fetch(`${APIBase}/currencies`);
  if (!res.ok) throw new Error("Falha ao carregar lista de moedas");
  
  const data: Record<string, string> = await res.json();

  return Object.entries(data)
    .filter(([code]) => code !== "BRL")
    .map(([code, englishName]) => (
      { code, name: getCurrencyNamePT(code, englishName) }
    ))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")); }

// Busca todas as cotações atuais em relação ao BRL
// Retorna um mapa onde o valor já está convertido para: Quantos BRL custa 1 unidade da moeda estrangeira
export async function fetchLatestRatesFromBRL(): Promise<{ date: string; ratesInBRL: Record<string, number>; }> {
  const res = await fetch(`${APIBase}/latest?base=BRL`);
  if (!res.ok) throw new Error("Falha ao buscar cotações atuais");

  const data: { date: string; rates: Record<string, number> } = await res.json();
  const ratesInBRL: Record<string, number> = {};

  for (const [code, unitsPerBRL] of Object.entries(data.rates)) {
    if (unitsPerBRL > 0) {
      ratesInBRL[code] = 1 / unitsPerBRL;
    }
  }

  return { date: data.date, ratesInBRL };
}

// Busca histórico de 30 dias de uma moeda específica para o gráfico
export async function fetchCurrencyHistory( targetCode: string, days = 30 ): Promise<HistoricalPoint[]> {
  const end = new Date();
  const start = new Date();

  start.setDate(end.getDate() - days);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const url = `${APIBase}/${fmt(start)}..${fmt(end)}?base=BRL&symbols=${targetCode}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao carregar histórico da moeda");

  const data: { rates: Record<string, Record<string, number>> } = await res.json();

  return Object.entries(data.rates).map(([date, rateObj]) => {
    const unitsPerBRL = rateObj[targetCode] || 1;
    return { date, rate: Number((1 / unitsPerBRL).toFixed(4)), };
  });
}