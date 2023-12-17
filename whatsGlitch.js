const whatsapp = require("wa-multi-session");

const {
  toDataURL
} = require("qrcode");

//const qrcode = require('qrcode-terminal');
const axios = require('axios');
const express = require('express');
//
const app = express();
app.use(express.json());
const port = 81;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
//
const {
  log,
  info,
  table
} = console;

const states = {
  stores: {},
  config: {}
}
app.get('/all', async (req, res, next) => {
  try {


    res.status(200).json({
      stores: whatsapp.getAllSession()
    });
  } catch (error) {
    next(error);
  }

})
app.get('/delete/:store', async (req, res, next) => {
  try {
    const {
      store
    } = req.params || "mujeeb";
    whatsapp.deleteSession(store);
    res
      .status(200)
      .send("Success Deleted " + store)
    if (states.stores[store])
      delete states.stores[store]
  } catch (error) {
    next(error);
  }

})
app.get('/create/:store', async (req, res) => {

  try {
    const {
      store
    } = req.params || "mujeeb";
    log('creaet,', store)
    whatsapp.onQRUpdated(async (data) => {
      log('onqrcode,', data)
      if (!states.stores[store]) {
        const qr = await toDataURL(data.qr);
        if (data.sessionId == store) {
          res.send(`<img width="90%" src="${qr}" alt="QR Code" />`);
        } else {
          res.status(200).json({
            qr: data.qr,
          });
        }
      }
    });
    await whatsapp.startSession(store, {
      printQR: true
    });
  } catch (error) {
    next(error);
  }
})
const WhatsappGlitchStart = async () => {
  whatsapp.loadSessionsFromStorage()
  log(" loadSessionsFromStorage")
  const save_session = whatsapp.getSession("admin");
  states.save_session = save_session;
  // returning session data
  //log({save_session})
  // create session with ID : mysessionid

  const session = save_session || await whatsapp.startSession("admin");
  log({
    session
  })
  // Then, scan QR on terminal
  //const sessions = whatsapp.getAllSession();
  //log({  sessions  })
  // returning all session ID that has been created
  //qrcode.generate(qr, {small: true});
  //
  const assistBot = (msg) => {
    const conversation = msg.message && msg.message.conversation
    if (!conversation.includes("$sudo ")) return null;
    whatsapp.sendTextMessage({
      sessionId: msg.sessionId,
      to: msg.key.remoteJid,
      text: JSON.stringify(msg),
      isGroup: true,
      answering: msg, // for quoting message
    });

    return null;
  }
  whatsapp.onMessageReceived((msg) => {

    console.log(`New Message Received On Session: ${msg.sessionId} >isfrom me: ${msg.fromMe} >isgroup:${msg.isGroup} ${msg.sessionId} >`, msg.message);
    if (msg.sessionId === "admin") {
      return assistBot();
    }

    const callback = (text) => {
      log("cb", text)
      whatsapp.sendTextMessage({
        sessionId: msg.sessionId,
        to: msg.key.remoteJid,
        text,
        isGroup: false,
        answering: msg, // for quoting message
      });
    }
    if (msg.message && msg.message.conversation.includes("wino"))
      getGpt({
        store: msg.sessionId,
        prompt: states.stores[msg.sessionId] ? states.stores[msg.sessionId].prompt : null,
        message: msg.message
      }, callback)
  });
  whatsapp.onConnected((sessionId) => {
    states.stores[sessionId].exist = true;
    console.log("session connected :" + sessionId);

  });
}
WhatsappGlitchStart();

//
function getGpt({
  store,
  message,
  prompt
}, callback) {
  log("stargpt fn")
  let data = JSON.stringify({
    "text": message ? message.conversation : null,
    prompt,

  });
  log({
    data
  })
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://msn.so/api/' + store + '?token=xxxx',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };

  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      const text = response.data.text || "not text in data return ";
      callback(text)
    })
    .catch((error) => {
      console.log(error);
    });
}
