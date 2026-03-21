import express from "express"
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import pino from "pino"
import fs from "fs"

const app = express()
const PORT = process.env.PORT || 3000

if (!fs.existsSync("./auth")) fs.mkdirSync("./auth")

const { state, saveCreds } = await useMultiFileAuthState("./auth")

const sock = makeWASocket({
logger: pino({ level: "silent" }),
auth: state
})

let pairingCode = "Loading..."
let sessionID = ""

app.get("/", (req, res) => {
res.sendFile(process.cwd() + "/pairing.html")
})

app.get("/code", (req, res) => {
res.send(pairingCode)
})

app.get("/session", (req, res) => {
res.send(sessionID)
})

sock.ev.on("creds.update", async () => {
await saveCreds()

const creds = fs.readFileSync("./auth/creds.json")
sessionID = "NEW-MD;;;=>" + Buffer.from(creds).toString("base64")
})

const number = "2557XXXXXXXX" // WEKA NUMBER YAKO

pairingCode = await sock.requestPairingCode(number)

app.listen(PORT, () => {
console.log("Server running on port " + PORT)
})
