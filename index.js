import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import pino from "pino"
import fs from "fs"
import readline from "readline"

const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
})

async function start() {

if (!fs.existsSync("./auth")) {
fs.mkdirSync("./auth")
}

const { state, saveCreds } = await useMultiFileAuthState("./auth")

const sock = makeWASocket({
logger: pino({ level: "silent" }),
auth: state
})

rl.question("Enter your WhatsApp number: ", async (num) => {

const code = await sock.requestPairingCode(num)

console.log("Pairing Code:", code)

})

sock.ev.on("creds.update", async () => {

await saveCreds()

const creds = fs.readFileSync("./auth/creds.json")

const base64 = Buffer.from(creds).toString("base64")

const session = "NEW-MD;;;=>" + base64

console.log("\nSESSION_ID:\n")
console.log(session)

})

}

start()
