/*
 * 📂 delete_sonic.js - حازف وملغي الملفات السحابي بنظام Meta AI
 * 👤 الأوامر : .احذف
 * 👨🏻‍💻 الـمُـطَـوِّر: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ
 * 🎯 الـبُـوت: ⃟꙰⃢  𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 */

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
   // 1. التحقق من إدخال اسم الملف المراد حذفه
   if (!text) return m.reply(`❌ *إستخدام خاطئ للأمر!*\n\n💡 الطريقة الصحيحة:\n\`${usedPrefix + command} اسم_الملف\`\n\nمثال: \`${usedPrefix + command} test\``)

   // 2. تنظيف اسم الملف وإضافة امتداد .js تلقائياً إن لم يكن موجوداً
   let fileName = text.trim().replace(/\s+/g, '_')
   if (!fileName.endsWith('.js') && !fileName.endsWith('.json')) {
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

   // جلب دالة إنشاء الرسائل التفاعلية الذكية ديناميكياً لتفادي أخطاء السورس
   const generateMsg = conn.generateWAMessageFromContent || 
                       (await import('@whiskeysockets/baileys')).default?.generateWAMessageFromContent || 
                       (await import('@whiskeysockets/baileys')).generateWAMessageFromContent

   const sendRich = async (richMessage) => {
      if (typeof generateMsg !== 'function') return m.reply(richMessage.richResponseMessage.submessages[0].messageText)
      
      const msg = await generateMsg(m.chat, {
         viewOnceMessage: {
            message: {
               interactiveMessage: {
                  body: { text: richMessage.richResponseMessage.submessages[0].messageText },
                  footer: { text: '＊* • ̩̩͙✩ 𝚂𝙾𝙽𝙸𝙲 𝙰𝙸 𝚂𝚈𝚂𝚃𝙴𝙼 ✩• ̩̩͙ *˚' },
                  contextInfo: botMeta,
                  nativeFlowMessage: {
                     buttons: [
                        {
                           name: 'quick_reply',
                           buttonParamsJson: JSON.stringify({ display_text: '📂 عرض قائمة الملفات', id: `${usedPrefix}باتش` })
                        }
                     ]
                  }
               }
            }
         }
      }, { userJid: botJid, quoted: m })

      return conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
   }

   try {
      // 3. التحقق من وجود الملف في السيرفر قبل الحذف
      if (!fs.existsSync(filePath)) {
         return m.reply(`❌ *لَمْ يَتِمَّ الـعَـثُـورُ عَـلَى الـمَـلَفّ!*\n\nالملف \`${fileName}\` غير موجود في المجلد الحالي.`)
      }

      // 4. عملية الحذف الفعلي للملف
      fs.unlinkSync(filePath)

      // إرسال رسالة النجاح بستايل الأزرار التفاعلية الفخم
      return sendRich({
         richResponseMessage: {
            submessages: [
               { 
                  messageText: `🗑️ *تَمَّ حَذْفُ الـمَـلَـفِّ بِنَجَاحْ!* ⚡\n\n📂 اسْمُ المَلَفّ المَحْذُوف: \`${fileName}\`\n🚀 المسار السابق: \`${normalizedPath}\`\n🤖 المطور: ${global.author || '𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉'}` 
               }
            ]
         }
      })

   } catch (e) {
      console.error(e)
      return m.reply(`❌ خَـطَـأٌ أَثْـنَـاءَ حَذْفِ الـمَـلَـفّ:\n${e.message}`)
   }
}

handler.help = ['احذف']
handler.command = /^م$/i
handler.tags = ['owner']
handler.owner = true

export default handler