// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🎬 أمر اديت - بحث عن اديتات شخصيات من تيك توك
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import axios from "axios"
import {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent,
} from "@whiskeysockets/baileys"

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const chat = m.chat

  const react = async (emoji) => {
    try { await conn.sendMessage(chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  // ─── لو مفيش اسم ─────────────────────
  if (!args[0]) {
    await react("🎬")
    return m.reply(
      `*╔═━═━═━ ◦ • ⊰🎬⊱ • ◦ ━═━═━═╗*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
      `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
      `> *【🎬】بـحـث اديـتـات تـيـك تـوك 🎥*\n\n` +
      `> *【🕯️】ابـحـث عـن اديـت لأي شـخـصـيـة ✨*\n\n` +
      `*📌 الـاسـتـخـدام:* \n` +
      `*${usedPrefix + command} <اسم الشخصية>*\n\n` +
      `*➸ أمـثـلـة:* \n` +
      `*${usedPrefix + command} لوفي*\n` +
      `*${usedPrefix + command} gojo*\n\n` +
      `*╔═━═━═━ ◦ • ⊰🕷️⊱ • ◦ ━═━═━═╗*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
      `*╚═━═━═━ ◦ • ⊰🎬⊱ • ◦ ━═━═━═╝*`
    )
  }

  const characterName = args.join(" ")
  const searchQuery = `${characterName} edit`

  await react("🔍")
  await m.reply(`🔍 (*جـاري الـبـحـث عـن اديـتـات لـ ${characterName}...*)`)

  try {
    // ─── البحث في تيك توك ────────────────
    const videos = await searchTikTok(searchQuery)

    if (!videos || videos.length === 0) {
      await react("❌")
      return m.reply(
        `❌ (*لـم يـتـم الـعـثـور عـلى اديـتـات لـ ${characterName}*)`
      )
    }

    let carouselSent = false

    try {
      await sendCarousel(conn, chat, m, characterName, videos)
      carouselSent = true
    } catch (carouselErr) {
      console.log("⚠️ Carousel failed, sending individually:", carouselErr.message)
    }

    // ─── لو الكاروسيل فشل: ارسل فيديوهات منفصلة ──
    if (!carouselSent) {
      await sendIndividualVideos(conn, chat, m, characterName, videos)
    }

    await react("✅")
  } catch (err) {
    console.error("❌ Edit Search Error:", err)
    await react("❌")
    m.reply(`❌ (*حـصـل خـطـأ أثـنـاء الـبـحـث*)`)
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🔍 دالة البحث في تيك توك (باستخدام Axios المضمونة)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function searchTikTok(query) {
  try {
    const res = await axios.post(
      "https://www.tikwm.com/api/feed/search",
      `keywords=${encodeURIComponent(query)}&count=10&cursor=0&HD=1`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          Accept: "application/json",
        }
      }
    )
    
    const json = res.data
    if (json.code === 0 && json.data?.videos?.length) {
      return json.data.videos.map((v) => ({
        title: v.title || "اديت 🎬",
        videoUrl: v.hdplay || v.play,
        cover: v.cover || v.origin_cover || "",
        author: v.author?.nickname || "غير معروف",
        username: v.author?.unique_id || "",
        duration: v.duration || 0,
        likes: v.digg_count || 0,
        comments: v.comment_count || 0,
        shares: v.share_count || 0,
        plays: v.play_count || 0,
      }))
    }
  } catch (e) {
    console.error("tikwm search error:", e.message)
  }
  return null
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🎠 إرسال كاروسيل (Carousel)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function sendCarousel(conn, chat, m, characterName, videos) {
  const selectedVideos = videos.slice(0, 5)

  const cards = await Promise.all(
    selectedVideos.map(async (video, index) => {
      const { videoMessage } = await generateWAMessageContent(
        { video: { url: video.videoUrl } },
        { upload: conn.waUploadToServer }
      )

      return {
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `❤️ ${formatNum(video.likes)} | 💬 ${formatNum(video.comments)} | 👁️ ${formatNum(video.plays)}`,
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: `👤 ${video.author} | ⏱️ ${video.duration}s`,
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: video.title.length > 60 ? video.title.substring(0, 57) + "..." : video.title,
          hasMediaAttachment: true,
          videoMessage: videoMessage,
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] }),
      }
    })
  )

  const msg = generateWAMessageFromContent(
    chat,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `*🎬 اديـتـات:* *${characterName}*\n*📊 تـم الـعـثـور عـلـى ${selectedVideos.length} فـيـديـوهـات*`,
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: "𓆩  𝑴𝑬𝑹𝑶 𝑩𝑶𝑻 𓆪  🕷️" }),
            header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards }),
          }),
        },
      },
    },
    { quoted: m }
  )

  await conn.relayMessage(chat, msg.message, { messageId: msg.key.id })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  📹 إرسال فيديوهات منفصلة (Fallback)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function sendIndividualVideos(conn, chat, m, characterName, videos) {
  const selectedVideos = videos.slice(0, 3)
  const total = selectedVideos.length

  for (let i = 0; i < total; i++) {
    const video = selectedVideos[i]

    const caption = 
      `*╔═━═━═━ ◦ • ⊰🎬⊱ • ◦ ━═━═━═╗*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
      `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
      `> *【🎬】اديت ${characterName} (${i + 1}/${total}) 🎥*\n\n` +
      `*↫ الـوصـف:* *${video.title}*\n` +
      `*↫ الـمـصـمم:* *${video.author}*\n` +
      `*↫ الـمـدة:* *${video.duration} ثانية*\n\n` +
      `*❤️ ${formatNum(video.likes)}*  |  *💬 ${formatNum(video.comments)}*\n` +
      `*🔄 ${formatNum(video.shares)}*  |  *👁️ ${formatNum(video.plays)}*\n\n` +
      `*╔═━═━═━ ◦ • ⊰🕷️⊱ • ◦ ━═━═━═╗*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
      `*╚═━═━═━ ◦ • ⊰🎬⊱ • ◦ ━═━═━═╝*`

    await conn.sendMessage(chat, { video: { url: video.videoUrl }, caption, mimetype: "video/mp4" }, { quoted: m })

    if (i < total - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }
}

function formatNum(n) {
  if (!n) return "0"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return n.toString()
}

handler.help = ["اديت <اسم شخصية>"]
handler.tags = ["downloader"]
handler.command = /^(اديت|edit|اديتات|edits)$/i

export default handler
