const express = require('express');

const axios = require('axios');
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require('qrcode');

const app = express();
app.use(express.json());
const port = 3000;

const stores =[];
const runClient=(store)=>{

 stores[store].on('message', async msg => {
    let chat = await msg.getChat();

    if (msg.body && !chat.isGroup/* === '!ping'*/) {
    //	console.log('MESSAGE RECEIVED', msg);
    
const callback = (response) => {
    response.json().then((data = []) => {
        msg.reply(data.text || "not text in data return ");
    });
};
//const axios = require('axios');
let data = JSON.stringify({
  "text": msg.body
});

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
  msg.reply(response.data.text || "not text in data return ");
  
})
.catch((error) => {
  console.log(error);
});
}
});

app.get('/logout/:store', (req, res) => {
	const {store }= req.params 
	if(stores[store]){
  stores[store].logout()
    .then(() => {
      console.log('Logged out successfully.');
    /*  server.close(() => {
        console.log('Server stopped.');
      });*/
      res.send('Logged out successfully.')
      stores[store]=null
      
    })
    .catch((error) => {
      console.error('Error logging out:', error);
      res.status(500).send('Error logging out');
    })
}  else res.send('not client whats found .');
});

app.get('/qrcode/:store', async (req, res) => {
	const {store }= req.params || "mujeeb";
	if(stores[store]){
	stores[store].logout()
	stores[store]=null;
	}
console.log({store})
   
   stores[store]= new Client({
  puppeteer: {
    args: ["--no-sandbox"],
    authStrategy: new LocalAuth()
  },})
  
  stores[store].initialize()
    let qr = await new Promise((resolve, reject) => {
        stores[store].once('qr', (qr) => resolve(qr))
    })
    console.log({qr})
    qrcode.toDataURL(qr, (err, url) => {
    res.send(`<img src="${url}" alt="QR Code" />`);
    runClient(store)
  })
  
})
app.post('/send-message', (req, res) => {
  const { to, message } = req.body;
  const chat = client.getChatById(to);
  chat.sendMessage(message);
  res.send('Message sent!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
