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
const mainCurrencies = [
  "BTC",
  "ETH",
  "LTC",
  "XRP",
  "TRX",
  "BNB",
  "BAT",
  "DOGE",
  "WING",
  "VITE",
  "JTO",
  "EOS",
  "USTC",
  "AVAX",
  "CYBER",
];



const START_MSG =
  "بوت التداول مستعد للاعتماد على المتوسط البسيط 100 على 20، وتحقيق الأرباح باستخدام تقنية الفيبوناتشي على خمس مراحل. يحلل شموع 30 دقيقة، ويتحقق من الإشارات كل 5 دقائق. 📊🤖";

const SECOND = 60 * 1; // 1 = 1second
const levelFibo = 0.618;

console.log("start bot");

// Object to store signals
const storedSignals = {};
//
const sendMessage = (text, props = []) => {
  const { method, symbol, messageEdit } = props;
  //
  const reply_to_message_id =
    method === "get" ? storedSignals[symbol].reply_to_message_id : null;
  telegramBot
    .sendMessage(TELEGRAM_CHAT_ID, text, { reply_to_message_id })
    .then((sentMessage) => {
      const messageId = sentMessage.message_id;
      console.log("تم إرسال الرسالة، وmessageId هو:", messageId);
      if (method === "set")
        storedSignals[symbol].reply_to_message_id = messageId;
    })
    .catch((error) => console.error("حدث خطأ:", error));
  //
  if (reply_to_message_id && messageEdit)
    telegramBot.editMessageText(messageEdit, {
      chat_id: TELEGRAM_CHAT_ID,
      message_id: reply_to_message_id,
    });
  //
  return;
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "http://mammaia.com:82/send-message",
    headers: {
      "Content-Type": "application/json",
    },
    data: { text, symbol, method },
  };
  axios(onfig)
    .then((response) => {
      console.log(response.data);
      //if(callback)
      // callback(response.data);
      // const text = response.data.text || "not text in data return ";
    })
    .catch((error) => {
      console.log(error);
    });
  //	axios.get("http://mammaia.com:81/send-message?text="+encodeURIComponent(text));
};
const emoji = (percentage) => {
  if (percentage === "N/A") {
    return "❓";
  }
  return percentage < 0 ? "📉" : "📈";
};

const achievedEmoji = (target) => {
  return target.achieved ? "✅" : "⏱️";
};
const percentageChange = (target, close) => {
  if (isNaN(target) || isNaN(close)) {
    return "N/A";
  }
  return (((target - close) / close) * 100).toFixed(2) + "%";
};
//
sendMessage(START_MSG);
setInterval(() => {
  mainCurrencies.forEach((currency, index) => {
    setTimeout(() => {
      const symbol = currency + "USDT";
      binance.candlesticks(symbol, "30m", (error, ticks, symbol) => {
        if (error) throw error;

        let last_tick = ticks[ticks.length - 1];
        let [
          time,
          open,
          high,
          low,
          close,
          volume,
          closeTime,
          assetVolume,
          trades,
          buyBaseVolume,
          buyAssetVolume,
          ignored,
        ] = last_tick;

        console.log(symbol + " آخر إغلاق: " + close);

        const shortMA = calculateMovingAverage(close, 20);
        const longMA = calculateMovingAverage(close, 100);

        const closeNumber = parseFloat(close);
        let isModifed = false;
        if (storedSignals[symbol]) {
          const closeNumber = storedSignals[symbol].currentPrice;
          let stopLossIcon = "";
          if (
            close > storedSignals[symbol].sellTargets.TP1.price &&
            !storedSignals[symbol].sellTargets.TP1.achieved
          ) {
            storedSignals[symbol].sellTargets.TP1.achieved = true;
            isModifed = true;
          }
          if (
            close > storedSignals[symbol].sellTargets.TP2.price &&
            !storedSignals[symbol].sellTargets.TP2.achieved
          ) {
            storedSignals[symbol].sellTargets.TP2.achieved = true;
            isModifed = true;
          }
          if (
            close > storedSignals[symbol].sellTargets.TP3.price &&
            !storedSignals[symbol].sellTargets.TP3.achieved
          ) {
            storedSignals[symbol].sellTargets.TP3.achieved = true;
            isModifed = true;
          }
          if (
            close > storedSignals[symbol].sellTargets.TP4.price &&
            !storedSignals[symbol].sellTargets.TP4.achieved
          ) {
            storedSignals[symbol].sellTargets.TP4.achieved = true;
            storedSignals[symbol].gool = true;
            isModifed = true;
          }
          if (close < storedSignals[symbol].stopLoss) {
            storedSignals[symbol].stop = true;
            stopLossIcon = "❌❌🫷";
            isModifed = true;
          }
          let statusIcon = "⏱️👌";
          if (storedSignals[symbol].stop) statusIcon = "😡🛑❌";
          if (storedSignals[symbol].gool) statusIcon = "🥳🎯🫰👊";
          const { formattedPrices } = storedSignals[symbol];
          const message = `🙋💠${symbol}💠\n\nEXCHANGE: BINANCE\n  ℹ️ Status: ${statusIcon} \n\nBuy Zone: ${
            formattedPrices.buyZoneStart1
          } - ${formattedPrices.buyZoneEnd1}\n\n💵|Sell Targets|:\n\n🎯|TP|1: ${
            formattedPrices.fib38
          } ${achievedEmoji(storedSignals[symbol].sellTargets.TP1)}\n🎯|TP|2: ${
            formattedPrices.fib50
          } ${achievedEmoji(storedSignals[symbol].sellTargets.TP2)}\n🎯|TP|3: ${
            formattedPrices.fib61
          } ${achievedEmoji(storedSignals[symbol].sellTargets.TP3)}\n🎯|TP|4: ${
            formattedPrices.fib78
          } ${achievedEmoji(
            storedSignals[symbol].sellTargets.TP4
          )}\n\nStop Loss: ${
            formattedPrices.stopLoss
          } ${stopLossIcon}\n\n Price: ${closeNumber} \n\n Price Now: ${parseFloat(
            close
          ).toFixed(5)} ${emoji(percentageChange(closeNumber, closeNumber))}`;
          const messageEdit = `ℹ️ Status: ${statusIcon} \n🎯|TP|1: ${
            formattedPrices.fib38
          } ${achievedEmoji(storedSignals[symbol].sellTargets.TP1)}\n🎯|TP|2: ${
            formattedPrices.fib50
          } ${achievedEmoji(storedSignals[symbol].sellTargets.TP2)}\n🎯|TP|3: ${
            formattedPrices.fib61
          } ${achievedEmoji(storedSignals[symbol].sellTargets.TP3)}\n🎯|TP|4: ${
            formattedPrices.fib78
          } ${achievedEmoji(storedSignals[symbol].sellTargets.TP4)}\n🔐|SL|: ${
            formattedPrices.stopLoss
          } ${stopLossIcon}\n Price: ${closeNumber} \nPNow: ${parseFloat(
            close
          ).toFixed(5)} ${emoji(percentageChange(closeNumber, closeNumber))}`;

          if (isModifed)
            sendMessage(message, { symbol, messageEdit, method: "get" });
          else console.log("مازالت العملة تحت المراقبة لتحقيق الشروط" + symbol);
          // sendMessage( "مازالت العملة تحت المراقبة لتحقيق الشروط"+symbol);
          if (storedSignals[symbol].stop || storedSignals[symbol].gool)
            storedSignals[symbol] = null;
        }
        if (shortMA < longMA && !storedSignals[symbol]) {
          console.log("إشارة للبيع");

          const fibLevels = calculateFibonacciLevels(high, low, close);

          const buyZoneStart1 = close - 0.002;
          const buyZoneEnd1 = close + 0.002;
          const stopLossPercentage = 0.035; // 3.5% stop loss
          const stopLoss = parseFloat(
            close - close * stopLossPercentage
          ).toFixed(5);
          // console.log({ stopLoss });

          const formattedPrices = {
            buyZoneStart1: parseFloat(close).toFixed(5),
            buyZoneEnd1: isNaN(fibLevels.minfib23)
              ? "N/A"
              : fibLevels.minfib23.toFixed(5),
            stopLoss, //: isNaN(fibLevels.minfib50) ? "N/A" : fibLevels.minfib50.toFixed(5),
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
            formattedPrices,
          };
          const stopLossIcon = "🔐";

          const message = `💠${symbol}💠\n\nEXCHANGE: BINANCE\n\nBuy Zone 1: ${
            formattedPrices.buyZoneStart1
          } - ${formattedPrices.buyZoneEnd1}\n\n💵|Sell Targets|:\n\n🎯|TP|1: ${
            formattedPrices.fib38
          } ${achievedEmoji(storedSignals[symbol].sellTargets.TP1)}\n🎯|TP|2: ${
            formattedPrices.fib50
          } ${achievedEmoji(storedSignals[symbol].sellTargets.TP2)}\n🎯|TP|3: ${
            formattedPrices.fib61
          } ${achievedEmoji(storedSignals[symbol].sellTargets.TP3)}\n🎯|TP|4: ${
            formattedPrices.fib78
          } ${achievedEmoji(
            storedSignals[symbol].sellTargets.TP4
          )}\n\nStop Loss: ${
            formattedPrices.stopLoss
          } ${stopLossIcon}\n\nCurrent Price: ${closeNumber.toFixed(5)} ${emoji(
            percentageChange(closeNumber, closeNumber)
          )}`;
          const callback = (data) => {
            return;
          };
          sendMessage(message, { symbol, method: "set" });
        } else {
          console.log("لا إشارات");
          // sendMessage( "لا توجد اي اشارة للبيع  💠" + symbol + "💠");
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
  const fib23 =
    parseFloat(high) +
    (0.236 + levelFibo * 2) * (parseFloat(high) - parseFloat(low));
  const fib38 =
    parseFloat(high) +
    (0.382 + levelFibo * 3) * (parseFloat(high) - parseFloat(low));
  const fib50 =
    parseFloat(high) +
    (0.5 + levelFibo * 4) * (parseFloat(high) - parseFloat(low));
  const fib61 =
    parseFloat(high) +
    (0.618 + levelFibo * 5) * (parseFloat(high) - parseFloat(low));
  const fib78 =
    parseFloat(high) +
    (0.786 + levelFibo * 6) * (parseFloat(high) - parseFloat(low));
  //
  const minfib23 =
    parseFloat(low) -
    (0.236 + levelFibo * 2) * (parseFloat(high) - parseFloat(low));
  const minfib38 =
    parseFloat(low) -
    (0.382 + levelFibo * 3) * (parseFloat(high) - parseFloat(low));
  const minfib50 =
    parseFloat(low) -
    (0.5 + levelFibo * 4) * (parseFloat(high) - parseFloat(low));

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
