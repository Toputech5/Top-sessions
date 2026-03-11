import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import pino from "pino"
import fs from "fs"

let sessionGenerated = false

async function startQR() {

if (!fs.existsSync("./auth")) fs.mkdirSync("./auth")

const { state, saveCreds } = await useMultiFileAuthState("./auth")

const sock = makeWASocket({
logger: pino({ level: "silent" }),
auth: state,
printQRInTerminal: true
})

sock.ev.on("connection.update", ({ connection }) => {

if (connection === "connecting") {
console.log("🔗 Connecting to WhatsApp...")
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

startQR()
