const Binance = require('node-binance-api');
const TelegramBot = require('node-telegram-bot-api');
const telegramBot = new TelegramBot(tokenn);


const binance = new Binance().options({
  APIKEY,
  APISECRET,
  useServerTime: true,
});
console.log("جاهز");
setInterval(() => {
  // داخل دالة الاستجابة للشموع
  binance.candlesticks("BTCUSDT", "1m", (error, ticks, symbol) => {
  if (error) throw error;

 // console.info("candlesticks()", ticks);

  // الحصول على آخر إغلاق وأسعار أخرى
  let last_tick = ticks[ticks.length - 1];
  let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;

  console.log(symbol + " آخر إغلاق: " + close);

  // قياس تقاطع متوسطات الحركة
  const shortMA = calculateMovingAverage(close, 20);
  const longMA = calculateMovingAverage(close, 100);

  if (shortMA > longMA) {
    console.log("إشارة للشراء");

    // حساب مستويات فيبوناتشي لتحديد TP
    const fibLevels = calculateFibonacciLevels(high, low);

    console.log("مستوى TP 38.2%:", fibLevels[0]);
    console.log("مستوى TP 50%:", fibLevels[1]);
    console.log("مستوى TP 61.8%:", fibLevels[2]);
  } else if (shortMA < longMA) {
    console.log("إشارة للبيع");

    // حساب مستويات فيبوناتشي لتحديد TP
    const fibLevels = calculateFibonacciLevels(high, low);

    console.log("مستوى TP 38.2%:", fibLevels[0]);
    console.log("مستوى TP 50%:", fibLevels[1]);
    console.log("مستوى TP 61.8%:", fibLevels[2]);
  } else {
    console.log("لا إشارات");
  }
});
}, 2000);

function calculateMovingAverage(price, period) {
  // تقديم `price` كمصفوفة واحدة للحساب
  const prices = Array(period).fill(price);
  const sum = prices.reduce((acc, p) => acc + parseFloat(p), 0);
  return sum / period;
}

function calculateFibonacciLevels(high, low) {
  const fib38 = parseFloat(high) - (0.382 * (parseFloat(high) - parseFloat(low)));
  const fib50 = parseFloat(high) - (0.5 * (parseFloat(high) - parseFloat(low)));
  const fib61 = parseFloat(high) - (0.618 * (parseFloat(high) - parseFloat(low)));

  return [fib38, fib50, fib61];
  }