const express = require('express');
//const fetch = require('node-fetch'); 
const axios = require('axios');
const {
  Client,
  LocalAuth
} = require("whatsapp-web.js");
const qrcodeImg = require('qrcode');
const qrcode = require('qrcode-terminal');
const app = express();
app.use(express.json());
const port = 80;

const stores = [];
const assistance = (msg) => {
  msg.reply("you are admin, here all json msg.." + JSON.stringify(msg))
  return null

}

//
const adminClient = new Client({
  puppeteer: {
    args: ["--no-sandbox"],
    authStrategy: new LocalAuth({clientId:"admin"})
  },
})


adminClient.on('qr', qr => {
  qrcode.generate(qr, {
    small: true
  });
});

adminClient.on("ready", () => {

});
adminClient.once('qr', (qr) => console.log({
  qr
}))
adminClient.on('message', msg => {
  console.log("msg", msg.body);
  if (msg.body == '!ping') {
    msg.reply('pong');
  }
});
adminClient.on('authenticated', () => {
  console.log('AUTHENTICATED');
});

adminClient.on('auth_failure', msg => {
  // Fired if session restore was unsuccessful
  console.error('AUTHENTICATION FAILURE', msg);
});
adminClient.initialize();
//

const runClient = (store) => {


  stores[store].on('message', async msg => {
    console.log('MESSAGE RECEIVED', msg);
    if (msg.body && msg.body.includes("$") && (msg.from === "2126xxxxx@c.us" || msg.from === "9665xxxxxx@c.us"))
      return assistance(msg)

    let chat = await msg.getChat();

    if (msg.body && !chat.isGroup /* === '!ping'*/ ) {

      //const axios = require('axios');
      let data = JSON.stringify({
        "text": msg.body
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://mammaia.com/api/' + store + '?token=000000',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      axios.request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data));
          msg.reply(response.data.text || "not text in data return ");

        })
        .catch((error) => {
          console.log(error);
        });
      ///

      //
      ///////
      ///msg.reply("pong express store is:"+store)
    }
  });
  //

}

///
app.get('/list', (req, res) => {
  res.send(JSON.stringify(stores))
})
///

app.get('/logout/:store', (req, res) => {
  const {
    store
  } = req.params
  if (stores[store]) {
    stores[store].logout()
      .then(() => {
        console.log('Logged out successfully.');
        /*  server.close(() => {
            console.log('Server stopped.');
          });*/
        res.send('Logged out successfully.')
        stores[store] = null

      })
      .catch((error) => {
        console.error('Error logging out:', error);
        res.status(500).send('Error logging out');
      })
  } else res.send('not client whats found .');
});
// Express Middleware

//
app.get('/qrcode/:store', async (req, res) => {
  const {
    store
  } = req.params || "mujeeb";
  if (stores[store]) {
    stores[store].logout()
    stores[store] = null;
  }
  //	const store = "mujeeb";
  console.log({
    store
  })
  // const client = new Client(...)

  stores[store] = new Client({
    puppeteer: {
      args: ["--no-sandbox"],
      authStrategy: new LocalAuth()
    },
  })

  stores[store].initialize()
  let qr = await new Promise((resolve, reject) => {
    stores[store].once('qr', (qr) => resolve(qr))
  })
  console.log({
    qr
  })
  qrcodeImg.toDataURL(qr, (err, url) => {
    res.send(`<img src="${url}" alt="QR Code" />`);
    runClient(store)
  })


  //res.send(qr)
})



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

  // Connect to WhatsApp Web

});