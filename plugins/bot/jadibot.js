// ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|
// كود إدارة وتفقد السيرفر والـ Sub-Bots (البوتات الفرعية) - نسخة مترجمة بالكامل
// https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z

import { promises as fsPromises, existsSync, rmSync } from "fs"
import path, { join } from 'path'
import ws from 'ws'
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = (await import("@whiskeysockets/baileys")).default

const sonicFooter = '*╰━━━━━━━ 〔 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ 〕 ━━━━━━━╯*';

let handler = async (m, { conn, command, usedPrefix, args, text, isOwner }) => {

    const isDeleteSession = /^(حذف_جلسة|حذف_بوت|حذف-جلسة|deletesession)$/i.test(command)
    const isPauseBot = /^(ايقاف|توقف|اطفاء|stop)$/i.test(command)
    const isShowBots = /^(البوتات|المتصلين|bots|sockets)$/i.test(command)

    // دالة زخرفة الخط الإنجليزي الافتراضية بالكود
    const toFancy = (str) => {
        const map = {
            'a': 'ᥲ', 'b': 'ᑲ', 'c': 'ᥴ', 'd': 'ᑯ', 'e': 'ᥱ', 'f': '𝖿', 'g': 'g', 'h': 'һ',
            'i': 'і', 'j': 'j', 'k': 'k', 'l': 'ᥣ', 'm': 'm', 'n': 'ᥒ', 'o': '᥆', 'p': '⍴',
            'q': 'q', 'r': 'r', 's': 's', 't': '𝗍', 'u': 'ᥙ', 'v': '᥎', 'w': 'ɯ', 'x': 'x',
            'y': 'ᥡ', 'z': 'z', 'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F',
            'G': 'G', 'H': 'H', 'I': 'I', 'J': 'J', 'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N',
            'O': 'O', 'P': 'P', 'Q': 'Q', 'R': 'R', 'S': 'S', 'T': 'T', 'U': 'U', 'V': 'V',
            'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Z'
        }
        return str.split('').map(c => map[c] || c).join('')
    }

    const reportError = async (e) => {
        await m.reply(`⚠️ *${toFancy("عذراً، حدث خطأ غير متوقع في النظام...")}*`)
        console.error(e)
    }

    const convertirMsAFormato = (ms) => {
        if (!ms || ms < 1000) return 'متصل الآن'
        let segundos = Math.floor(ms / 1000)
        let minutos = Math.floor(segundos / 60)
        let horas = Math.floor(minutos / 60)
        let días = Math.floor(horas / 24)
        segundos %= 60; minutos %= 60; horas %= 24
        const parts = []
        if (días > 0) parts.push(`${días} يوم`)
        if (horas > 0) parts.push(`${horas} ساعة`)
        if (minutos > 0) parts.push(`${minutos} دقيقة`)
        if (segundos > 0) parts.push(`${segundos} ثانية`)
        return parts.join(', ') || 'قبل قليل'
    }
    
    // --- قسم حذف الجلسة التابعة للبوت الفرعي ---
    if (isDeleteSession) {
        const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
        const uniqid = `${who.split('@')[0]}`
        const dirPath = `./${global.jadi || 'jadibots'}/${uniqid}` // تأمين المتغير المتغير من النسخة القديمة

        if (!existsSync(dirPath)) {
            return conn.sendMessage(m.chat, {
                text: `🚫 *عذراً يا رفيقي، الجلسة غير موجودة*\n\n✨ ليس لديك أي بوت فرعي نشط حالياً على هذا الرقم.\n\n🔰 *يمكنك ربط بوت فرعي عبر:* \n» \`${usedPrefix}qr\`\n\n📦 *أو طلب كود الربط المباشر:* \n» \`${usedPrefix}code\`\n\n${sonicFooter}`
            }, { quoted: m })
        }

        if (global.conn.user.jid !== conn.user.jid) {
            return conn.sendMessage(m.chat, {
                text: `💬 *هذا الأمر يمكن تنفيذه فقط من خلال البوت الرئيسي [ سونيك ] وليس البوتات الفرعية.*`,
            }, { quoted: m })
        }

        try {
            await m.react('🗑️')
            await fsPromises.rm(dirPath, { recursive: true, force: true })
            await conn.sendMessage(m.chat, {
                text: `✨ ⃟꙰⃢  *تـم الـتـنـظـيـف بـنـجـاح مـلـكـي* ✅\n\n🌈 تم حذف وإلغاء جلسة البوت الفرعي الخاص بك بالكامل من السيرفر.\n\n${sonicFooter}`
            }, { quoted: m })
        } catch (e) {
            reportError(e)
        }
    }
    
    // --- قسم إيقاف وتجميد البوت الفرعي مؤقتاً ---
    else if (isPauseBot) {
        if (global.conn.user.jid == conn.user.jid) {
            return conn.reply(m.chat, `🚫 *لا يمكنك تعطيل أو إيقاف البوت الرئيسي للسيرفر!*`, m)
        }
        await conn.reply(m.chat, `🔕 *تم تعطيل وإيقاف البوت الفرعي [ ${global.botname || 'Sonic-SubBot'} ] وفصل اتصاله بالخادم الآن.*`, m)
        conn.ws.close()
    }

    // --- قسم عرض البوتات الفرعية المتصلة حالياً بالسيرفر ---
    else if (isShowBots) {
        const users = [...new Set([...global.conns.filter(c => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)])]
        
        let listaSubBots = users.map((v, i) => {
            const uptime = v.uptime ? convertirMsAFormato(Date.now() - v.uptime) : 'غير معروف'
            const numero = v.user.jid.split('@')[0]
            const nombre = v.user.name || 'بدون اسم'
            return `╭━ • 🤖 *الـبـوت الـفـرعـي [ ${i + 1} ]* • ━
│➤ 👤 *المستخدم:* ${nombre}
│➤ 📞 *الرقم:* wa.me/${numero}
│➤ ⏳ *مدة النشاط:* ${uptime}
╰━━━━━━━━━━━━━`
        }).join('\n\n')

        const finalMessage = users.length > 0 ? listaSubBots : `💤 *لا يوجد حالياً أي بوتات فرعية متصلة بالخادم الخاص بنا.*`
        const headerText = `⚡ ⃟꙰⃢  *الـبـوتـات الـفـرعـيـة الـمـتـصـلـة* ✨\n\n📊 *إجمالي البوتات النشطة حالياً:* ${users.length}\n${users.length > 0 ? '────────────────\n' : ''}${finalMessage}\n\n${sonicFooter}`

        let mediaMessage = await prepareWAMessageMedia({ 
            image: { url: 'https://raw.githubusercontent.com/Dioneibi-rip/imagenes/refs/heads/main/855ccb61ddb6e8a6265750cb601ca07b.jpg' } 
        }, { upload: conn.waUploadToServer })

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: headerText
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: 'قائمة التحكم بالبوتات الفرعية لبوت سونيك'
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            hasMediaAttachment: true,
                            imageMessage: mediaMessage.imageMessage
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "🤖 ربط بوت فرعي (QR)",
                                        id: `${usedPrefix}qr`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "🔑 طلب كود التحقق",
                                        id: `${usedPrefix}code`
                                    })
                                }
                            ]
                        })
                    })
                }
            }
        }, { quoted: m })

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }
}

handler.tags = ['serbot']
handler.help = ['البوتات', 'حذف_جلسة', 'ايقاف']
handler.command = [
    'حذف_جلسة', 'حذف_بوت', 'حذف-جلسة', 'deletesession',
    'ايقاف', 'توقف', 'اطفاء', 'stop',
    'البوتات', 'المتصلين', 'bots', 'sockets'
]

export default handler;
