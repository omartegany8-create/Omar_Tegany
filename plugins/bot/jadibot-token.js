/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
هذا الملف تم تعريبه وتحديث حقوقه بالكامل ليناسب:
- ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|
*/

import fs from 'fs'

async function handler(m, { usedPrefix }) {

const user = m.sender.split('@')[0]
if (fs.existsSync(`./${jadi}/` + user + '/creds.json')) {
let token = Buffer.from(fs.readFileSync(`./${jadi}/` + user + '/creds.json'), 'utf-8').toString('base64')    

const sonicFooter = '*╰━━━━━━━ 〔 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ 〕 ━━━━━━━╯*';

await conn.reply(m.chat, `🔑 *مـفـتـاح الـجـلـسـة (TOKEN) الـخـاص بـك:*\n\n⚠️ هذا الرمز يسمح لك بتسجيل الدخول كبوت فرعي في السيرفرات الأخرى، **وننصح بشدة بعدم مشاركته مع أي شخص نهائياً** لحماية خصوصية حسابك.\n\n*الـتـوكـن الـخـاص بـك هـو:*`, m)
await conn.reply(m.chat, token, m)
} else {
await conn.reply(m.chat, `🚫 *ليس لديك أي توكن نشط حالياً في النظام.*\n\nاستخدم الأمر \`${usedPrefix}qr\` أو \`${usedPrefix}code\` لربط حسابك وإنشاء توكن جديد أولاً.`, m)
}

}
handler.help = ['token']
handler.command = ['token']
handler.tags = ['serbot']
handler.private = true

export default handler
