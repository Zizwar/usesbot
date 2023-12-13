const Binance = require('node-binance-api');
const TelegramBot = require('node-telegram-bot-api');

const binance = new Binance().options({
  APIKEY
  APISECRET
  useServerTime: true,
});
const SECOND=60*5;
const NUMBER= "idchat"
const telegramBot = new TelegramBot("yoken");

console.log("جاهز");
telegramBot.sendMessage(NUMBER, "بوت التداول  بإعتماد المتوسط البسيط 100 على 20 و اخد الربح بالفوبوناتشي على ثلاث مراحل  جاهز");
setInterval(() => {
  binance.candlesticks("BTCUSDT", "30m", (error, ticks, symbol) => {
    if (error) throw error;

    //console.info("candlesticks()", ticks);

    let last_tick = ticks[ticks.length - 1];
    let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;

    console.log(symbol + " آخر إغلاق: " + close);

    const shortMA = calculateMovingAverage(close, 20);
    const longMA = calculateMovingAverage(close, 100);

    if (shortMA > longMA) {
      console.log("إشارة للشراء");

      const fibLevels = calculateFibonacciLevels(high, low);

      const message = `إشارة للشراء: ${symbol} آخر إغلاق: ${close}\n`
                    + `مستوى TP 38.2%: ${fibLevels[0]}\n`
                    + `مستوى TP 50%: ${fibLevels[1]}\n`
                    + `مستوى TP 61.8%: ${fibLevels[2]}`;

      telegramBot.sendMessage(NUMBER, message);
    } else if (shortMA < longMA) {
      console.log("إشارة للبيع");

      const fibLevels = calculateFibonacciLevels(high, low);

      const message = `إشارة للبيع: ${symbol} آخر إغلاق: ${close}\n`
                    + `مستوى TP 38.2%: ${fibLevels[0]}\n`
                    + `مستوى TP 50%: ${fibLevels[1]}\n`
                    + `مستوى TP 61.8%: ${fibLevels[2]}`;

      telegramBot.sendMessage(NUMBER, message);
    } else {
      console.log("لا إشارات");
      telegramBot.sendMessage(NUMBER, "لا توجد اي اشارة للبيع او الشراء  ");
    }
  });
}, 1000*SECOND);

function calculateMovingAverage(price, period) {
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
