import whatsapp from "wa-multi-session";
import { exec } from "child_process";

const { log } = console;

// States to manage session data
const states = {
  stores: {},
  config: {},
};

const adminGroupJid = "12036328122653714823@g.us"; // Group log
const ADMIN_NUMBER = "21264818823181";
const active_admin_number = true;

// Initialize WhatsApp session
async function WhatsappGlitchStart() {
  log("loadSessionsFromStorage");
  const save_session = whatsapp.getSession("admin");
  const sessions = whatsapp.getAllSession();
  states.stores = sessions;

  const session = save_session || (await whatsapp.startSession("admin"));
  log({ session });

  whatsapp.onMessageReceived(async (msg) => {
    log({ msg });
    if (
      active_admin_number &&
      msg.key.remoteJid === `${ADMIN_NUMBER}@s.whatsapp.net`
    ) {
      const textIn = extractTextFromMessage(msg);
      log({ textIn });
      if (textIn.startsWith("$")) {
        const command = textIn.substring(1).trim();
        return await handleTerminalCommand(msg, command);
      }
    }
  });
}

// Extract text from a message
function extractTextFromMessage(msg) {
  const { message } = msg;
  return message?.conversation || message?.extendedTextMessage?.text || "";
}

// Handle terminal command
async function handleTerminalCommand(msg, command) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return sendToGroup(`Error: ${error.message}`, msg.key.remoteJid);
    }
    if (stderr) {
      return sendToGroup(`Stderr: ${stderr}`, msg.key.remoteJid);
    }

    const output = stdout.split("\n").slice(-5).join("\n");
    sendToGroup(`Output:\n${output}`, msg.key.remoteJid);
  });
}

// Function to send messages to a group
async function sendToGroup(text, to = adminGroupJid) {
  const options = { sessionId: "admin", to, text };
  return whatsapp.sendTextMessage(options);
}

WhatsappGlitchStart();
