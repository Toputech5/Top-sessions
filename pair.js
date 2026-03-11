import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import pino from "pino"
import fs from "fs"

async function start() {

if (!fs.existsSync("./auth")) fs.mkdirSync("./auth")

const { state, saveCreds } = await useMultiFileAuthState("./auth")

const sock = makeWASocket({
logger: pino({ level: "silent" }),
auth: state,
printQRInTerminal: true
})

sock.ev.on("creds.update", async () => {

await saveCreds()

const creds = fs.readFileSync("./auth/creds.json")

const session = "NEW-MD;;;=>" + Buffer.from(creds).toString("base64")

console.log("\nSESSION_ID:\n")
console.log(session)

})

}

start()
