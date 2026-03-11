import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import pino from "pino"
import fs from "fs"
import readline from "readline"

const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
})

let sessionGenerated = false

async function startPair() {

if (!fs.existsSync("./auth")) fs.mkdirSync("./auth")

const { state, saveCreds } = await useMultiFileAuthState("./auth")

const sock = makeWASocket({
logger: pino({ level: "silent" }),
auth: state,
printQRInTerminal: false
})

sock.ev.on("connection.update", async ({ connection }) => {

if (connection === "connecting") {

rl.question("📲 Enter WhatsApp number (255xxxxxxxxx): ", async (num) => {

try {

const number = num.replace(/[^0-9]/g, "")

const code = await sock.requestPairingCode(number)

console.log("\n🔑 PAIRING CODE:\n")
console.log(code)

console.log("\n📱 Open WhatsApp → Linked Devices → Link with Code")

} catch (err) {

console.log("❌ Failed to generate pairing code")

}

})

}

if (connection === "open") {

console.log("✅ WhatsApp Connected Successfully")

}

})

sock.ev.on("creds.update", async () => {

if (sessionGenerated) return

sessionGenerated = true

await saveCreds()

try {

const creds = fs.readFileSync("./auth/creds.json")

const session = "NEW-MD;;;=>" + Buffer.from(creds).toString("base64")

console.log("\n📌 SESSION_ID:\n")
console.log(session)

console.log("\n💾 Copy this SESSION_ID to your bot config")

} catch {

console.log("❌ Failed to generate SESSION_ID")

}

})

}

startPair()
