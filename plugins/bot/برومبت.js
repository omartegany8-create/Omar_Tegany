/*
 * 📂 img2prompt.js - محلل الصور السحابي بنظام Meta AI
 * 👤 الأوامر : .برومبت
 * 🎯 الـبُـوت: ⃟꙰⃢  𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 */

import axios from 'axios'
import FormData from 'form-data'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix, command }) => {
   // 1. التحقق من وجود الصورة متوافق مع ميديا البوت (مباشر أو ريبلاي)
   const q = m.quoted ? m.quoted : m
   const mime = (q.msg || q).mimetype || ''
   
   if (!/image/.test(mime)) {
      return m.reply(
         `📸 *عذراً يا نجم!* يجب عليك إرسال صورة مع الأمر أو الرد (Reply) على صورة لاستخراج البرومبت الخاص بها.\n\n` +
         `💡 *الاستخدام:* رد على صورة ثم اكتب: \`${usedPrefix + command}\``
      )
   }

   await m.react('🔍')
   await m.reply('⏳ *جاري فحص الصورة وتحليل تفاصيلها السحابية بدقة... برجاء الانتظار!*')

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
      // تحميل بافر الصورة المباشر من ميديا البوت
      let mediaBuffer = await q.download()
      if (!mediaBuffer || mediaBuffer.length === 0) {
         throw new Error('فشل تحميل بافر الصورة من خوادم الواتساب.')
      }

      // إعداد بيانات الرفع إلى ImgBB
      const formData = new FormData()
      formData.append('source', mediaBuffer, { filename: `sonic-image-${Date.now()}.jpg` })
      formData.append('type', 'file');
      formData.append('action', 'upload');

      const uploadResponse = await axios({
         method: 'POST',
         url: 'https://imgbb.com/json',
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://imgbb.com/',
            'Origin': 'https://imgbb.com',
            ...formData.getHeaders()
         },
         data: formData,
         timeout: 30000
      })

      const imageUrl = uploadResponse.data?.image?.url
      if (!imageUrl) throw new Error('فشل رفع الصورة السريع إلى ImgBB')

      // استدعاء الـ API لتحليل الصورة إلى برومبت
      const apiUrl = `https://johan-vex-apis.vercel.app/api/tools/img2prompt?url=${encodeURIComponent(imageUrl)}`
      
      const apiResponse = await axios.get(apiUrl, {
         timeout: 60000,
         headers: { 'User-Agent': 'Mozilla/5.0' }
      })

      let promptEn = null
      let promptAr = null

      if (apiResponse.data?.success) {
         if (apiResponse.data?.results?.prompt_en) {
            promptEn = apiResponse.data.results.prompt_en
            promptAr = apiResponse.data.results.prompt_ar || promptEn
         } else if (apiResponse.data?.prompt) {
            promptEn = apiResponse.data.prompt
         } else if (apiResponse.data?.results?.prompt) {
            promptEn = apiResponse.data.results.prompt
         }
      }

      if (!promptEn) {
         const dataStr = JSON.stringify(apiResponse.data)
         const promptMatch = dataStr.match(/"prompt":\s*"([^"]+)"/)
         if (promptMatch) promptEn = promptMatch[1]
      }

      if (!promptEn) throw new Error('لم يتم العثور على برومبت متوافق للصورة')

      // الترجمة الآلية للعربية عند الحاجة
      if (!promptAr || promptAr === promptEn) {
         try {
            const translateRes = await axios.get(
               `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(promptEn)}`,
               { timeout: 10000 }
            )
            promptAr = translateRes.data[0].map(i => i[0]).join('')
         } catch (e) {
            promptAr = promptEn
         }
      }

      let resultHeader = `＊* • ̩̩͙✩ • ̩̩͙ * ˚ ❄️ 𝑺𝑶𝑵𝑰𝑪 ❄️ * • ̩̩͙✩ • ̩̩͙ * ˚ ＊\n`
      resultHeader += `> *﹝ 🌀 تَمَّ تَحْلِيلُ الصُّورَةِ بِنَجَاحْ! 👑 ﹞*\n`
      resultHeader += `⭑ * • ̩̩͙⊱ ••••••••••• ❄️ ••••••••••• ̩̩͙⊰ • * ⭑\n\n`
      resultHeader += `🇲🇦 *الـوصـف بـالـعـربـيـة (اضغط للنسخ) ☟*`

      let resultMiddle = `🇬🇧 *الـبـرومـبـت بـالإنـجـلـيـزيـة (اضغط للنسخ) ☟*`

      // إرسال النتيجة مقسمة بصناديق نسخ منفصلة للعربي والإنجليزي متوافقة 100% مع البوت
      await sendRich({
         richResponseMessage: {
            messageType: 1,
            submessages: [
               {
                  messageType: 2,
                  messageText: resultHeader
               },
               {
                  messageType: 5,
                  codeMetadata: {
                     codeLanguage: 'text',
                     codeBlocks: [{ highlightType: 0, codeContent: promptAr }]
                  }
               },
               {
                  messageType: 2,
                  messageText: `\n${resultMiddle}`
               },
               {
                  messageType: 5,
                  codeMetadata: {
                     codeLanguage: 'text',
                     codeBlocks: [{ highlightType: 0, codeContent: promptEn }]
                  }
               },
               {
                  messageType: 2,
                  messageText: `\n*📊 الحالة:* ✅ تم الاستخراج بنجاح\n*＊* • ̩̩͙✩ 𝚂𝙾𝙽𝑰𝙲 𝙰𝙸 𝚂𝚈𝚂𝚃𝙴𝙼 ✩• ̩̩͙ *˚*`
               }
            ],
            contextInfo: botMeta
         }
      })

      return await m.react('✅')

   } catch (error) {
      console.error(error)
      await m.react('❌')

      let errorMsg = '❌ *فشل تحليل الصورة.*'
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
         errorMsg = '⏰ *انتهت المهلة!* خوادم الـ API استغرقت وقتاً طويلاً، حاول مجدداً.'
      } else if (error.message.includes('رفع الصورة')) {
         errorMsg = '⚠️ *تعذر رفع الصورة!* مشكلة في الاتصال أو السيرفر المؤقت لـ ImgBB.'
      } else {
         errorMsg += `\n\n> _${error.message}_`
      }
      return m.reply(errorMsg)
   }
}

// ═══════════════════════════════════════════════
// ⚙️ إعدادات البوت والتحكم في الأسفل
// ═══════════════════════════════════════════════
handler.help = ['برومبت']
handler.command = /^(برومبت|وصف|تحليل|img2prompt)$/i
handler.tags = ['ai']

export default handler