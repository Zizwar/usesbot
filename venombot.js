import { create, Whatsapp } from 'venom-bot';
import { exec } from 'child_process';

async function start(client: Whatsapp) {
    client.onMessage(async message => {
        if (message.isGroupMsg === false) {
            handleIncomingMessage(message.body, message.from, client);
        }
    });
}

function handleIncomingMessage(messageContent, remoteJid, client) {
    if (!messageContent) return;

    if (messageContent.startsWith('$')) {
        handleTerminalCommand(messageContent.slice(1), remoteJid, client);
    } else if (messageContent.startsWith('/')) {
        handleSunoCommand(messageContent.slice(1), remoteJid, client);
    } else if (messageContent.startsWith('£')) {
        handleMathOperation(messageContent.slice(1), remoteJid, client);
    } else {
        client.sendText(remoteJid, `Unknown command format`);
    }
}

function handleTerminalCommand(command, remoteJid, client) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            client.sendText(remoteJid, `Error: ${error.message}`);
            return;
        }
        if (stderr) {
            client.sendText(remoteJid, `Stderr: ${stderr}`);
            return;
        }
        const output = stdout.split('\n').slice(-10).join('\n');
        client.sendText(remoteJid, `Output:\n${output}`);
    });
}

function handleSunoCommand(command, remoteJid, client) {
    const [subCommand, ...args] = command.split(' ');
    if (subCommand === 'suno') {
        client.sendText(remoteJid, `You said: ${args.join(' ')}`);
    } else {
        client.sendText(remoteJid, `Unknown command: ${subCommand}`);
    }
}

function handleMathOperation(numberStr, remoteJid, client) {
    const number = parseFloat(numberStr);
    if (!isNaN(number)) {
        const result = number * 2; // Example operation: multiply by 2
        client.sendText(remoteJid, `Result: ${result}`);
    } else {
        client.sendText(remoteJid, `Invalid number: ${numberStr}`);
    }
}

create()
    .then(client => start(client))
    .catch(error => console.log(error));