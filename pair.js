import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import pino from "pino"
import fs from "fs"
import readline from "readline"

const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
})

async function startPair() {

if (!fs.existsSync("./auth")) fs.mkdirSync("./auth")

const { state, saveCreds } = await useMultiFileAuthState("./auth")

const sock = makeWASocket({
logger: pino({ level: "silent" }),
auth: state
})

rl.question("Enter WhatsApp number (255xxxxxxxxx): ", async (number) => {

const code = await sock.requestPairingCode(number)

console.log("\nPAIRING CODE:\n")
console.log(code)

})

sock.ev.on("creds.update", async () => {

await saveCreds()

const creds = fs.readFileSync("./auth/creds.json")

const session = "NEW-MD;;;=>" + Buffer.from(creds).toString("base64")

console.log("\nSESSION_ID:\n")
console.log(session)

})

}

startPair()
