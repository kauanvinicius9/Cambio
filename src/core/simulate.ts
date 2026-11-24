import type { SimulationParams, SimulationResult } from "./types";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const maxSafeSimulationAmount = 1e12 
// Até 1 trilhão

/**
 * Cálculo universal de câmbio BRL <-> Qualquer moeda
 * @param params Parâmetros preenchidos pelo usuário
 * @param commercialRateBrlPerUnit Quantos reais BRL custa 1 unidade da moeda estrangeira
 */

export function calculateUniversalExchange( params: SimulationParams, commercialRateBrlPerUnit: number): SimulationResult {
    const { amount, direction, exchangeHouseSpread, iofPercent } = params;
    const clampedAmount = Math.min(Math.max(amount, 0), maxSafeSimulationAmount);
    const effectiveRate = commercialRateBrlPerUnit *  (1 + exchangeHouseSpread / 100);

    let sourceAmount = clampedAmount;
    let targetAmount = 0;
    let spreadAmountBRL = 0;
    let iofAmountBRL = 0;
    let totalBRL = 0;

    if (direction === "foreign_to_brl") {
        targetAmount = amount;
        const subtotalBRL = amount * effectiveRate;
        iofAmountBRL = subtotalBRL * (iofPercent / 100);
        spreadAmountBRL = amount * (effectiveRate - commercialRateBrlPerUnit);
        totalBRL = subtotalBRL + iofAmountBRL;
    } else {
        const brlWithoutIof = amount / (1 + iofPercent / 100);
        iofAmountBRL = amount - brlWithoutIof;
        targetAmount = brlWithoutIof / effectiveRate;
        spreadAmountBRL = targetAmount * (effectiveRate - commercialRateBrlPerUnit);
        totalBRL = amount;
        sourceAmount = amount;
    }

    return {
        sourceAmount,
        targetAmount: round2(targetAmount),
        commercialRate: commercialRateBrlPerUnit,
        effectiveRate: round2(effectiveRate),
        spreadAmountBLR: round2(spreadAmountBRL),
        iofAmountBRL: round2(iofAmountBRL),
        totalBRL: round2(totalBRL),
    }
}

export function formatBRL(value: number): string {
    if (!Number.isFinite(value)) return "Valor muito alto";

    if (Math.abs(value) >= 1e12) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: 2,
        }).format(value);
    }

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}