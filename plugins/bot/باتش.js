/*
 * 📂 patch_sonic.js - مستعرض ملفات السيرفر والأكواد بنظام Meta AI
 * 👤 الأوامر : .باتش
 * 👨🏻‍💻 الـمُـطَـوِّر: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ
 * 🎯 الـبُـوت: ⃟꙰⃢  𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 */

import fs from 'fs'
import path from 'path'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

// دالة فحص وجلب كل البلوجينز من المجلدات الفرعية والأساسية
const scanPlugins = (dir, base = '') => {
   let results = []
   const items = fs.readdirSync(dir)
   for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
         const subBase = base ? `${base}/${item}` : item
         results = results.concat(scanPlugins(fullPath, subBase))
      } else if (item.endsWith('.js') || item.endsWith('.json')) {
         const name = base
            ? `${base}/${item.replace(/\.(js|json)$/, '')}`
            : item.replace(/\.(js|json)$/, '')
         results.push({ name, fullPath })
      }
   }
   return results
}

// دالة تقسيم وتلوين الأكواد المتقدمة لـ Meta AI
const tokenizer = (code) => {
   const TYPE_MAP = { 0: 'DEFAULT', 1: 'KEYWORD', 2: 'METHOD', 3: 'STR', 4: 'NUMBER', 5: 'COMMENT' }
   const tokens = []
   let i = 0
   const push = (content, type) => {
      if (!content) return
      const last = tokens[tokens.length - 1]
      if (last && last.highlightType === type) last.codeContent += content
      else tokens.push({ codeContent: content, highlightType: type })
   }
   while (i < code.length) {
      const c = code[i]
      if (/\s/.test(c)) { let s = i; while (i < code.length && /\s/.test(code[i])) i++; push(code.slice(s, i), 0); continue }
      if (c === '/' && code[i + 1] === '/') { let s = i; i += 2; while (i < code.length && code[i] !== '\n') i++; push(code.slice(s, i), 5); continue }
      if (c === '"' || c === "'" || c === '`') { let s = i, q = c; i++; while (i < code.length) { if (code[i] === '\\' && i + 1 < code.length) i += 2; else if (code[i] === q) { i++; break } else i++ }; push(code.slice(s, i), 3); continue }
      if (/[0-9]/.test(c)) { let s = i; while (i < code.length && /[0-9.]/.test(code[i])) i++; push(code.slice(s, i), 4); continue }
      if (/[a-zA-Z_$]/.test(c)) {
         let s = i; while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) i++
         const word = code.slice(s, i)
         let type = 0
         if (new Set(['break', 'case', 'catch', 'continue', 'debugger', 'delete', 'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof', 'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'true', 'false', 'null', 'undefined', 'class', 'const', 'let', 'super', 'extends', 'export', 'import', 'yield', 'static', 'constructor', 'async', 'await']).has(word)) type = 1
         else { let j = i; while (j < code.length && /\s/.test(code[j])) j++; if (code[j] === '(') type = 2 }
         push(word, type); continue
      }
      push(c, 0); i++
   }
   return tokens
}

let handler = async (m, { conn, text }) => {
   const pluginsDir = path.join(process.cwd(), 'plugins')
   const allPlugins = scanPlugins(pluginsDir)

   const botJid = conn.user?.id?.includes(':')
      ? conn.user.id.split(':')[0] + '@s.whatsapp.net'
      : conn.user?.id

   // ميتا داتا الفورد والتوثيق الملكي لبوتك
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

   // 1. عند كتابة الأمر فارغاً (.باتش) -> عرض جدول كل الملفات بستايل AI Rich
   if (!text) {
      if (!allPlugins.length)
         return m.reply('🚫 لا توجد ملفات أو إضافات حالياً في السيرفر!')

      const tableRows = [
         { items: ['#', '📂 اسْـمُ الـبُـلُـوجِـنْ'], isHeading: true },
         ...allPlugins.map((v, i) => ({
            items: [String(i + 1), v.name],
            isHeading: false
         }))
      ]

      return sendRich({
         richResponseMessage: {
            messageType: 1,
            submessages: [
               { messageType: 2, messageText: `⚡ *لَوْحَةُ سِيرْفَرِ ${global.namebot || 'SonicBot-MD'} المَلَكِيَّة*\n🤖 لإظهار كود أي ملف، اكتب: \`.باتش [اسم البلوجن]\`` },
               {
                  messageType: 4,
                  tableMetadata: {
                     title: '👑 Sonic Server Plugins',
                     subtitle: `${global.author || '𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉'}`,
                     rows: tableRows
                  }
               }
            ],
            contextInfo: botMeta
         }
      })
   }

   // 2. عند البحث عن ملف (.باتش معلومات) -> عرض الكود الملون والمسار السحابي للملف
   const query = text.trim().toLowerCase().replace(/\.(js|json)$/, '')
   const found = allPlugins.find(v => {
      const parts = v.name.toLowerCase().split('/')
      return parts[parts.length - 1] === query || v.name.toLowerCase() === query
   })

   if (!found)
      return m.reply(`❌ لَمْ يَتِمَّ الـعَـثُـورُ عَـلَى الـمَـلَفّ: *${text}*\n\n📂 اكْـتُـبِ الأَمْـرَ \`.باتش\` فَقَطْ لِعَرْضِ الـقَـائِـمَـةِ الـكَـامِـلَـةِ.`)

   try {
      const code = fs.readFileSync(found.fullPath, 'utf-8')
      const extension = path.extname(found.fullPath).replace('.', '')
      const codeLanguage = extension === 'js' ? 'javascript' : extension === 'json' ? 'json' : 'text'
      const normalizedPath = `/home/container/plugins/${path.relative(pluginsDir, found.fullPath).replace(/\\/g, '/')}`

      // تحليل الكود ديناميكياً لتفادي مشاكل الحجم والتجميد
      const parsedCodeBlocks = tokenizer(code)

      return sendRich({
         richResponseMessage: {
            messageType: 1,
            submessages: [
               {
                  messageType: 5,
                  codeMetadata: {
                     codeLanguage: 'bash',
                     codeBlocks: [{ highlightType: 1, codeContent: `💻 المسار: ${normalizedPath}` }]
                  }
               },
               {
                  messageType: 5,
                  codeMetadata: { codeLanguage, codeBlocks: parsedCodeBlocks }
               }
            ],
            contextInfo: botMeta
         }
      })

   } catch (e) {
      console.error(e)
      return m.reply(`❌ خَـطَـأٌ أَثْـنَـاءَ قِـرَاءَةِ الـمَـلَـفّ:\n${e.message}`)
   }
}

handler.help = ['باتش']
handler.command = /^ع$/i
handler.tags = ['owner']
handler.owner = true

export default handler