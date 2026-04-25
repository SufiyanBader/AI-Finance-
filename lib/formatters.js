import { CURRENCIES } from "./currencies";

export const SUPPORTED_CURRENCIES = {
  USD: { name: "US Dollar",          symbol: "$",    flag: "US" },
  EUR: { name: "Euro",               symbol: "€",    flag: "EU" },
  GBP: { name: "British Pound",      symbol: "£",    flag: "GB" },
  JPY: { name: "Japanese Yen",       symbol: "¥",    flag: "JP" },
  AUD: { name: "Australian Dollar",  symbol: "A$",   flag: "AU" },
  CAD: { name: "Canadian Dollar",    symbol: "C$",   flag: "CA" },
  CHF: { name: "Swiss Franc",        symbol: "Fr",   flag: "CH" },
  CNY: { name: "Chinese Yuan",       symbol: "¥",    flag: "CN" },
  INR: { name: "Indian Rupee",       symbol: "₹",    flag: "IN" },
  MXN: { name: "Mexican Peso",       symbol: "$",    flag: "MX" },
  BRL: { name: "Brazilian Real",     symbol: "R$",   flag: "BR" },
  KRW: { name: "South Korean Won",   symbol: "₩",    flag: "KR" },
  SGD: { name: "Singapore Dollar",   symbol: "S$",   flag: "SG" },
  HKD: { name: "Hong Kong Dollar",   symbol: "HK$",  flag: "HK" },
  HKD: { name: "Hong Kong Dollar",   symbol: "HK$",  flag: "HK" },
  NOK: { name: "Norwegian Krone",    symbol: "kr",   flag: "NO" },
  SEK: { name: "Swedish Krona",      symbol: "kr",   flag: "SE" },
  DKK: { name: "Danish Krone",       symbol: "kr",   flag: "DK" },
  NZD: { name: "New Zealand Dollar", symbol: "NZ$",  flag: "NZ" },
  ZAR: { name: "South African Rand", symbol: "R",    flag: "ZA" },
  THB: { name: "Thai Baht",          symbol: "฿",    flag: "TH" },
  TRY: { name: "Turkish Lira",       symbol: "₺",    flag: "TR" },
  AED: { name: "UAE Dirham",         symbol: "د.إ",  flag: "AE" },
  SAR: { name: "Saudi Riyal",        symbol: "﷼",   flag: "SA" },
  IDR: { name: "Indonesian Rupiah",  symbol: "Rp",   flag: "ID" },
  MYR: { name: "Malaysian Ringgit",  symbol: "RM",   flag: "MY" },
  PHP: { name: "Philippine Peso",    symbol: "₱",    flag: "PH" },
  PLN: { name: "Polish Zloty",       symbol: "zł",   flag: "PL" },
  CZK: { name: "Czech Koruna",       symbol: "Kč",   flag: "CZ" },
  HUF: { name: "Hungarian Forint",   symbol: "Ft",   flag: "HU" },
  ILS: { name: "Israeli Shekel",     symbol: "₪",    flag: "IL" },
};

/**
 * Calculate portfolio metrics from holdings and prices
 */
export function calculatePortfolioMetrics(holdings) {
  let totalValue = 0;
  let totalCost = 0;
  let totalDayChange = 0;

  const enrichedHoldings = holdings.map((holding) => {
    const quantity = holding.quantity;
    const currentPrice = holding.currentPrice;
    const avgBuyPrice = holding.averageBuyPrice;

    const currentValue = quantity * currentPrice;
    const costBasis = quantity * avgBuyPrice;
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
    const dayChange = holding.change ? quantity * holding.change : 0;

    totalValue += currentValue;
    totalCost += costBasis;
    totalDayChange += dayChange;

    return {
      ...holding,
      currentValue,
      costBasis,
      gainLoss,
      gainLossPercent,
      dayChange,
      allocation: 0,
    };
  });

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const totalDayChangePercent = totalValue > 0 ? (totalDayChange / totalValue) * 100 : 0;

  // Calculate allocation percentages
  enrichedHoldings.forEach((h) => {
    h.allocation = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0;
  });

  return {
    holdings: enrichedHoldings,
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    totalDayChange,
    totalDayChangePercent,
  };
}

/**
 * Format price with appropriate decimal places
 */
export function formatPrice(price, symbol, currencyCode = "USD") {
  const currency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];
  const locale = currency.locale;

  if (price === null || price === undefined) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.code,
    }).format(0);
  }

  // Crypto under $1 shows 6 decimal places
  if (price < 0.01 && price > 0) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(price);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format percentage with sign
 */
export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return "0.00%";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Get color class based on positive/negative value
 */
export function getChangeColor(value) {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-muted-foreground";
}

/**
 * Format a number as a locale-aware currency string (Trips style)
 */
export function formatCurrency(amount, currencyCode) {
  const currency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

/**
 * Get just the symbol for a currency code
 */
export function getCurrencySymbol(currencyCode) {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol ?? currencyCode;
}
