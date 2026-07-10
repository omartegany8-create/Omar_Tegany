/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
هذا الملف تم تعريبه وتحديث حقوقه بالكامل ليناسب:
- ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|
*/

const {
    useMultiFileAuthState,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    proto,
} = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { attachSessionState, cleanupSessionState, createMessageRetryCache, registerSubBot } from '../src/core/session-manager.js'
import { fileURLToPath } from 'url'

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

const sonicFooter = '*╰━━━━━━━ 〔 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ 〕 ━━━━━━━╯*';
let rtx = `⚡ ⃟꙰⃢  *تـنـصـيـب بـوت فـرعـي (QR CODE)* 🤖\n\n🔮 قم بمسح هذا الرمز (QR) باستخدام هاتف آخر أو متصفح كمبيوتر لتصبح صـب بـوت مؤقت تابع لنا.\n\n📌 *خطوات الربط:*\n1️⃣ افتح تطبيق واتساب من جهازك المراد ربطه.\n2️⃣ اضغط على الأجهزة المرتبطة في الإعدادات.\n3️⃣ اختر "ربط جهاز" وقم بمسح هذا الرمز تلقائياً.\n\n⚠️ *ملاحظة:* هذا الرمز ينتهي مفعوله خلال 45 ثانية تلقائياً!\n\n${sonicFooter}`

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pairingCodeRequests = global.pairingCodeRequests || (global.pairingCodeRequests = new Map())
const PAIRING_CODE_TTL_MS = 45000
const PAIRING_CODE_COOLDOWN_MS = 60000
if (global.conns instanceof Array) console.log()
else global.conns = []
if (!(global.subBotRegistry instanceof Map)) global.subBotRegistry = new Map()

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    // 🛠️ حماية هندسية وتدقيق آمن لمنع قراءة Subs كـ undefined وإصلاح الانهيار
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    if (!global.db.data.users[m.sender].Subs) global.db.data.users[m.sender].Subs = 0

    let time = global.db.data.users[m.sender].Subs + 120000
    if (new Date() - global.db.data.users[m.sender].Subs < 120000) return conn.reply(m.chat, `⚠️ *يرجى الانتظار مدة [ ${msToTime(time - new Date())} ] قبل إعادة محاولة ربط البوت الفرعي.*`, m)

    const limiteSubBots = global.subbotlimitt || 26; 
    const subBots = [...new Set([...global.conns.filter((c) => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)])]
    const subBotsCount = subBots.length

    if (subBotsCount >= limiteSubBots) {
        return m.reply(`🚫 *تم الوصول إلى الحد الأقصى للبوتات الفرعية النشطة بالسيرفر (${subBotsCount}/${limiteSubBots}).*\n\nلا يمكن إنشاء اتصالات جديدة حالياً حتى يفصل أحد المتصلين.`)
    }

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${who.split`@`[0]}`
    
    // تأمين متغير مجلد الجلسات الفرعية الديناميكي
    let folderJadi = global.rutaJadiBot || `./SonicJadibot`
    let pathRubyJadiBot = path.join(folderJadi, id)
    
    const existingById = global.conns.find(c => c?.subBotId === id && c?.ws?.socket?.readyState === ws.OPEN)
    if (existingById) {
        return conn.reply(m.chat, `🤖 *لديك بالفعل بوت فرعي نشط ومستقر حالياً في النظام.*`, m)
    }
    if (!fs.existsSync(pathRubyJadiBot)){
        fs.mkdirSync(pathRubyJadiBot, { recursive: true })
    }
    const options = { pathRubyJadiBot, m, conn, args: [...args], usedPrefix, command, fromCommand: true }
    RubyJadiBot(options)
    global.db.data.users[m.sender].Subs = new Date() * 1
} 

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler 

export async function RubyJadiBot(options) {
    let { pathRubyJadiBot, m, conn, args, usedPrefix, command } = options
    if (command === 'code') {
        command = 'qr'; 
        args.unshift('code')
    }
    const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
    let txtCode, codeBot, txtQR
    if (mcode) {
        args[0] = args[0].replace(/^--code$|^code$/, "").trim()
        if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
        if (args[0] == "") args[0] = undefined
    }
    const pathCreds = path.join(pathRubyJadiBot, "creds.json")
    if (!fs.existsSync(pathRubyJadiBot)){
        fs.mkdirSync(pathRubyJadiBot, { recursive: true })
    }
    try {
        args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
    } catch (e) {
        conn.reply(m.chat, `⚠️ *يرجى استخدام الأمر بالطريقة الصحيحة:* \n» \`${usedPrefix + command} code\``, m)
        return
    }

    const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
    exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
        const drmer = Buffer.from(drm1 + drm2, `base64`)

        let { version, isLatest } = await fetchLatestBaileysVersion()
        const subSocketCfg = global.baileysSocketConfig || {}
        const msgRetry = (MessageRetryMap) => { }
        const msgRetryCache = createMessageRetryCache()
        const { state, saveState, saveCreds } = await useMultiFileAuthState(pathRubyJadiBot)

        const connectionOptions = {
            logger: pino({ level: "fatal" }),
            printQRInTerminal: false,
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
            msgRetry,
            msgRetryCache,
            browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Sonic-MD SubBot', 'Chrome','2.0.0'],
            version: version,
            generateHighQualityLinkPreview: true,
            defaultQueryTimeoutMs: subSocketCfg.defaultQueryTimeoutMs ?? 45000,
            connectTimeoutMs: subSocketCfg.connectTimeoutMs ?? 60000,
            keepAliveIntervalMs: subSocketCfg.keepAliveIntervalMs ?? 20000,
            retryRequestDelayMs: subSocketCfg.retryRequestDelayMs ?? 1500,
            markOnlineOnConnect: false,
            syncFullHistory: false
        };

        let sock = makeWASocket(connectionOptions)
        const subBotId = path.basename(pathRubyJadiBot)
        sock.subBotId = subBotId
        attachSessionState(sock, { id: subBotId, type: 'subbot', parentId: conn?.user?.jid || 'primary', path: pathRubyJadiBot })
        sock.isInit = false
        let isInit = true
        let healthInterval = null
        let reconnectAttempts = 0
        const MAX_RECONNECT_ATTEMPTS = subSocketCfg.maxReconnectAttempts ?? 6
        const RECONNECT_BASE_DELAY_MS = subSocketCfg.reconnectBaseDelayMs ?? 1500
        let pairingCodeSent = false
        let pairingCodeMessageKey = null
        let pairingCodeTimer = null
        let qrMessageSent = false

        const removeSockFromPool = (targetSock = sock) => {
            const i = global.conns.indexOf(targetSock)
            if (i >= 0) {
                global.conns.splice(i, 1)
            }
        }

        const clearHealthMonitor = () => {
            if (healthInterval) {
                clearInterval(healthInterval)
                healthInterval = null
            }
        }

        const clearPairingCodeLock = () => {
            if (pairingCodeTimer) clearTimeout(pairingCodeTimer)
            pairingCodeTimer = null
            pairingCodeRequests.delete(subBotId)
        }

        const destroySock = ({ removeSession = false } = {}) => {
            clearHealthMonitor()
            clearPairingCodeLock()
            try { sock.ws.close() } catch (e) {}
            try { sock.ev.removeAllListeners() } catch (e) {}
            removeSockFromPool(sock)
            cleanupSessionState(sock)
            if (global.subBotRegistry instanceof Map) global.subBotRegistry.delete(subBotId)
            if (removeSession) {
                try { fs.rmSync(pathRubyJadiBot, { recursive: true, force: true }) } catch (e) {}
            }
        }

        let handler = await import('../handler.js')
        let creloadHandler = async function (restatConn) {
            try {
                const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
                if (Object.keys(Handler || {}).length) handler = Handler
            } catch (e) {
                console.error('⚠️ خطأ في التحديث التلقائي للهندلر: ', e)
            }
            if (restatConn) {
                const oldChats = sock.chats
                removeSockFromPool(sock)
                try { sock.ws.close() } catch (e) { }
                try { sock.ev.removeAllListeners() } catch (e) {}
                sock = makeWASocket(connectionOptions, { chats: oldChats })
                sock.subBotId = subBotId
                attachSessionState(sock, { id: subBotId, type: 'subbot', parentId: conn?.user?.jid || 'primary', path: pathRubyJadiBot })
                isInit = true
                registerSubBot(global.subBotRegistry, subBotId, { sock, reconnecting: true, ts: Date.now() })
            }
            if (!isInit) {
                sock.ev.off("messages.upsert", sock.handler)
                sock.ev.off("connection.update", sock.connectionUpdate)
                sock.ev.off('creds.update', sock.credsUpdate)
            }
            sock.handler = handler.handler.bind(sock)
            sock.connectionUpdate = connectionUpdate.bind(sock)
            sock.credsUpdate = saveCreds.bind(sock, true)
            sock.ev.on("messages.upsert", sock.handler)
            sock.ev.on("connection.update", sock.connectionUpdate)
            sock.ev.on("creds.update", sock.credsUpdate)
            isInit = false
            return true
        }

        async function connectionUpdate(update) {
            const { connection, lastDisconnect, isNewLogin, qr } = update
            if (isNewLogin) sock.isInit = false
            
            if (qr && !mcode) {
                if (qrMessageSent) return
                qrMessageSent = true
                if (m?.chat) {
                    txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
                } else {
                    return
                }
                if (txtQR && txtQR.key) {
                    setTimeout(() => { conn.sendMessage(m.chat, { delete: txtQR.key }).catch(() => {})}, PAIRING_CODE_TTL_MS)
                }
                return
            } 
            
            if (qr && mcode) {
                if (!m?.chat || pairingCodeSent) return
                const now = Date.now()
                const activeRequest = pairingCodeRequests.get(subBotId)
                if (activeRequest && now - activeRequest.ts < PAIRING_CODE_COOLDOWN_MS) {
                    pairingCodeSent = true
                    pairingCodeMessageKey = activeRequest.key || null
                    return
                }

                pairingCodeSent = true
                const rawCode = await sock.requestPairingCode(m.sender.split`@`[0], "SONICBOT")

                const formattedCode = rawCode.match(/.{1,4}/g)?.join("-") || rawCode
                const mediaMessage = await prepareWAMessageMedia({
                    image: { url: "https://files.catbox.moe/ito02n.png" }
                }, { upload: conn.waUploadToServer })

                const interactivePayload = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                                body: proto.Message.InteractiveMessage.Body.create({
                                    text: `⚡ ⃟꙰⃢  *كـود الـربـط الـمـبـاشـر جـاهـز* 🔑\n\nاستخدم الكود التالي لتفعيل حسابك كـ بوت فرعي:\n\n*الكود المطور:* \`${formattedCode}\`\n\n> اضغط على الزر بالأسفل لنسخ الكود بسهولة آمنة.`
                                }),
                                footer: proto.Message.InteractiveMessage.Footer.create({
                                    text: "هذا الكود ينتهي مفعوله تلقائياً خلال 45 ثانية."
                                }),
                                header: proto.Message.InteractiveMessage.Header.create({
                                    hasMediaAttachment: true,
                                    imageMessage: mediaMessage.imageMessage
                                }),
                                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                                    buttons: [{
                                        name: "cta_copy",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "نسخ كود التحقق",
                                            copy_code: rawCode
                                        })
                                    }]
                                })
                            })
                        }
                    }
                }, { quoted: m })

                await conn.relayMessage(m.chat, interactivePayload.message, { messageId: interactivePayload.key.id })
                pairingCodeMessageKey = interactivePayload.key
                pairingCodeRequests.set(subBotId, { ts: now, key: pairingCodeMessageKey })
                console.log(`[كود التحقق الفرعي تم إرساله]: ${rawCode}`)

                if (pairingCodeMessageKey) {
                    pairingCodeTimer = setTimeout(() => {
                        conn.sendMessage(m.chat, { delete: pairingCodeMessageKey }).catch(() => {})
                        clearPairingCodeLock()
                    }, PAIRING_CODE_TTL_MS)
                }
                return
            }

            if (txtCode && txtCode.key) {
                setTimeout(() => { conn.sendMessage(m.chat, { delete: txtCode.key }).catch(() => {})}, 45000)
            }
            if (codeBot && codeBot.key) {
                setTimeout(() => { conn.sendMessage(m.chat, { delete: codeBot.key }).catch(() => {})}, 45000)
            }
            
            const endSesion = async (loaded) => {
                if (!loaded) destroySock({ removeSession: false })
            }

            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

            const scheduleReconnect = async (closeReason, reconnectFn) => {
                if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                    console.log(chalk.bold.yellow(`⚠️ البوت الفرعي +${subBotId} وصل للحد الأقصى لمحاولات إعادة الاتصال.`))
                    return destroySock({ removeSession: false })
                }
                reconnectAttempts += 1
                const waitMs = Math.min(30000, RECONNECT_BASE_DELAY_MS * (2 ** (reconnectAttempts - 1)))
                await sleep(waitMs)
              
                try {
                    await reconnectFn()
                } catch (e) {
                    console.error(`خطأ أثناء ربط الاتصال التلقائي +${subBotId}:`, e)
                    return scheduleReconnect(closeReason, reconnectFn)
                }
            }

            if (connection === 'close') {
                const transient = [428, 408, 500, 515]
                const fatal = [401, 403, 405]

                if (fatal.includes(reason)) {
                    console.log(chalk.bold.magentaBright(`\n[ نظام سونيك ] الجلسة الرقمية (+${path.basename(pathRubyJadiBot)}) تم إغلاقها نهائياً (فقدان صلاحية أو طرد).`))
                    destroySock({ removeSession: true })
                    return
                }

                if (reason === 440) {
                    console.log(chalk.bold.magentaBright(`\n[ نظام سونيك ] الاتصال (+${path.basename(pathRubyJadiBot)}) تم استبداله بجلسة أخرى نشطة.`))
                    destroySock({ removeSession: false })
                    return
                }

                console.log(chalk.bold.magentaBright(`\n[ نظام سونيك ] انقطع الاتصال بالرقم (+${path.basename(pathRubyJadiBot)}) بسبب: ${reason}. جاري محاولة إعادة الربط...`))
              
                return scheduleReconnect(reason, async () => {
                    await creloadHandler(true)
                })
            }

            if (global.db.data == null) await loadDatabase()
            if (connection == `open`) {
                if (!global.db.data?.users) await loadDatabase()
                let userName, userJid 
                userName = sock.authState.creds.me.name || 'مستخدم فرعي'
                userJid = sock.authState.creds.me.jid || `${path.basename(pathRubyJadiBot)}@s.whatsapp.net`
                console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SONIC SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathRubyJadiBot)}) متصل ومستقر الآن بالسيرفر.\n│\n❒⸺⸺⸺【• تـم الـتـشـغـيـل •】⸺⸺⸺❒`))
                sock.isInit = true
                reconnectAttempts = 0
                if (!global.conns.includes(sock)) global.conns.push(sock)
                registerSubBot(global.subBotRegistry, subBotId, { sock, connectedAt: Date.now() })
                clearPairingCodeLock()
                await joinChannels(sock)

                m?.chat ? await conn.sendMessage(m.chat, {text: args[0] ? `@${m.sender.split('@')[0]}, أنت متصل بالفعل الآن، جاري قراءة الرسائل والأوامر...` : `@${m.sender.split('@')[0]}, مرحباً بك! أصبحت الآن فرداً من عائلة بوتات سونيك الفرعية النشطة. ⚡`, mentions: [m.sender]}, { quoted: m }) : ''

                if (!healthInterval) {
                    healthInterval = setInterval(async () => {
                        if (!sock.user || sock?.ws?.socket?.readyState === ws.CLOSED) {
                            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                                destroySock({ removeSession: false })
                            }
                        }
                    }, 90000)
                }
            }
        }

        creloadHandler(false)
    })
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    hours = (hours < 10) ? '0' + hours : hours
    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds
    return minutes + ' دقيقة و ' + seconds + ' ثانية '
}

async function joinChannels(conn) {
    if (global.ch && typeof global.ch === 'object') {
        for (const channelId of Object.values(global.ch)) {
            await conn.newsletterFollow(channelId).catch(() => {})
        }
    }
}