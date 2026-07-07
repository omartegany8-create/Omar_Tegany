import fetch from "node-fetch"

// ═══════════════════════════════════════════════════════
//  🔑 Client IDs (محدثة لتجنب الحظر)
// ═══════════════════════════════════════════════════════
let CLIENT_IDS = [
  'DzA2vRpkKqKVM37Lh9O3XPIJwTpL4U9M',  
  'a3e059563d7fd3372b49b37f00a00bcf',
  'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX',
  'KKzJxmw11tYpCs6T24P4uUYhqmjalG6M',
  'ZbE1zOjMvRkXpL2qW8yN5cF7uA3sD6gH9jK',  
]

let lastRequestTime = 0
const MIN_DELAY = 3000 // 3 ثواني تأخير لحماية السيرفر

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForRateLimit() {
  const now = Date.now()
  const timeSinceLast = now - lastRequestTime
  if (timeSinceLast < MIN_DELAY) {
    await delay(MIN_DELAY - timeSinceLast)
  }
  lastRequestTime = Date.now()
}

// ═══════════════════════════════════════════════════════
//  🎵 SoundCloud Search
// ═══════════════════════════════════════════════════════
async function searchSoundCloud(query) {
  const clientIds = await getClientIds()
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Origin': 'https://soundcloud.com',
    'Referer': 'https://soundcloud.com/'
  }

  for (const cid of clientIds) {
    try {
      await waitForRateLimit()
      const url = `https://api-v2.soundcloud.com/search?q=${encodeURIComponent(query)}&client_id=${cid}&limit=5`
      const res = await fetch(url, { headers })
      if (res.status === 429) {
        await delay(5000)
        continue
      }
      if (!res.ok) continue
      const data = await res.json()
      const tracks = data?.collection?.filter(item => item.kind === 'track') || []
      if (tracks.length > 0) return tracks
    } catch (err) {
      console.log(`خطأ في البحث: ${err.message}`)
    }
  }
  return []
}

// ═══════════════════════════════════════════════════════
//  📥 طريقة التحميل الأساسية API
// ═══════════════════════════════════════════════════════
async function method1_API(trackUrl, trackData) {
  const clientIds = await getClientIds()
  for (const cid of clientIds) {
    try {
      await waitForRateLimit()
      let track = trackData
      
      if (!track?.media?.transcodings?.length) {
        const resolveUrl = `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(trackUrl)}&client_id=${cid}`
        const res = await fetch(resolveUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/json' }
        })
        if (res.status === 429) { await delay(3000); continue }
        if (res.ok) track = await res.json()
      }
      
      if (!track?.media?.transcodings?.length) continue
      const tc = track.media.transcodings
      const pick = tc.find(t => t.format?.protocol === 'progressive') || tc[0]
      if (!pick?.url) continue
      
      const sep = pick.url.includes('?') ? '&' : '?'
      const streamRes = await fetch(`${pick.url}${sep}client_id=${cid}`, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
      })
      if (streamRes.status === 429) { await delay(3000); continue }
      if (!streamRes.ok) continue
      const streamData = await streamRes.json()
      if (!streamData?.url) continue
      
      return {
        audioUrl: streamData.url,
        title: track.title || 'SoundCloud',
        quality: 'MP3',
        thumb: track.artwork_url ? track.artwork_url.replace('large', 't500x500') : null,
        duration: track.duration,
        method: 'SoundCloud API'
      }
    } catch (err) {
      console.log(`طريقة API فشلت: ${err.message}`)
    }
  }
  return null
}

// ═══════════════════════════════════════════════════════
//  🎮 Handler (الزخرفة الكبيرة والنظيفة)
// ═══════════════════════════════════════════════════════
let handler = async (m, { conn, text, usedPrefix, command }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  // ─── 1️⃣ تحميل مباشر من رابط ────────────────────
  if (text && text.includes('soundcloud.com')) {
    react('⏳')
    await m.reply('⏳ **جاري معالجة الرابط وتحميل الأغنية...**')

    try {
      const result = await downloadSoundCloud(text.trim())

      const caption = 
        `🎵 *S O U N D C L O U D*\n` +
        `─── · · · 🎧 · · · ───\n\n` +
        `📝 *اسم المقطع:* **${result.title}**\n` +
        `💿 *الجودة:* **${result.quality}**\n` +
        `🚀 *المصدر:* **${result.method}**\n\n` +
        `─── · · · ✨ · · · ───`

      if (result.thumb) {
        try {
          await conn.sendMessage(m.chat, { image: { url: result.thumb }, caption: caption }, { quoted: m })
        } catch {
          await m.reply(caption)
        }
      } else {
        await m.reply(caption)
      }

      const fileName = cleanFileName(result.title) + '.mp3'

      await conn.sendMessage(m.chat, {
        audio: { url: result.audioUrl },
        fileName: fileName,
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: m })

      react('✅')
    } catch (e) {
      react('❌')
      let errorMsg = e.message
      if (errorMsg.includes('rate') || errorMsg.includes('429')) {
        errorMsg = 'الخدمة مشغولة حالياً، حاول بعد دقائق'
      }
      m.reply('❌ **فشل التحميل:** ' + `**${errorMsg}**`)
    }
    return
  }

  // ─── 2️⃣ لو مفيش نص (رسالة المساعدة المحترفة) ───────────────────────
  if (!text) {
    react('🎵')
    return m.reply(
      `🎵 *S O U N D C L O U D*\n` +
      `─── · · · 🔍 · · · ───\n\n` +
      `📥 **يمكنك البحث وتحميل الأغاني والمقاطع الصوتية بكل سهولة**\n\n` +
      `📌 *الاستخدام:* \n` +
      `**${usedPrefix + command} <اسم الأغنية أو الرابط>**\n\n` +
      `💡 *مثال:* \n` +
      `**${usedPrefix + command} سورة البقرة ماهر المعيقلي**\n\n` +
      `─── · · · ✨ · · · ───`
    )
  }

  // ─── 3️⃣ بحث + تحميل أول نتيجة ────────────
  react('🔍')
  await m.reply(`🔍 **جاري البحث عن:** **${text}**...`)

  try {
    const tracks = await searchSoundCloud(text)

    if (!tracks.length) {
      react('❌')
      return m.reply(`❌ **عذراً، لم أجد أي نتائج للبحث عن:** **${text}**`)
    }

    const track = tracks[0]
    const artistName = track.user?.full_name || track.user?.username || 'Unknown'

    await m.reply(
      `✨ **تم العثور على الأغنية!**\n\n` +
      `🎵 *المقطع:* **${track.title}**\n` +
      `👤 *الفنان:* **${artistName}**\n\n` +
      `⏳ **جاري السحب والتحميل الآن...**`
    )

    const result = await downloadSoundCloud(track.permalink_url, track)
    const artUrl = track.artwork_url ? track.artwork_url.replace('large', 't500x500') : null

    const caption = 
      `🎵 *S O U N D C L O U D*\n` +
      `─── · · · 🎧 · · · ───\n\n` +
      `🎶 *العنوان:* **${track.title}**\n` +
      `👤 *المغني:* **${artistName}**\n` +
      `⏱️ *المدة:* **${formatDuration(track.duration)}**\n` +
      `👁️ *المشاهدات:* **${formatNum(track.playback_count)}**\n` +
      `❤️ *التفاعلات:* **${formatNum(track.likes_count)}**\n` +
      `🚀 *الطريقة:* **${result.method}**\n\n` +
      `─── · · · ✨ · · · ───`

    if (artUrl) {
      try {
        await conn.sendMessage(m.chat, { image: { url: artUrl }, caption: caption }, { quoted: m })
      } catch {
        await m.reply(caption)
      }
    } else {
      await m.reply(caption)
    }

    const fileName = cleanFileName(track.title) + '.mp3'

    await conn.sendMessage(m.chat, {
      audio: { url: result.audioUrl },
      fileName: fileName,
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

    react('✅')

  } catch (e) {
    console.error('SoundCloud Error:', e)
    react('❌')
    let errorMsg = e.message
    if (errorMsg.includes('rate') || errorMsg.includes('429')) {
      errorMsg = 'الخدمة مشغولة حالياً بكثرة الطلبات، انتظر قليلاً'
    }
    m.reply('❌ **فشل التحميل:** ' + `**${errorMsg}**`)
  }
}

// ═══════════════════════════════════════════════════════
//  🔧 الدوال الفرعية المساعدة
// ═══════════════════════════════════════════════════════
async function getClientIds() { return CLIENT_IDS }

function formatDuration(ms) {
  if (!ms) return '0:00'
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return min + ':' + String(sec).padStart(2, '0')
}

function formatNum(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

function cleanFileName(name) {
  if (!name) return 'audio'
  return name.replace(/[<>:"/\\|?*]/g, '').substring(0, 50).trim() || 'audio'
}

async function method2_Cobalt(trackUrl) {
  try {
    const res = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify({ url: trackUrl, downloadMode: 'audio', audioFormat: 'mp3', vCodec: 'copy', aFormat: 'mp3' })
    })
    const data = await res.json()
    if (data.url) return { audioUrl: data.url, title: 'SoundCloud', quality: 'MP3', method: 'Cobalt' }
  } catch {}
  return null
}

async function method3_FabDL(trackUrl) {
  try {
    const infoRes = await fetch(`https://api.fabdl.com/soundcloud/get?url=${encodeURIComponent(trackUrl)}`)
    const info = await infoRes.json()
    if (!info?.result?.id) return null

    const dlRes = await fetch(`https://api.fabdl.com/soundcloud/mp3-convert-task/${info.result.id}`)
    const dlData = await dlRes.json()
    if (dlData?.result?.download_url) {
      return {
        audioUrl: `https://api.fabdl.com${dlData.result.download_url}`,
        title: info.result.title || 'SoundCloud',
        quality: 'MP3',
        thumb: info.result.image || null,
        method: 'FabDL'
      }
    }
  } catch {}
  return null
}

async function downloadSoundCloud(trackUrl, trackData = null) {
  const methods = [
    () => method1_API(trackUrl, trackData),
    () => method2_Cobalt(trackUrl),
    () => method3_FabDL(trackUrl),
  ]
  for (const fn of methods) {
    try {
      const result = await fn()
      if (result?.audioUrl) return result
      await delay(1000)
    } catch (err) {
      console.log(`طريقة فشلت: ${err.message}`)
    }
  }
  throw new Error('فشلت جميع طرق التحميل المتوفرة')
}

// ═══════════════════════════════════════════════════════
//  الأوامر المطلوبة كاملة 🚀
// ═══════════════════════════════════════════════════════
handler.help = ['ساوند <اسم الأغنية>']
handler.tags = ['downloader']
handler.command = /^(soundcloud|ساوند|اغنيه|اغنية|sc)$/i

export default handler
      
