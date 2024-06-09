
const streamifier = require('streamifier');
const whatsapp = require("wa-multi-session");
const gTTS = require('gtts');
const {
  toDataURL
} = require("qrcode");
const mp3Duration = require('mp3-duration');
const fs = require("fs");
const path = require("path");
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const OpenAI = require("openai");
const express = require('express');
//

const audioToText = require('./stt.js');
import { API_KEY_OPENAI, SYSTEM_PROMPT, COOKIE, SESS, adminGroupJid,NUMBER_PHONE_ADMIN } from "../../env.js";

const openai = new OpenAI({
  apiKey:API_KEY_OPENAI
});

const RAPPORT = false;
let TTS = true;





const app = express();
app.use(express.json());
const port = 81;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
//
const STATES = [];
const {
  log,
  info,
  table
} = console;
const states = {
  stores: {},
  config: {},
  tts:true,
  rapport:true,
};
const tickers = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'LTCUSDT', 'DOTUSDT', 'TRXUSDT'];

async function sendToGroup(text) {
  await whatsapp.sendTextMessage({
    sessionId: "admin",
    to: adminGroupJid,
    text,
    isGroup: true,
  });
}

let dataChart = [];
const listPrevCandle = {};

const WhatsappGlitchStart = async () => {
 await fetchCandlestickData();
  log(" loadSessionsFromStorage");
  const save_session = whatsapp.getSession("admin");
  const sessions = whatsapp.getAllSession();
  states.stores = sessions;
  const session = save_session || await whatsapp.startSession("admin");
  log({
    //session
  });
states.session = session;
states.sessions = sessions;
  const assistBot = async (msg = []) => {
    log("sudooo");
    const conversation = msg.message ? msg.message.conversation || msg.message.extendedTextMessage && msg.message.extendedTextMessage.text : null;
    log({
      conversation
    });

    if (conversation) {
      const {
        participant,
        sessionId
      } = msg;
      await whatsapp.sendTextMessage({
        sessionId: msg.sessionId,
        to: adminGroupJid,
        text: " Store: " + sessionId,
        isGroup: true,
        answering: msg,
      });
    }
    return null;
  };

  whatsapp.onMessageReceived(async (msg = []) => {
    const {
      message
    } = msg
    let textInput = message ? message.conversation ||
      message.extendedTextMessage &&
      message.extendedTextMessage.text : "";
    const audioMessage = message && message.audioMessage && message.audioMessage.url || null

    console.log(` ${JSON.stringify()} 
isfrom me: ${msg.key.fromMe} 
isgroup:${msg.key.isGroup} 
text:${textInput} >
audioMessage: ${audioMessage}`);
    ///
    let textOutput = '';
    const callback = async (textOutputAi) => {

      log("cb", textOutputAi);
      await whatsapp.readMessage({
    sessionId: msg.sessionId,
    key: msg.key,
  });
     
      if (states.tts) {
        //const gtts = new gTTS(textOutputAi, "ar");
        const time = Date.now();
        const outputMp3 = "./tts/nn" + time + '.mp3';
        const outputOgg = "./tts/nn" + time + '.ogg';

const {
          buffer,
          diration
        } = await tts(textOutputAi);
    
        const stream = streamifier.createReadStream(buffer);
        
     ffmpeg(stream)
            .toFormat('ogg')
            .audioCodec('libopus')
            .on('end', async () => {
            	await whatsapp.sendTyping({
        sessionId: msg.sessionId,
        to: msg.key.remoteJid,
        diration: diration*900
      });
            	await sleep(diration*800);
              const send = await whatsapp.sendVoiceNote({
                sessionId: msg.sessionId,
                to: msg.key.remoteJid,
           //     isGroup: true,
                answering: msg,
                media: outputOgg,
              });

              await sleep(10000);
              await whatsapp.sendTextMessage({
                sessionId: msg.sessionId,
                to: msg.key.remoteJid,
           //     isGroup: true,
                answering: msg,
                text:textOutputAi,
                
              });
           await sleep(1000);   
      //  if(states.resText)
      if(states.rapport)
      whatsapp.sendTextMessage({
         //       sessionId: msg.sessionId,
         sessionId: "admin",
         to: adminGroupJid,
     //  to: msg.key.remoteJid,
                text: `Input:
${textOutput}
--
textOutputAi:
${textOutputAi}
`,
               isGroup: true,
                answering: msg,
              });
            })
            .on('error', (err) => {
              console.error('Error converting audio:', err);
            })
            .save(outputOgg);
        
      }
      if (states.rapport)
        whatsapp.sendTextMessage({
          sessionId: "admin",
          to: adminGroupJid,
          text: inspectMsg(msg),
          isGroup: true,
          answering: msg,
        });
    };

    //
    if (audioMessage && !msg.key.fromMe) {
      try {

         textOutput = await audioToText(msg);
        log("transcri^top,=", {
          textOutput
        })
        if (textOutput)
          getGpt({
            store: msg.sessionId,
            prompt: states.stores[msg.sessionId] ? states.stores[msg.sessionId].prompt : null,
            text: textOutput,
          }, callback);

        //console.log('Transcription:', text);
      } catch (error) {
        console.error('Failed to transcribe audio:', error);
      }

    }


    if (textInput && textInput.includes(NUMBER_PHONE_ADMIN)) {

      textInput = textInput.replace(NUMBER_PHONE_ADMIN, "")
      getGpt({
        store: msg.sessionId,
        prompt: states.stores[msg.sessionId] ? states.stores[msg.sessionId].prompt : null,
        text: textInput,
      }, callback);

    }

  })
};
WhatsappGlitchStart();

function getGpt({
  store,
  text,
  prompt
}, callback) {
  log("stargpt fn");
if(states.inactiveGpt) return;
  const listPrevCandleStringify = JSON.stringify(listPrevCandle);

  const data = JSON.stringify({
    text,
    prompt,
    system: (states.system || SYSTEM_PROMPT)+ listPrevCandleStringify
  });
  log({data});

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${BASE_URL_MOJOLAND}/api/gptino`,
    headers: {
      'Content-Type': 'application/json'
    },
    data
  };

  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      const text = response.data.text || "not text in data return ";
      callback(text);
    })
    .catch((error) => {
      console.log(error);
    });
}

async function fetchCandlestickData() {
  try {
    const interval = states.interval || '4h';
    const currentTime = Math.floor(Date.now() / 1000);
    const fourHoursAgo = currentTime - (4 * 60 * 60);

    const requests = tickers.map(ticker => {
      return axios.get(`https://api.binance.com/api/v3/klines?symbol=${ticker}&interval=${interval}&startTime=${(fourHoursAgo - (4 * 60 * 60)) * 1000}&endTime=${fourHoursAgo * 1000}`);
    });

    const responses = await Promise.all(requests);
    const candlestickData = responses.map(response => response.data);
    processCandlestickData(candlestickData);
  } catch (error) {
    console.error('Error occurred while fetching candlestick data:', error);
  }
}

function processCandlestickData(data) {
  data.forEach(async (candlestick, index) => {
    const symbol = tickers[index];
    console.log('Candlestick data for currency:', tickers[index]);
    console.log('------------------------');
    let low, high, close, open, time;
    candlestick.forEach(candle => {
      low = candle[3];
      high = candle[2];
      close = candle[4];
      open = candle[1];
      time = new Date(candle[0]).toLocaleString();
    });

    const kline = {
      symbol,
      low,
      high,
      close,
      open,
      time
    };
    const goldLine = ((+close) + (+open) + (+high)) / 3;
    listPrevCandle[symbol] = kline;
    listPrevCandle[symbol].goldLine = goldLine
 console.log(listPrevCandle[symbol])
 });
}

async function tts(input) {
  if (!input) return false;

  const time = Date.now();
  const speechFile = path.resolve(`./tts/speech-${time}.mp3`);

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice://"shimmer", 
"alloy",
    input,
  });

  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());

  try {
    const duration = await mp3Duration(buffer);
    console.log({
      duration
    });
    return {
      buffer,
      duration: duration 
    };
  } catch (error) {
    console.error('Error getting MP3 duration:', error);
    return {
      buffer,
      duration: 5
    };
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isExistText(text = "", value = "") {
  return text.replaceAll(value, "")
}
//
function inspectMsg(msg={}) {
    // Extracting important variables with optional chaining
    const importantData = {
        remoteJid: msg?.key?.remoteJid,
        participant: msg?.key?.participant,
        pushName: msg?.pushName,
        messageTimestamp: msg?.messageTimestamp,
        audioMessage: msg?.message?.audioMessage ? {
            url: msg.message.audioMessage.url,
            mimetype: msg.message.audioMessage.mimetype,
            fileLength: msg.message.audioMessage.fileLength,
            seconds: msg.message.audioMessage.seconds,
            ptt: msg.message.audioMessage.ptt
        } : null
    };

    return JSON.stringify(importantData);
}
//
app.get('/send', async (req, res, next) => {
  try {
    const { number = '', text = 'سلام', isgroup = 'false' } = req.query;

    if (!number) {
      return res.status(400).json({
        error: "رقم الهاتف مطلوب!"
      });
    }

    const isGroup = isgroup.toLowerCase() === 'true';
   // const encodedText = encodeURIComponent(text);

    const data = await whatsapp.sendTextMessage({
      sessionId: "admin",
      to: number + "@s.whatsapp.net",
      text,
      isGroup: isGroup,
    });

    if (data) {
      res.status(200).json({
        data
      });
    } else {
      throw new Error("فشل إرسال الرسالة");
    }
  } catch (error) {
    next(error);
  }
});
//
