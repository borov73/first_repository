/**
 * Конфигурация альткоинов экосистемы Ethereum и настроек таймфреймов.
 */

export const COINS = [
  { symbol: 'UNI',  name: 'Uniswap',   category: 'DEX',             pair: 'UNI/USDT'  },
  { symbol: 'LINK', name: 'Chainlink',  category: 'Oracle',          pair: 'LINK/USDT' },
  { symbol: 'AAVE', name: 'Aave',       category: 'DeFi Lending',    pair: 'AAVE/USDT' },
  { symbol: 'MKR',  name: 'Maker',      category: 'DeFi / CDP',      pair: 'MKR/USDT'  },
  { symbol: 'SNX',  name: 'Synthetix',  category: 'Derivatives',     pair: 'SNX/USDT'  },
  { symbol: 'COMP', name: 'Compound',   category: 'DeFi Lending',    pair: 'COMP/USDT' },
  { symbol: 'LDO',  name: 'Lido',       category: 'Liquid Staking',  pair: 'LDO/USDT'  },
  { symbol: 'ARB',  name: 'Arbitrum',   category: 'Layer 2',         pair: 'ARB/USDT'  },
  { symbol: 'OP',   name: 'Optimism',   category: 'Layer 2',         pair: 'OP/USDT'   },
  { symbol: 'ENS',  name: 'ENS',        category: 'Infrastructure',  pair: 'ENS/USDT'  },
];

export const ETH_PAIR = 'ETH/USDT';

/**
 * Mapping таймфрейм → количество периодов в году (для аннуализации).
 */
export const TIMEFRAMES = {
  '1h':  { label: '1 H',  periodsPerYear: 8760 },
  '4h':  { label: '4 H',  periodsPerYear: 2190 },
  '1d':  { label: '1 D',  periodsPerYear: 365  },
  '1w':  { label: '1 W',  periodsPerYear: 52   },
};

