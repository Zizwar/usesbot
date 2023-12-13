import dotenv from "dotenv";
dotenv.config();
//
import Binance from "node-binance-api";
import TelegramBot from "node-telegram-bot-api";

//
const { BINANCE_APIKEY:APIKEY, BINANCE_APISECRET:APISECRET, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } =
  process.env;
//
const binance = new Binance().options({
  APIKEY,
  APISECRET,
  useServerTime: true,
  family: 4,
  useServerTime: true,
  verbose:true,
  reconnect:true
});
const telegramBot = new TelegramBot(TELEGRAM_TOKEN);
/////



/////
//const tickers= ["BTC", "ETH", "LTC", "XRP", "TRX", "BNB","BAT","DOGE","WING","VITE","JTO","EOS","USTC","AVAX","CYBER"];
const tickers=['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'ARBUSDT', 'DOGEUSDT', 'LTCUSDT', 'APTUSDT', 'MATICUSDT', 'ADAUSDT', 'CFXUSDT', 'AVAXUSDT', 'DOTUSDT', 'TRXUSDT', 'ATOMUSDT', 'FILUSDT', 'FTMUSDT', 'IDUSDT', 'ETCUSDT', 'OPUSDT', 'XMRUSDT', 'LINKUSDT', 'EOSUSDT', 'CHZUSDT', 'EDUUSDT', 'RNDRUSDT', 'GRTUSDT', 'QNTUSDT', 'ARUSDT', 'FETUSDT', 'BCHUSDT', 'NEARUSDT', 'AGIXUSDT', 'STXUSDT', 'SANDUSDT', 'GMTUSDT', 'MASKUSDT', 'ERNUSDT', 'MANAUSDT', 'TRBUSDT', 'HBARUSDT', 'HOOKUSDT', 'ICPUSDT', 'JASMYUSDT', 'VETUSDT', 'ACHUSDT', 'ZECUSDT', 'BLZUSDT', 'ROSEUSDT', 'MAGICUSDT', 'ZILUSDT', 'LITUSDT', 'EGLDUSDT', 'LRCUSDT', 'MINAUSDT', 'APEUSDT', 'FLOWUSDT', 'DUSKUSDT', 'OGNUSDT', 'TVKUSDT', 'XLMUSDT', 'ARPAUSDT', 'ELFUSDT', 'TWTUSDT', 'CTSIUSDT', 'IMXUSDT', 'ENSUSDT', 'ICXUSDT', 'GALUSDT', 'CTXCUSDT', 'ONEUSDT', 'DOCKUSDT', 'SSVUSDT', 'ALGOUSDT', 'VITEUSDT', 'ANKRUSDT', 'CHRUSDT', 'THETAUSDT', 'REIUSDT', 'DASHUSDT', 'CLVUSDT', 'PHBUSDT', 'OCEANUSDT', 'MDTUSDT', 'CITYUSDT', 'WAVESUSDT', 'XEMUSDT', 'ASTRUSDT', 'PONDUSDT', 'CELRUSDT', 'IOTAUSDT', 'GTCUSDT', 'ATMUSDT', 'NKNUSDT', 'KLAYUSDT', 'SKLUSDT', 'STMXUSDT', 'SXPUSDT', 'IOSTUSDT', 'HOTUSDT', 'XTZUSDT', 'MTLUSDT', 'DENTUSDT', 'KDAUSDT', 'ACMUSDT', 'RLCUSDT', 'OGUSDT', 'BATUSDT', 'BANDUSDT', 'CELOUSDT', 'PYRUSDT', 'VIDTUSDT', 'QTUMUSDT', 'LPTUSDT', 'POLYXUSDT', 'API3USDT', 'ZENUSDT']

const chatId = "-1002105118803"; // تعيين chatId الخاص بك
binance.websockets.prevDay(tickers, (error, response) => {
  if (!error) {
    const { symbol, priceChange } = response;
    console.log(`Symbol: ${symbol}, Price Change: ${priceChange}`);
  } else {
    console.error(`Error fetching data: ${error}`);
  }
});
binance.websockets.candlesticks(tickers, '1m', (candlestick) => {
  console.log('WebSocket connected successfully',candlestick);
});

binance.websockets.subscribe(tickers, (symbol, data) => {
  console.log(`Symbol: ${symbol}, Close: ${data.c}, Price Change: ${data.p}`);
});

// للتأكد من أنه تم فتح اتصال WebSocket بنجاح
binance.websockets.candlesticks(tickers, '1m', (candlestick) => {
  console.log('WebSocket connected successfully');
});