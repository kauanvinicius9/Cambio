import type { SimulationResult, SimulationDirection } from "../core/types";

const formatBRL = (val: number) => val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const formatForeign  = (val: number, code: string) => val.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}) + ` ${code}`;

export interface ResultViewProps {
    result: SimulationResult,
    currencyCode: string,
    direction: SimulationDirection
}

export function ResultView({ result, currencyCode, direction }: ResultViewProps) {
    const isBuyingForeign = direction === "foreign_to_brl";
    const mainLabel = isBuyingForeign ? `Total a pagar por ${formatForeign(result.sourceAmount, currencyCode)}` : `Você recebe aproximadamente`;
    const mainValue = isBuyingForeign ? formatBRL(result.totalBRL) : formatForeign(result.targetAmount, currencyCode);

    return (
        <section className="card result-card">
            <div className="result-main">
                <div className="result-label">{mainLabel}</div>
                <div className="result-value">{mainValue}</div>
            </div>

            <div className="result-breakdown">
                <div className="breakdown-row">
                    <span>Cotação Comercial (1 {currencyCode})</span>
                    <strong>{formatBRL(result.commercialRate)}</strong>
                </div>

                <div className="breakdown-row">
                    <span>Cotação Efetiva (c/ Spread)</span>
                    <strong>{formatBRL(result.effectiveRate)}</strong>
                </div>

                <div className="breakdown-row">
                    <span>Custo do Spread</span>
                    <strong>{formatBRL(result.spreadAmountBLR)}</strong>
                </div>

                <div className="breakdown-row">
                    <span>IOF Aplicado</span>
                    <strong>{formatBRL(result.iofAmountBRL)}</strong>
                </div>
            </div>
        </section>
    )
}