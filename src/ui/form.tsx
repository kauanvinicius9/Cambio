import { useEffect, useState } from "react";
import type { WorldCurrency } from "../data/rates";
import type { SimulationDirection, SimulationParams } from "../core/types";

const priorityCodes = ["USD", "EUR", "GBP", "ARS", "CLP", "CAD", "JPY"];

export interface ConversorFormProps {
  currencies: WorldCurrency[];
  onChange: (params: SimulationParams) => void;
}

export function ConversorForm({ currencies, onChange }: ConversorFormProps) {
  const [direction, setDirection] = useState<SimulationDirection>("foreign_to_brl");
  const [currency, setCurrency] = useState<string>("USD");
  const [amountText, setAmountText] = useState<string>("1000");
  const [iofText, setIofText] = useState<string>("1.1");
  const [spreadText, setSpreadText] = useState<string>("2.0");

  const priority = currencies.filter((c) => priorityCodes.includes(c.code));
  const others = currencies.filter((c) => !priorityCodes.includes(c.code));

  useEffect(() => {
    const amount = Math.max(0, parseFloat(amountText) || 0);
    const spread = Math.max(0, parseFloat(spreadText) || 0);
    const iof = parseFloat(iofText);
    const iofPercent = Number.isNaN(iof) ? 1.1 : iof;

    onChange({ currency, amount, direction, paymentMethod: iofPercent === 1.1 ? "cash_money" : "prepaid_card", exchangeHouseSpread: spread, iofPercent });
  }, [currency, amountText, direction, iofText, spreadText, onChange]);

  const amountLabel =
    direction === "foreign_to_brl" ? `Valor em ${currency}` : "Valor em Reais (BRL)";

  return (
    <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
      <div className="direction-toggle">
        <button type="button" id="dir-foreign-to-brl" className={`dir-btn ${direction === "foreign_to_brl" ? "active" : ""}`} onClick={() => setDirection("foreign_to_brl")}>
          Comprar (Moeda → BRL)
        </button>

        <button type="button" id="dir-brl-to-foreign" className={`dir-btn ${direction === "brl_to_foreign" ? "active" : ""}`} onClick={() => setDirection("brl_to_foreign")}>
          Reais (BRL → Moeda)
        </button>
      </div>

      <div className="input-group">
        <label htmlFor="amount-input" id="amount-label">{amountLabel}</label>
        <div className="amount-row">
          <input type="number" id="amount-input" value={amountText} min="1" step="any" required onChange={(e) => setAmountText(e.target.value)}/>
          <select id="currency-select" aria-label="Selecionar moeda" value={currency} onChange={(e) => setCurrency(e.target.value)}>

            <optgroup label="Principais">
              {priority.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </optgroup>

            <optgroup label="Todas as Moedas">
              {others.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <div className="settings-row">
        <div className="input-group">
          <label htmlFor="iof-select">Modalidade (IOF)</label>
          <select id="iof-select" value={iofText} onChange={(e) => setIofText(e.target.value)}>
            <option value="1.1">Espécie (1,1%)</option>
            <option value="3.5">Cartão / Pré-pago (3,5%)</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="spread-input">Spread Casa (%)</label>
          <input type="number" id="spread-input" value={spreadText} min="0" max="20" step="0.1" onChange={(e) => setSpreadText(e.target.value)}/>
        </div>
      </div>
    </form>
  );
}