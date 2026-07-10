/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 🤖 اسم البوت: ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * 📝 الوظيفة: إنشاء نسخة احتياطية للبوت (Backup)
 * 🛡️ المطور: فول ستاك (Full Stack) - وحيد
 */

import fs from "fs"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import { generateWAMessageFromContent, generateMessageIDV2 } from '@whiskeysockets/baileys'
import crypto from 'crypto'

const execAsync = promisify(exec)

// ─── AIRich Class (مدمج للرسائل الغنية) ──────────────────────────────────
class AIRich {
   #client
   constructor(client) {
      if (!client) throw new Error('Socket is required')
      this.#client = client
      this._title = '⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌'
      this._submessages = []
      this._sections = []
      this._richResponseSources = []
   }
   static newLayout(name, data) {
      return { view_model: { [Array.isArray(data) ? 'primitives' : 'primitive']: data, __typename: `GenAI${name}LayoutViewModel` } }
   }
   addText(text) {
      this._submessages.push({ messageType: 2, messageText: text })
      this._sections.push(AIRich.newLayout('Single', { text, __typename: 'GenAIMarkdownTextUXPrimitive' }))
      return this
   }
   build(jid, { quoted } = {}) {
      const qObj = quoted ? { stanzaId: quoted?.key?.id || quoted?.id, participant: quoted?.key?.participant || quoted?.key?.remoteJid, quotedType: 0, quotedMessage: quoted.message ?? quoted } : {}
      const message = {
         messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, botMetadata: { messageDisclaimerText: this._title, richResponseSourcesMetadata: { sources: this._richResponseSources } } },
         botForwardedMessage: { message: { richResponseMessage: { messageType: 1, submessages: this._submessages, unifiedResponse: { data: Buffer.from(JSON.stringify({ response_id: crypto.randomUUID(), sections: this._sections })).toString('base64') }, contextInfo: { ...qObj } } } }
      }
      return generateWAMessageFromContent(jid, message, { messageId: generateMessageIDV2() })
   }
   async send(jid, options = {}) {
      const msg = await this.build(jid, options)
      return this.#client.relayMessage(jid, msg.message, { messageId: msg.key.id, ...options })
   }
}

// ─── المعالج الرئيسي ────────────────────────────────────────────────────
let handler = async (m, { conn, text }) => {
   // ✅ الأمر مقصور على المطور الرئيسي فقط (باستخدام handler.owner = true)
   // سنقوم بالتحقق في الأسفل باستخدام m.sender مع رقم المطور مباشرةً
   // لكن الأفضل استخدام handler.owner = true (سيتم ضبطه خارجياً)

   // لكننا سنستخدم التحقق المباشر برقم المطور الرئيسي لتأكيد الأمان
   const ownerNumber = '212698078610@s.whatsapp.net' // رقم المطور الرئيسي
   if (m.sender !== ownerNumber) {
      await new AIRich(conn)
         .addText(`🛑 *غير مسموح لك يا عبد* 🐉\n\n*هذا الأمر مخصص للمطور الرئيسي فقط.*`)
         .send(m.chat, { quoted: m })
      return
   }

   try {
      const tempDir = "./tmp"
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

      // حذف الملفات المؤقتة القديمة
      let files = fs.readdirSync(tempDir)
      if (files.length > 0) {
         for (let file of files) {
            try {
               fs.unlinkSync(path.join(tempDir, file))
            } catch (e) { /* تجاهل */ }
         }
      }

      // رسالة البداية الغنية
      await new AIRich(conn)
         .addText(`⏳ *| يتم الآن إنشاء نسخة احتياطية للبوت...* 🐉\n\n*سونيك ° يعمل بجد، قد يستغرق بعض الوقت...* 🕶️`)
         .send(m.chat, { quoted: m })

      const backupName = "SONIC-Bot-Backup"
      const backupPath = `${tempDir}/${backupName}.zip`

      // قائمة الملفات/المجلدات المستبعدة
      const excludedItems = [
         "node_modules",
         "auth",
         "Sessions",
         "tmp",
         "*.log",
         "database.json",
         "package-lock.json",
         "yarn.lock",
         "pnpm-lock.yaml",
         "npm-debug.log*",
         ".git"
      ]

      // بناء أمر zip مع استبعاد جميع العناصر غير المرغوبة
      const excludeArgs = excludedItems.map(item => `-x "${item}/*" "${item}"`).join(' ')

      // تنفيذ أمر الضغط بدون رسائل وسيطة
      try {
         await execAsync(
            `zip -r "${backupPath}" . ${excludeArgs} -q`,
            {
               maxBuffer: 1024 * 1024 * 50, // 50MB buffer
               cwd: process.cwd()
            }
         )
      } catch (zipError) {
         // إذا فشل الضغط الكامل، نجرب طريقة بديلة
         const includeItems = fs.readdirSync(".").filter(item => {
            return !excludedItems.includes(item) &&
               !item.startsWith('.') &&
               item !== 'node_modules' &&
               item !== 'auth' &&
               item !== 'Sessions' &&
               item !== 'tmp'
         })

         if (includeItems.length === 0) {
            throw new Error("لم يتم العثور على ملفات للضغط")
         }

         await execAsync(
            `zip -r "${backupPath}" ${includeItems.join(' ')} -q`,
            {
               maxBuffer: 1024 * 1024 * 50,
               cwd: process.cwd()
            }
         )
      }

      // التحقق من وجود الملف المضغوط
      if (!fs.existsSync(backupPath)) {
         throw new Error("فشل في إنشاء ملف الضغط")
      }

      // الحصول على حجم الملف
      const stats = fs.statSync(backupPath)
      const fileSize = (stats.size / (1024 * 1024)).toFixed(2)

      // إرسال النسخة الاحتياطية للمطور فقط
      await conn.sendMessage(
         m.sender,
         {
            document: fs.readFileSync(backupPath),
            fileName: `${backupName}.zip`,
            mimetype: "application/zip",
         },
         { quoted: m }
      )

      // تنظيف الملف المؤقت
      try {
         fs.unlinkSync(backupPath)
      } catch { /* تجاهل */ }

      // رسالة النجاح الغنية
      await new AIRich(conn)
         .addText(`🎉 *| تم إرسال نسخة البوت بنجاح!* 🐉\n\n*الملفات المستبعدة:*\n📁 node_modules\n📁 auth\n📁 Sessions\n📁 tmp\n📄 database.json\n📄 package-lock.json\n\n*الحجم النهائي:* ${fileSize} MB\n\n𝚂𝙾𝙽𝙸𝙲 𝘽𝙊𝙏 ⃝⛓️‍💥`)
         .send(m.chat, { quoted: m })

   } catch (e) {
      console.error('Backup Error:', e)
      await new AIRich(conn)
         .addText(`❌ *| فشل في إنشاء النسخة الاحتياطية!* 🐉\n\n*السبب:* ${e.message || 'حجم البيانات كبير جداً'}\n\n*حاول مجدداً أو استخدم طريقة بديلة...* 🕶️\n\n𝚂𝙾𝙽𝙸𝙲 𝘽𝙊𝙏 ⃝⛓️‍💥`)
         .send(m.chat, { quoted: m })
   }
}

handler.help = ["سكربتي", "backup"]
handler.tags = ["owner"]
handler.command = /^(سكربتي|\.سكربتي|نسخ|\.نسخ|backup)$/i
handler.owner = true   // ✅ يسمح فقط للمطور الرئيسي (الموجود في config)

export default handler