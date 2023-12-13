const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require('qrcode-terminal');
const express = require('express');
//
const app = express();
app.use(express.json());
const port = 82;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
//
const {
  log,
  info,
  table
} = console;
const client = new Client({
  puppeteer: {
    args: ["--no-sandbox"],
    authStrategy: new LocalAuth({clientId:"admin"})
  },
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on("ready",async () => {
  console.log("Client is ready!");
  return;
  const msg = "ya salam"
  const myChannelId = (await client.createChannel('MyChannel'))?.nid._serialized;
  console.log('id channel',myChannelId)
if (myChannelId) {
    const sentMsg = await client.sendMessage(myChannelId, msg);
    console.log(sentMsg);
}
});
const answers =[];
app.post('/send-message', async (req, res,next) => {

	const {text,symbol,method}= req.body ;
const channelId = "1203632070913557812323@newsletter";//"12036320412111470026000@newsletter";
const reswats = await client.sendMessage(channelId, text);
      res.json({answering:reswats})
      log("whtsrep",reswats)

      })
client.on('message', msg => {
	
  console.log("~message~",msg.body)
    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});
client.initialize();
