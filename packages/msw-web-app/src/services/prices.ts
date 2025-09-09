import {
  BASE_URL,
  DEFAULT_CURRENCY,
  TimeFilter,
} from 'utils/constants';

export type TokenPrices = {
  [key: string]: {
    price: number;
    percentages: {
      [key in TimeFilter]: number;
    };
  };
};

type APITokenPrice = {
  id: string;
  current_price: number;
  price_change_percentage_24h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  price_change_percentage_1y_in_currency: number;
};

type FetchedTokenMarketData = Promise<TokenPrices | undefined>;

/**
 * Return token USD value along with price changes for 1 day, 1 week, 1 month, 1 year
 *
 * NOTE: Currently **not** fetching maximum data
 *
 * @param id Coingecko id **or** a list of comma separated ids for multiple tokens
 */
async function fetchTokenMarketData(id: string): FetchedTokenMarketData {
  if (!id) return;
  // Note: Does NOT fetch chart data
  // TODO: fetch MAX
  const endPoint = '/coins/markets';
  const url = `${BASE_URL}${endPoint}?vs_currency=${DEFAULT_CURRENCY}&ids=${id}&price_change_percentage=24h%2C7d%2C30d%2C1y`;

  try {
    const res = await fetch(url);
    const parsedResponse: APITokenPrice[] = await res.json();
    const data: TokenPrices = {};

    parsedResponse.forEach(token => {
      data[token.id] = {
        price: token.current_price,
        percentages: {
          day: token.price_change_percentage_24h_in_currency,
          week: token.price_change_percentage_7d_in_currency,
          month: token.price_change_percentage_30d_in_currency,
          year: token.price_change_percentage_1y_in_currency,
        },
      };
    });

    return data;
  } catch (error) {
    console.error('Error fetching token price', error);
  }
}

export {fetchTokenMarketData};
