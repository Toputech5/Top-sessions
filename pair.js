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
    printQRInTerminal: true
  })

  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") console.log("✅ WhatsApp Connected")
  })

  sock.ev.on("creds.update", async () => {

    await saveCreds()

    const creds = fs.readFileSync("./auth/creds.json")
    const base64 = Buffer.from(creds).toString("base64")
    const session = "NEW-MD;;;=>" + base64

    console.log("\n📌 SESSION_ID:\n")
    console.log(session)
    console.log("\n💾 Copy this SESSION_ID to your NEW-MD bot config\n")
    process.exit(0)
  })

  rl.question("📲 Enter your WhatsApp number (with country code, e.g. 2557xxxxxxx): ", (num) => {
    console.log(`\n✅ Scan the QR in terminal for number ${num}...\n`)
  })
}

startPair()
