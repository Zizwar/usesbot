const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY,
  APISECRET,
  useServerTime: true,
});
console.log("ready");
setInterval(() => {
// داخل دالة الاستجابة للشموع
binance.candlesticks("BTCUSDT", "1m", (error, ticks, symbol) => {
  if (error) throw error;
console.log({ticks})
  const closePrices = ticks.map(tick => parseFloat(tick.close));
  const highPrice = Math.max(...closePrices);
  const lowPrice = Math.min(...closePrices);
//console.log({closePrices,highPrice,lowPrice})


  // قياس تقاطع متوسطات الحركة
  const shortMA = calculateMovingAverage(closePrices, 20);
  const longMA = calculateMovingAverage(closePrices, 100);

  if (shortMA > longMA) {
    console.log("إشارة للشراء");

    // حساب مستويات فيبوناتشي لتحديد TP
    const fibLevels = calculateFibonacciLevels(highPrice, lowPrice);

    console.log("مستوى TP 38.2%:", fibLevels[0]);
    console.log("مستوى TP 50%:", fibLevels[1]);
    console.log("مستوى TP 61.8%:", fibLevels[2]);
  } else if (shortMA < longMA) {
    console.log("إشارة للبيع");

    // حساب مستويات فيبوناتشي لتحديد TP
    const fibLevels = calculateFibonacciLevels(highPrice, lowPrice);

    console.log("مستوى TP 38.2%:", fibLevels[0]);
    console.log("مستوى TP 50%:", fibLevels[1]);
    console.log("مستوى TP 61.8%:", fibLevels[2]);
  } else {
    console.log("لا إشارات");
  }
});
}, 2000)
// دالة لحساب متوسط حركة الأسعار
function calculateMovingAverage(prices, period) {
  const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
  return sum / period;
}

function calculateFibonacciLevels(high, low) {
  const fib38 = high - (0.382 * (high - low));
  const fib50 = high - (0.5 * (high - low)); 
  const fib61 = high - (0.618 * (high - low));

  return [fib38, fib50, fib61];
}
