export type SimulationDirection = "brl_to_foreign" | "foreign_to_brl";

export interface CurrencyInfo {
    code: string;
    name: string;
}

export interface SimulationParams {
    currency: string;
    amount: number;
    direction: SimulationDirection;
    paymentMethod: "cash_money" | "prepaid_card" | "credit_card";
    exchangeHouseSpread: number;
    iofPercent: number;
}

export interface SimulationResult {
    sourceAmount: number;
    targetAmount: number;
    commercialRate: number;
    effectiveRate: number;
    spreadAmountBLR: number;
    iofAmountBRL: number;
    totalBRL: number;
}