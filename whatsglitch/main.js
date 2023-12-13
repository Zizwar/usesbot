const whatsapp = require("wa-multi-session");
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const {log,error,info,table}=console ;
const prompts ={}
const WhatsappGlitch = async()=>{
//	whatsapp.loadSessionsFromStorage()
const save_session = whatsapp.getSession("mujeeb");
// returning session data
log({save_session})
// create session with ID : mysessionid

const session = save_session || await whatsapp.startSession("mujeeb");
log({session})
// Then, scan QR on terminal
const sessions = whatsapp.getAllSession();
log({sessions})
// returning all session ID that has been created
//qrcode.generate(qr, {small: true});
//
whatsapp.onMessageReceived((msg) => {
 
 console.log(`New Message Received On Session: ${msg.sessionId} >isfrom me: ${msg.fromMe} >isgroup:${msg.isGroup} ${msg.sessionId} >`, msg.message);

const callback= (text) =>{
	log("cb",text)
 whatsapp.sendTextMessage({
    sessionId: msg.sessionId,
    to: msg.key.remoteJid,
    text,
    isGroup:false,
    answering: msg, // for quoting message
  });
  }
  if(msg.message && msg.message.conversation.includes("$$"))
  getGpt({store:msg.sessionId,prompt: prompts[msg.sessionId], message: msg.message}, callback)
});

}
WhatsappGlitch()
//
function getGpt({store,message, prompt},callback){
log("stargpt fn")
let data = JSON.stringify({
  "text": message ? message.conversation: null,
  prompt,
  
});
log({data})
let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://mammaia.com/api/'+store+'?token=000000',
  headers: { 
    'Content-Type': 'application/json'
  },
  data : data
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