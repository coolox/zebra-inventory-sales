export function quoteFromEurPerUnit(eurPerUnit: number) {
  return Number.isFinite(eurPerUnit) && eurPerUnit > 0 ? 1 / eurPerUnit : 0;
}

export function eurPerUnitFromQuote(currencyPerEur: number) {
  return Number.isFinite(currencyPerEur) && currencyPerEur > 0 ? 1 / currencyPerEur : 0;
}

export function convertForeignToEur(amount: number, currencyPerEur: number) {
  const eurPerUnit = eurPerUnitFromQuote(currencyPerEur);
  return amount * eurPerUnit;
}
