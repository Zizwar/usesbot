import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import { exec } from 'child_process';

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', update => {
        const { connection, qr, lastDisconnect } = update;
        if (qr) {
            qrcode.generate(qr, { small: true }); // Generate and display the QR code in terminal
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp(); // Reconnect on close
            }
        } else if (connection === 'open') {
            console.log('Connection opened!');
        }
    });

    sock.ev.on('messages.upsert', async m => {
        console.log(JSON.stringify(m, undefined, 2));

        const msg = m.messages[0];
        if (msg.key.fromMe || !msg.message) return;

        const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text;
        
        handleIncomingMessage(messageContent, msg.key.remoteJid, sock);
    });
}

function handleIncomingMessage(messageContent, remoteJid, sock) {
    if (!messageContent) return;

    if (messageContent.startsWith('$')) {
        handleTerminalCommand(messageContent.slice(1), remoteJid, sock);
    } else if (messageContent.startsWith('/')) {
        handleSunoCommand(messageContent.slice(1), remoteJid, sock);
    } else if (messageContent.startsWith('£')) {
        handleMathOperation(messageContent.slice(1), remoteJid, sock);
    } else {
        sock.sendMessage(remoteJid, { text: `Unknown command format` });
    }
}

function handleTerminalCommand(command, remoteJid, sock) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            sock.sendMessage(remoteJid, { text: `Error: ${error.message}` });
            return;
        }
        if (stderr) {
            sock.sendMessage(remoteJid, { text: `Stderr: ${stderr}` });
            return;
        }
        const output = stdout.split('\n').slice(-10).join('\n');
        sock.sendMessage(remoteJid, { text: `Output:\n${output}` });
    });
}

function handleSunoCommand(command, remoteJid, sock) {
    const [subCommand, ...args] = command.split(' ');
    if (subCommand === 'suno') {
        sock.sendMessage(remoteJid, { text: `You said: ${args.join(' ')}` });
    } else {
        sock.sendMessage(remoteJid, { text: `Unknown command: ${subCommand}` });
    }
}

function handleMathOperation(numberStr, remoteJid, sock) {
    const number = parseFloat(numberStr);
    if (!isNaN(number)) {
        const result = number * 2; // Example operation: multiply by 2
        sock.sendMessage(remoteJid, { text: `Result: ${result}` });
    } else {
        sock.sendMessage(remoteJid, { text: `Invalid number: ${numberStr}` });
    }
}

connectToWhatsApp();