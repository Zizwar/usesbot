import dotenv from "dotenv";
dotenv.config();
//
import Binance from "node-binance-api";
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
//
const { BINANCE_APIKEY:APIKEY, BINANCE_APISECRET:APISECRET, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } =
  process.env;
//
const binance = new Binance().options({
  APIKEY,
  APISECRET,
  useServerTime: true,
  family: 4,
});
const telegramBot = new TelegramBot(TELEGRAM_TOKEN);
/////

const START_MSG = "بوت التداول مستعد للاعتماد على المتوسط البسيط 100 على 20، وتحقيق الأرباح باستخدام تقنية الفيبوناتشي على خمس مراحل. يحلل شموع 30 دقيقة، ويتحقق من الإشارات كل 5 دقائق. 📊🤖";
telegramBot.sendMessage(chatId, START_MSG);
const SECOND = 60 * 0.5;

console.log("start bot");

// Object to store signals
const storedSignals = {};

setInterval(() => {
  const mainCurrencies = ["BTC", "ETH", "LTC", "XRP", "TRX", "BNB"];

  mainCurrencies.forEach((currency, index) => {
    setTimeout(() => {
      const symbol = currency + "USDT";
      binance.candlesticks(symbol, "30m", (error, ticks, symbol) => {
        if (error) throw error;

        let last_tick = ticks[ticks.length - 1];
        let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;

        console.log(symbol + " آخر إغلاق: " + close);

        const shortMA = calculateMovingAverage(close, 20);
        const longMA = calculateMovingAverage(close, 100);

        if (shortMA < longMA) {
          console.log("إشارة للبيع");

          const fibLevels = calculateFibonacciLevels(high, low, close);

          const buyZoneStart1 = close - 0.002;
          const buyZoneEnd1 = close + 0.002;
          const stopLossPercentage = -0.05; // 5% stop loss
          const stopLoss = close + (close * stopLossPercentage);
          console.log({ stopLoss });
const closeNumber = parseFloat(close);
          const formattedPrices = {
            buyZoneStart1: parseFloat(close).toFixed(5),
            buyZoneEnd1: isNaN(fibLevels.minfib23) ? "N/A" : fibLevels.minfib23.toFixed(5),
            stopLoss: isNaN(fibLevels.minfib50) ? "N/A" : fibLevels.minfib50.toFixed(5),
            fib38: isNaN(fibLevels.fib38) ? "N/A" : fibLevels.fib38.toFixed(5),
            fib50: isNaN(fibLevels.fib50) ? "N/A" : fibLevels.fib50.toFixed(5),
            fib61: isNaN(fibLevels.fib61) ? "N/A" : fibLevels.fib61.toFixed(5),
            fib78: isNaN(fibLevels.fib78) ? "N/A" : fibLevels.fib78.toFixed(5),
          };

          storedSignals[symbol] = {
            buyZone: `${formattedPrices.buyZoneStart1} - ${formattedPrices.buyZoneEnd1}`,
            sellTargets: {
              TP1: { price: formattedPrices.fib38, achieved: false },
              TP2: { price: formattedPrices.fib50, achieved: false },
              TP3: { price: formattedPrices.fib61, achieved: false },
              TP4: { price: formattedPrices.fib78, achieved: false },
            },
            stopLoss: formattedPrices.stopLoss,
            currentPrice: closeNumber.toFixed(5),
          };
const percentageChange = (target, close) => {
  if (isNaN(target) || isNaN(close)) {
    return "N/A";
  }
  return ((target - close) / close * 100).toFixed(2) + "%";
};

const emoji = (percentage) => {
  if (percentage === "N/A") {
    return "❓";
  }
  return percentage < 0 ? "📉" : "📈";
};

const achievedEmoji = (target) => {
  return target.achieved ? "✅" : "👁️‍🗨️";
};
          const stopLossIcon = closeNumber < stopLoss ? "❌❌🫷" : "📈";
          const message = `💠${symbol}💠\n\nEXCHANGE: BINANCE\n\nBuy Zone 1: ${formattedPrices.buyZoneStart1} - ${formattedPrices.buyZoneEnd1}\n\n💵|Sell Targets|:\n\n🎯|TP|1: ${formattedPrices.fib38} ${achievedEmoji(storedSignals[symbol].sellTargets.TP1)}\n🎯|TP|2: ${formattedPrices.fib50} ${achievedEmoji(storedSignals[symbol].sellTargets.TP2)}\n🎯|TP|3: ${formattedPrices.fib61} ${achievedEmoji(storedSignals[symbol].sellTargets.TP3)}\n🎯|TP|4: ${formattedPrices.fib78} ${achievedEmoji(storedSignals[symbol].sellTargets.TP4)}\n\nStop Loss: ${formattedPrices.stopLoss} ${stopLossIcon}\n\nCurrent Price: ${closeNumber.toFixed(5)} ${emoji(percentageChange(closeNumber, closeNumber))}`;

          telegramBot.sendMessage(chatId, message);
          /////

  // إعداد التقرير الكتابي
  const candlestickReport = `
    💠 إشارة للبيع: ${symbol} 💠

    EXCHANGE: BINANCE

    **معلومات الشمعة:**
    - الوقت: ${time}
    - السعر عند الفتح: ${open}
    - أعلى سعر: ${high}
    - أدنى سعر: ${low}
    - السعر عند الإغلاق: ${close}
    - حجم التداول: ${volume}
    - وقت الإغلاق: ${closeTime}
    - حجم الأصول: ${assetVolume}
    - عدد الصفقات: ${trades}
    - حجم الشراء الأساسي: ${buyBaseVolume}
    - حجم الشراء للأصول: ${buyAssetVolume}
    - تجاهل: ${ignored}

    **مستويات الفيبوناتشي:**
    - 23.6%: ${fibLevels.fib23}
    - 38.2%: ${fibLevels.fib38}
    - 50%: ${fibLevels.fib50}
    - 61.8%: ${fibLevels.fib61}
    - 78.6%: ${fibLevels.fib78}

    **حالة التداول:**
    - Buy Zone: ${formattedPrices.buyZoneStart1} - ${formattedPrices.buyZoneEnd1}
    - Stop Loss: ${formattedPrices.stopLoss} ${stopLossIcon}

    **أهداف البيع:**
    - TP1: ${formattedPrices.fib38} ${achievedEmoji(storedSignals[symbol].sellTargets.TP1)}
    - TP2: ${formattedPrices.fib50} ${achievedEmoji(storedSignals[symbol].sellTargets.TP2)}
    - TP3: ${formattedPrices.fib61} ${achievedEmoji(storedSignals[symbol].sellTargets.TP3)}
    - TP4: ${formattedPrices.fib78} ${achievedEmoji(storedSignals[symbol].sellTargets.TP4)}

    **حالة السوق الحالية:**
    - السعر الحالي: ${closeNumber.toFixed(5)}
    - التغيير في السعر: ${percentageChange(closeNumber, closeNumber)}
  `;

  // إرسال تقرير إلى المبرمج
  
  telegramBot.sendMessage(chatId, `📊 **تقرير حول تداول ${symbol}** 📊\n\n${candlestickReport}`);

          /////
        } else {
          console.log("لا إشارات");
          telegramBot.sendMessage(chatId, "لا توجد اي اشارة للبيع  💠" + symbol + "💠");
        }
      });
    }, index * 2000); // انتظر ثانيتين بين كل استدعاء للعملة
  });
}, 1000 * SECOND);

function calculateMovingAverage(price, period) {
  const prices = Array(period).fill(price);
  const sum = prices.reduce((acc, p) => acc + parseFloat(p), 0);
  return sum / period;
}

function calculateFibonacciLevels(high, low, close) {
  const fib23 = parseFloat(low) + (0.236 * (parseFloat(high) - parseFloat(low)));
  const fib38 = parseFloat(low) + (0.382 * (parseFloat(high) - parseFloat(low)));
  const fib50 = parseFloat(low) + (0.5 * (parseFloat(high) - parseFloat(low)));
  const fib61 = parseFloat(low) + (0.618 * (parseFloat(high) - parseFloat(low)));
  const fib78 = parseFloat(low) + (0.786 * (parseFloat(high) - parseFloat(low)));
  //
  const minfib23 = parseFloat(low) - (0.236 * (parseFloat(high) - parseFloat(low)));
  const minfib38 = parseFloat(low) - (0.382 * (parseFloat(high) - parseFloat(low)));
  const minfib50 = parseFloat(low) - (0.5 * (parseFloat(high) - parseFloat(low)));

  return {
    fib23,
    fib38,
    fib50,
    fib61,
    fib78,
    minfib38,
    minfib23,
    minfib50,
  };
}
