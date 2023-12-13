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
const adminGroupJid = "2600120363128154652876223@g.us";

async function sendToGroup(text){
    await whatsapp.sendTextMessage({
        sessionId: "admin",
      to: adminGroupJid,
        text,
        isGroup: true,
      });
  }
app.get('/all', async (req, res, next) => {
  try {
  	const stores = whatsapp.getAllSession(); 
sendToGroup("all stores: "+JSON.stringify(stores))

    res.status(200).json({
      stores
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
      sendToGroup("❌deleted store #"+ store)
  } catch (error) {
    next(error);
  }

})
const answers =[];
app.post('/send-message', async (req, res,next) => {
  /*
const message = {
  text: "This is a template message",
  templateButtons: [
    { index: 1, urlButton: { displayText: "Visit website", url: "https://google.com" } },
    { index: 2, callButton: { displayText: "Call us", phoneNumber: "+1234567890" } },
  ],
};
//
await whatsapp.sendTextMessage({
        sessionId: "admin",
      to: adminGroupJid,
        text:message,
        isGroup: true,
      });
      */
	const {text,symbol,method}= req.body ;
const answering= method==="get" ?answers[symbol]:null;
///
const reswats = await whatsapp.sendTextMessage({
        sessionId: "admin",
      to: adminGroupJid,
        text,
        isGroup: true,
  answering, // for quoting message
      });
      if(method==="set")
      answers[symbol]=reswats;
      res.json({answering:reswats})
      log("whtsrep",reswats)
      return;
      
      })
      
  
app.get('/create/:store', async (req, res,next) => {
return;
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
          res.send(`<img width="50%" src="${qr}" alt="QR Code" />`);
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
    sendToGroup("store created 🥳 #"+ store)
  } catch (error) {
    next(error);
    sendToGroup("error created store : "+ store)
  }
})
const WhatsappGlitchStart = async () => {
   //whatsapp.loadSessionsFromStorage()
  log(" loadSessionsFromStorage")
  const save_session = whatsapp.getSession("admin");
  const sessions = whatsapp.getAllSession()
  states.stores = sessions;
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
  const assistBot = async (msg=[]) => {
    log("sudooo") 
    const conversation = msg.message ? msg.message.conversation :null
//    if (!conversation.includes("$sudo")) return null;
    log({conversation})

  
if(conversation){
	const {participant, sessionId}=msg;
   await whatsapp.sendTextMessage({
      sessionId: msg.sessionId,
      to: adminGroupJid,//msg.key.remoteJid,
      text:" Store: "+ sessionId,
      isGroup: true,
     answering: msg, // for quoting message
    });
    }
    return null;
  }
  
  whatsapp.onMessageReceived((msg) => {

    console.log(`New Message Received On Session: ${msg.sessionId} >isfrom me: ${msg.fromMe} >isgroup:${msg.isGroup} ${msg.sessionId} >`, msg.message);
    if (msg.sessionId === "admin") {
      assistBot(msg);
      return
    }

//
    const callback = (text) => {
      log("cb", text)
     whatsapp.sendTextMessage({
        sessionId: msg.sessionId,
        to: msg.key.remoteJid,
        text,
        isGroup: false,
        answering: msg, // for quoting message
      });
      return;
      //log to admin
      whatsapp.sendTextMessage({
        sessionId: "admin",
      to: adminGroupJid,
        text:text+"©from :"+msg.key.remoteJid+" ,  store :"+msg.sessionId+"®",
        isGroup: true,
        answering: msg, // for quoting message
      });
    }
    if (msg.message && msg.message.conversation.includes("$gpt"))
      getGpt({
        store: msg.sessionId,
        prompt: states.stores[msg.sessionId] ? states.stores[msg.sessionId].prompt : null,
        message: msg.message
      }, callback)
  });
  /*
  whatsapp.onConnected((sessionId) => {
    //  states.stores[sessionId] && (states.stores[sessionId].exist = true)
    console.log("session connected :" + sessionId);

  });
  */
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
    url: 'https://mammaia.com/api/'+store+'?token=000000',
    headers: {
      'Content-Type': 'application/json'
    },
    data
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