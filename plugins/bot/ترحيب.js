/* ⃟꙰⃢  𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌
   المطور الرئيسي: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ
   ملف: ترحيب.js (نظام الترحيب والمغادرة الملوكي المطور والمدمج)
*/

const welcomeVideoUrl = 'https://files.catbox.moe/ajhucr.mp4'
const defaultImage = 'https://files.catbox.moe/fg61lg.jpg'

if (!global.sonicWelcomeEvents) global.sonicWelcomeEvents = new Set()

function ensureGroupData(chatId) {
  if (!global.db) global.db = { data: { chats: {} } }
  if (!global.db.data) global.db.data = { chats: {} }
  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}
  return global.db.data.chats[chatId]
}

let handler = async (m, { conn, args }) => {
  if (!m.key.remoteJid.endsWith('@g.us')) return m.reply('❌ هذا الأمر فقط للمجموعات')
  
  const chatId = m.key.remoteJid
  const chat = ensureGroupData(chatId)
  
  if (args[0] === 'تشغيل' || args[0] === 'on') {
    chat.welcome = true
    m.reply('✅ تم تشغيل الترحيب والمغادرة في هذه المجموعة بنجاح')
  } else if (args[0] === 'إيقاف' || args[0] === 'off') {
    chat.welcome = false
    m.reply('❌ تم إيقاف الترحيب والمغادرة في هذه المجموعة')
  } else {
    m.reply(`📋 *حالة الترحيب الحالية:* ${chat.welcome ? '✅ مـفـعـل' : '❌ مـعـطـل'}\n\n⚙️ *طريقة التحكم:*\n◀️ للتشغيل: *.ترحيب تشغيل*\n◀️ للإيقاف: *.ترحيب إيقاف*`)
  }
}

handler.before = async (m, { conn }) => {
  if (!m.key.remoteJid.endsWith('@g.us')) return
  
  const chatId = m.key.remoteJid
  const chat = ensureGroupData(chatId)
  if (!chat.welcome) return

  // 27 = دخول | 28 و 32 = مغادرة وطرد
  const stubType = parseInt(m.messageStubType || m.msg?.stubType || 0, 10)
  if (![27, 28, 32].includes(stubType)) return

  const eventKey = `${chatId}_${stubType}_${m.messageStubParameters?.[0] || m.sender}_${m.messageTimestamp}`
  if (global.sonicWelcomeEvents.has(eventKey)) return
  global.sonicWelcomeEvents.add(eventKey)
  
  setTimeout(() => {
    global.sonicWelcomeEvents.delete(eventKey)
  }, 300000)

  try {
    const groupMetadata = await conn.groupMetadata(chatId)
    const groupName = groupMetadata.subject || 'المجموعة'
    const groupSize = groupMetadata.participants.length

    // جلب الـ ID الصافي للعضو المستهدف
    let targetJid = ''
    if (m.messageStubParameters && m.messageStubParameters[0]) {
      let rawParam = m.messageStubParameters[0]
      if (typeof rawParam === 'object') {
        targetJid = rawParam.id || JSON.stringify(rawParam).match(/\d+/)?.[0] + '@s.whatsapp.net'
      } else {
        targetJid = rawParam.includes('@') ? rawParam : rawParam.match(/\d+/)?.[0] + '@s.whatsapp.net'
      }
    }

    if (!targetJid || targetJid.includes('null') || targetJid.length < 15) {
      targetJid = m.participant || m.sender
    }

    const userId = targetJid.split('@')[0]
    let captionText = ''

    // 🟢 1. نظام الترحيب الموحد (عند الدخول)
    if (stubType === 27) {
      captionText = `
╭━━━═━─⊱ 👑 ⊰─━═━━━╮
  تـشـرّفـنـا بـانـضـامـك إلـيـنـا
╰━━━═━─⊱ 👑 ⊰─━═━━━╯

✨ أهـلاً ومـرحـبـاً بـك يـا غـالـي فـي الـمـجـمـوعـة

👤 ◄ الـعـضـو: @${userId}
🏰 ◄ الـمـجـمـوعـة: *${groupName}*
👥 ◄ الأصـحـاب الآن: *${groupSize}* مـشـعـشـعـيـن

⚡️ ─────『 📜 الـقـوانـيـن 』───── ⚡️

🚫 ◄ مـمـنـوع إرسـال الـروابـط الإعـلانـيـة.
🗣️ ◄ الـتـزام الاحـتـرام وتـجـنـب الـسـب أو الـمـشـاكـل.
🔞 ◄ نـشـر أي مـحـتـوى غـيـر لائـق يـعـرّضـك لـلـطـرد.
🤖 ◄ الـبـوت مـتـواجد لـخـدمـتـكـم وتـسـلـيـتـكـم.

👑 『 نـتـمـنـى لـك وقـتـاً مـمـتـعـاً مـعـنـا 』
      `.trim()
    }

    // 🔴 2. نظام المغادرة المدمج (يغطي الخروج والطرد معاً بشكل فخم)
    if (stubType === 28 || stubType === 32) {
      captionText = `
╭━━━═━─⊱ 🚪 ⊰─━═━━━╮
      غــادر الــقــافــلــة
╰━━━═━─⊱ 🚪 ⊰─━═━━━╯

👋 فـي أمـان الله.. نـتـمـنـى لـه الـتـوفـيـق

🚶‍♂️ ◄ الـعـضـو: @${userId}
🏰 ◄ مـن مـجـمـوعـة: *${groupName}*
📉 ◄ عـدد الأعـضـاء الـحـالـي: *${groupSize}* 🙂💔

⚡️ ─────────────────────── ⚡️
> 🚶‍♂️ نـلـتـقـي فـي مـنـاسـبـة أفـضـل، الـقـادم أجـمـل!
      `.trim()
    }

    if (!captionText) return

    // إرسال الوسائط
    try {
      await conn.sendMessage(chatId, {
        video: { url: welcomeVideoUrl },
        gifPlayback: true,
        caption: captionText,
        mentions: [targetJid],
      })
    } catch {
      await conn.sendMessage(chatId, {
        image: { url: defaultImage },
        caption: captionText,
        mentions: [targetJid],
      })
    }

  } catch (err) {
    console.error('❌ خطأ في نظام الترحيب المطور:', err)
  }
}

handler.command = ['ترحيب', 'welcome']

export default handler