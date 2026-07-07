import fetch from 'node-fetch'
import { join } from 'path'
import { tmpdir } from 'os'
import { createWriteStream, unlinkSync, statSync } from 'fs'
import { pipeline } from 'stream/promises'
import yts from 'yt-search'
import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys'

// ━━━ دالة التحميل من سيرفر خارجي (SaveNow) ━━━
async function downloadFromSaveNow(url, quality) {
  const isAudio = quality === 'mp3'
  const format   = isAudio ? 'mp3' : quality

  const initRes  = await fetch(
    `https://p.savenow.to/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&add_info=1`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://savenow.to/',
        Origin: 'https://savenow.to'
      },
      timeout: 30000
    }
  )
  const initJson = await initRes.json()
  const jobId = initJson?.id
  if (!jobId) throw new Error('فشل بدء سحب الملف')

  let downloadUrl = null
  const maxTries = isAudio ? 30 : 60
  for (let i = 0; i < maxTries; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const progRes  = await fetch(`https://p.savenow.to/ajax/progress?id=${jobId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://savenow.to/' },
      timeout: 15000
    })
    const progJson = await progRes.json()
    if (progJson?.success === 1 && progJson?.download_url) {
      downloadUrl = progJson.download_url
      break
    }
    if (progJson?.error) throw new Error(progJson?.error)
  }
  if (!downloadUrl) throw new Error('انتهى وقت الانتظار')
  return downloadUrl
}

// ━━━ الـ Handler الرئيسي ━━━
let handler = async (m, { conn, text, args, usedPrefix, command }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  // ─── [1] أمر التحميل الفعلي من الأزرار ──────────────────
  if (command === 'ytv-dl') {
    if (!args[0]) return
    const quality = args[0]
    const url     = args.slice(1).join(' ')
    if (!url) return
    
    const isAudio = quality === 'mp3'
    react('⏳')
    await m.reply(`⏳ (*جـاري تـحـمـيـل الـمـلـف الآن...*)`)

    const ts      = Date.now()
    const ext     = isAudio ? 'mp3' : 'mp4'
    const outPath = join(tmpdir(), `yt_${ts}.${ext}`)

    try {
      const downloadUrl = await downloadFromSaveNow(url, quality)
      const dlRes = await fetch(downloadUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 120000 })
      if (!dlRes.ok) throw new Error(`السيرفر لم يستجب`)

      await pipeline(dlRes.body, createWriteStream(outPath))
      const size = statSync(outPath).size
      if (size < 1000) throw new Error('الملف تالف')

      if (isAudio) {
        await conn.sendMessage(m.chat, {
          audio: { url: outPath },
          mimetype: 'audio/mpeg',
          ptt: false
        }, { quoted: m })
      } else {
        const caption = 
          `*╭─┈─┈─┈─⟞🕸️⟝─┈─┈─┈─╮*\n` +
          `*┃ —̳͟͞͞☁️ 𓆩𝑴𝑬𝑹𝑶𓆪 🕸️⃟⁦🕷️ 𓆩𝑩𝑶𝑻𓆪〈*\n` +
          `*╰─┈─┈─┈─⟞🕷️⟝─┈─┈─┈─╯*\n\n` +
          `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
          `*⸙【 ◈|🕸️|◈  】 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐃𝐋*\n\n` +
          `*➸ الجودة:* *${quality}p*\n` +
          `*➸ الحالة:* *تم السحب بنجاح*\n\n` +
          `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
          `*𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️*`
        
        await conn.sendMessage(m.chat, { video: { url: outPath }, mimetype: 'video/mp4', caption: caption }, { quoted: m })
      }
      react('✅')
    } catch (err) {
      react('❌')
      m.reply(`❌ (*فـشـل الـتـحـمـيـل والـسـحـب*)`)
    } finally {
      try { unlinkSync(outPath) } catch {}
    }
    return
  }

  // ─── [2] لو مفيش نص (واجهة المساعدة المزخرفة بالكامل) ──────────────────
  if (!text) {
    react('☁️')
    return m.reply(
      `*╭─┈─┈─┈─⟞🕸️⟝─┈─┈─┈─╮*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝑴𝑬𝑹𝑶𓆪 🕸️⃟⁦🕷️ 𓆩𝑩𝑶𝑻𓆪〈*\n` +
      `*╰─┈─┈─┈─⟞🕷️⟝─┈─┈─┈─╯*\n\n` +
      `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
      `*𓆩  ✮⃝🕷️𓆪 الـيـوـتـيـوـب الـمـطـور*\n\n` +
      `*『  ˹🎶˼  』 وصف الميزة:* \n` +
      `*➤ يمكنك تحميل أي مقطع فيديو أو صوت من اليوتيوب*\n\n` +
      `*⤹ الاستخدام:* \n` +
      `*${usedPrefix + command} <اسم الفيديو / الرابط>*\n\n` +
      `*➸ مثال:* \n` +
      `*${usedPrefix + command} لوفي ضد كايدو*\n\n` +
      `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
      `*𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️*`
    )
  }

  // عمل ريأكت بالبحث فقط بدون إرسال رسائل مزعجة
  react('🔍')

  try {
    let video, url
    if (text.includes("youtube.com") || text.includes("youtu.be")) {
      const id = text.includes("v=") ? text.split("v=")[1].split("&")[0] : text.split("/").pop()
      const search = await yts({ videoId: id }).catch(() => null)
      if (!search) throw new Error()
      video = search
      url = text
    } else {
      const search = await yts(text).catch(() => null)
      if (!search?.videos?.length) {
        react('❌')
        return m.reply("❌ (*لـم يـتـم الـعـثـور عـلـى نـتـائـج*)")
      }
      video = search.videos[0]
      url = video.url
    }

    // تم العثور على الفيديو، نعمل ريأكت بنجاح علطول
    react('✅')

    const caption = 
      `*╭─┈─┈─┈─⟞🕸️⟝─┈─┈─┈─╮*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝑴𝑬𝑹𝑶𓆪 🕸️⃟⁦🕷️ 𓆩𝑩𝑶𝑻𓆪〈*\n` +
      `*╰─┈─┈─┈─⟞🕷️⟝─┈─┈─┈─╯*\n\n` +
      `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
      `*𓆩  ✮⃝🕷️𓆪 تـم الـعـثـور عـلـى الـفـيـدـيـو*\n\n` +
      `*↫ العنوان:* *${video.title}*\n` +
      `*↫ القناة:* *${video.author?.name || 'Unknown'}*\n` +
      `*↫ المدة:* *${video.timestamp}*\n` +
      `*↫ المشاهدات:* *${Number(video.views || 0).toLocaleString()}*\n\n` +
      `*𝖬𝖤𝖱𝖮 𝖡𝖮𝖳 🛠️ حدد الجودة المراد تحميلها من الأسفل:* \n` +
      `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
      `*𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️*`

    const buttons = [
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎬 144p جودة منخفضة', id: `.ytv-dl 144 ${url}` }) },
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📱 360p جودة عادية', id: `.ytv-dl 360 ${url}` }) },
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📺 720p جودة عالية', id: `.ytv-dl 720 ${url}` }) },
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎵 تحميل كـ صوت MP3', id: `.ytv-dl mp3 ${url}` }) },
    ]

    let imgMsg
    try {
      imgMsg = await prepareWAMessageMedia({ image: { url: video.thumbnail } }, { upload: conn.waUploadToServer })
    } catch {}

    const message = {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: `𓆩  𝑴𝑬𝑹𝑶 𝑩𝑶𝑻 𓆪  🕷️` }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: !!(imgMsg?.imageMessage),
              imageMessage: imgMsg?.imageMessage || null
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons })
          })
        }
      }
    }

    const msg = generateWAMessageFromContent(m.chat, message, { userJid: conn.user.jid })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error('ytvideo Error:', e)
    react('❌')
    m.reply("❌ (*حـصـل خـطـأ أثـنـاء الـبـحـث*)")
  }
}

handler.help    = ['يوتيوب']
handler.tags    = ['downloader']
handler.command = /^(يوتيوب|فيديو_يوتيوب|ytv-dl|ytv|sc-yt|فيديو)$/i
export default handler
