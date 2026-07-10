/*
 * 📂 save_sonic.js - منشئ ومبرمج الملفات السحابي بنظام Meta AI
 * 👤 الأوامر : .احفظ
 * 👨🏻‍💻 الـمُـطَـوِّر: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ
 * 🎯 الـبُـوت: ⃟꙰⃢  𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 */

import fs from 'fs'
import path from 'path'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, usedPrefix, command }) => {
   // 1. التحقق من إدخال اسم الملف
   if (!text) return m.reply(`❌ *إستخدام خاطئ للأمر!*\n\n💡 الطريقة الصحيحة:\n\`${usedPrefix + command} اسم_الملف\`\n\nقم بالرد (Reply) على الكود الذي تريد حفظه واكتب الأمر مع اسم الملف.`)

   // 2. التحقق الذكي والموسع من الرسالة المقتبسة (Quoted Message)
   const quoted = m.quoted ? m.quoted : m.msg?.contextInfo?.quotedMessage
   if (!quoted) return m.reply(`❌ *عذراً!* يجب عليك الرد (Reply) على الكود أو النص الذي ترغب في حفظه داخل الملف.`)

   // جلب النص بأكثر من طريقة لضمان عدم قراءة القيمة كـ فارغة
   const quotedMessage = m.quoted?.text || 
                         m.quoted?.msg || 
                         m.quoted?.conversation || 
                         (typeof m.quoted === 'string' ? m.quoted : null)

   if (!quotedMessage || typeof quotedMessage !== 'string') {
      return m.reply(`❌ *لم يتم التعرف على النص!* تأكد من أنك ترد على رسالة نصية تحتوي على الكود بشكل واضح.`)
   }

   // 3. تنظيف اسم الملف وإضافة امتداد .js تلقائياً
   let fileName = text.trim().replace(/\s+/g, '_')
   if (!fileName.endsWith('.js')) {
      fileName += '.js'
   }

   const pluginsDir = path.join(process.cwd(), 'plugins')
   const filePath = path.join(pluginsDir, fileName)
   const normalizedPath = `/home/container/plugins/${fileName}`

   // ميتا داتا الفورد والتوثيق الملكي لبوتك
   const botJid = conn.user?.id?.includes(':') ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : conn.user?.id
   const botMeta = {
      isForwarded: true,
      forwardingScore: 999,
      forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
      forwardOrigin: 4
   }

   const sendRich = async (richMessage) => {
      const msg = await generateWAMessageFromContent(m.chat, {
         botForwardedMessage: { message: richMessage }
      }, {
         senderId: botJid,
         userJid: botJid,
         messageId: conn.generateMessageIDV2?.(botJid) ?? 'SONIC-' + Date.now().toString(36).toUpperCase()
      })

      if (msg.message?.botForwardedMessage) {
         msg.message.botForwardedMessage.contextInfo = botMeta
      }

      return conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
   }

   try {
      if (!fs.existsSync(pluginsDir)) {
         fs.mkdirSync(pluginsDir, { recursive: true })
      }

      // كتابة وحفظ الملف
      fs.writeFileSync(filePath, quotedMessage, 'utf-8')

      // إرسال رسالة النجاح بستايل Meta AI
      return sendRich({
         richResponseMessage: {
            messageType: 1,
            submessages: [
               { 
                  messageType: 2, 
                  messageText: `✨ *تَمَّ حِفْظُ الـمَـلَـفِّ بِنَجَاحْ!* 👑\n\n📂 اسْمُ المَلَفّ: \`${fileName}\`\n🤖 المطور: ${global.author || '𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉'}` 
               },
               {
                  messageType: 5,
                  codeMetadata: {
                     codeLanguage: 'bash',
                     codeBlocks: [{ highlightType: 1, codeContent: `🚀 المسار السحابي: ${normalizedPath}` }]
                  }
               }
            ],
            contextInfo: botMeta
         }
      })

   } catch (e) {
      console.error(e)
      return m.reply(`❌ خَـطَـأٌ أَثْـنَـاءَ حِفْظِ الـمَـلَـفّ:\n${e.message}`)
   }
}

handler.help = ['احفظ']
handler.command = /^ح$/i
handler.tags = ['owner']
handler.owner = true

export default handler