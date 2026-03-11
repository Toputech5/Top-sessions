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
auth: state,
printQRInTerminal: false
})

sock.ev.on("connection.update", async (update) => {

const { connection } = update

if (connection === "open") {
console.log("✅ WhatsApp Connected")
}

})

rl.question("Enter WhatsApp number (255xxxxxxxxx): ", async (number) => {

try {

const cleanNumber = number.replace(/[^0-9]/g, "")

const code = await sock.requestPairingCode(cleanNumber)

console.log("\n🔑 PAIRING CODE:\n")
console.log(code)

} catch (err) {

console.log("❌ Failed to generate pairing code")

}

})

sock.ev.on("creds.update", async () => {

await saveCreds()

const creds = fs.readFileSync("./auth/creds.json")

const session = "NEW-MD;;;=>" + Buffer.from(creds).toString("base64")

console.log("\n📌 SESSION_ID:\n")
console.log(session)

})

}

startPair()
