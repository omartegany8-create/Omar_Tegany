// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  📌 أمر بحث صور بنترست - كاروسيل فخم
//  🤖 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch"
import {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent,
} from "@whiskeysockets/baileys"

let handler = async (m, { conn, text, usedPrefix, command }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const botName = '𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪'

  // رسالة المساعدة بشكل منظم جداً ومزخرف
  if (!text) {
    await react('❌')
    return m.reply(
      `🕸️⃟🕷️ ═══ 𓆩 𝑴𝑬𝑹𝑶 𝑷𝑰𝑵𝑻𝑬𝑹𝑬𝑺𝑻 𓆪 ═══ 🕸️⃟🕷️\n\n` +
      `📌 *يا حب، اكتب كلمة البحث بعد الأمر!*\n\n` +
      `⚡ *الاستخدام:* \n` +
      ` ➥ ${usedPrefix + command} <كلمة البحث>\n\n` +
      `💡 *أمثلة للبحث:* \n` +
      ` ➥ ${usedPrefix + command} anime\n` +
      ` ➥ ${usedPrefix + command} wallpaper\n` +
      ` ➥ ${usedPrefix + command} naruto\n\n` +
      `⊱⋅ ─────────────── ⋅⊰\n` +
      `⚡ ${botName} 🕸️ 🕷️`
    )
  }

  await react('⏳')
  
  // رسالة الانتظار بتصميم شيك
  let waitMsg = await m.reply(`🔍 *جـاري الـبـحـث عـن:* « ${text} »\n> ⏳ ثواني وبجيب لك أروق الصور من بنترست...`)

  try {
    const images = await searchPinterest(text)

    if (!images || images.length === 0) {
      await react('❌')
      return m.reply(`❌ *ملقيتش صور لـ:* « ${text} » \n💡 *جرب تكتب الكلمة بالإنجليزي عشان تطلع نتايج أحسن.*`)
    }

    console.log('✅ Found', images.length, 'images for:', text)

    // ─── تجهيز الكاروسيل الفخم ────────────────
    let cards = []
    let counter = 1

    // هناخد أعلى 10 صور جودة
    for (let imageUrl of images.slice(0, 10)) {
      try {
        const imgRes = await fetch(imageUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36' }
        })

        if (!imgRes.ok) continue

        const buffer = Buffer.from(await imgRes.arrayBuffer())
        if (buffer.length < 1000) continue

        const { imageMessage } = await generateWAMessageContent(
          { image: buffer },
          { upload: conn.waUploadToServer }
        )

        if (!imageMessage) continue

        cards.push({
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: `🕸️⃟🕷️ *𝑴𝑬𝑹𝑶 𝑷𝑰𝑵𝑻𝑬𝑹𝑬𝑺𝑻* 🕸️⃟🕷️\n\n🔎 *الـبـحـث:* ${text}\n📸 *الـصـورة رقـم:* [ ${counter} ]`
          }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            hasMediaAttachment: true,
            imageMessage: imageMessage
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [{
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "📌 فتح في Pinterest",
                url: 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent(text)
              })
            }]
          })
        })

        counter++
      } catch {
        continue
      }
    }

    if (cards.length === 0) {
      await react('❌')
      return m.reply('❌ *فشلت عملية معالجة وتجهيز الصور، جرب تاني.*')
    }

    // ─── إرسال الكاروسيل النهائي ────────────────
    const finalMessage = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `✨ *تـم الـعـثـور عـلـى [ ${cards.length} ] صـور مـروقـة!* \n\n` +
                   `> 🔍 *الـبـحـث:* ${text}\n` +
                   `> ⚡ *اسـحـب يـمـيـن وشـمـال لـرؤية بـاقـي الـصـور*\n\n` +
                   `🕯️ 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕯️`
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: cards
            })
          })
        }
      }
    }, { quoted: m })

    // مسح رسالة الانتظار عشان الشات يفضل نضيف والمنظر يكون توب
    try { await conn.sendMessage(m.chat, { delete: waitMsg.key }) } catch {}

    await conn.relayMessage(m.chat, finalMessage.message, { messageId: finalMessage.key.id })
    await react('✅')

  } catch (e) {
    console.error('❌ Pinterest Error:', e)
    await react('❌')
    m.reply('❌ *حصل خطأ مفاجئ أثناء البحث:* ' + e.message)
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🔍 دالة البحث وتخطي الحماية والبدائل
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function searchPinterest(query) {
  try {
    const sessionRes = await fetch('https://www.pinterest.com/search/pins/?q=' + encodeURIComponent(query), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html'
      },
      redirect: 'follow'
    })

    const setCookies = sessionRes.headers.raw()['set-cookie'] || []
    let csrfToken = ''
    let cookieStr = ''

    for (const cookie of setCookies) {
      const parts = cookie.split(';')[0]
      cookieStr += parts + '; '
      if (parts.startsWith('csrftoken=')) {
        csrfToken = parts.split('=')[1]
      }
    }

    if (sessionRes.ok) {
      const html = await sessionRes.text()
      const jsonMatch = html.match(/{"resource_response":.+?"results":\[.+?\]/)
      if (jsonMatch) {
        try {
          const imgPattern = /https:\/\/i\.pinimg\.com\/(?:originals|736x|564x)\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]+\.(?:jpg|png|jpeg)/gi
          const matches = html.match(imgPattern)
          if (matches && matches.length > 3) {
            return [...new Set(matches)]
          }
        } catch {}
      }

      if (csrfToken && cookieStr) {
        const dataObj = {
          options: { query: query, scope: "pins", page_size: 25, rs: "typed", redux_normalize_feed: true },
          context: {}
        }
        const sourceUrl = '/search/pins/?q=' + encodeURIComponent(query) + '&rs=typed'
        const body = 'source_url=' + encodeURIComponent(sourceUrl) + '&data=' + encodeURIComponent(JSON.stringify(dataObj))

        const apiRes = await fetch('https://www.pinterest.com/resource/BaseSearchResource/get/', {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
            'Accept': 'application/json, text/javascript, */*',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken,
            'X-Pinterest-Source-Url': sourceUrl,
            'Cookie': cookieStr
          },
          body: body
        })

        if (apiRes.ok) {
          const data = await apiRes.json()
          const results = data?.resource_response?.data?.results
          if (results && results.length > 0) {
            return results.map(pin => pin.images?.orig?.url || pin.images?.['736x']?.url || pin.images?.['564x']?.url).filter(Boolean)
          }
        }
      }

      const allImages = []
      const patterns = [
        /https:\/\/i\.pinimg\.com\/originals\/[^\s"'\\><]+\.(?:jpg|png|jpeg)/gi,
        /https:\/\/i\.pinimg\.com\/736x\/[^\s"'\\><]+\.(?:jpg|png|jpeg)/gi,
        /https:\/\/i\.pinimg\.com\/564x\/[^\s"'\\><]+\.(?:jpg|png|jpeg)/gi
      ]
      for (const pattern of patterns) {
        const matches = html.match(pattern)
        if (matches) allImages.push(...matches)
      }
      if (allImages.length > 0) return [...new Set(allImages)]
    }
  } catch (e) {
    console.log('❌ Pinterest session Error:', e.message)
  }

  // ─── البديل الأول: Unsplash ───
  try {
    const res = await fetch('https://unsplash.com/napi/search/photos?query=' + encodeURIComponent(query) + '&per_page=15', { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (res.ok) {
      const data = await res.json()
      if (data.results?.length > 0) return data.results.map(photo => photo.urls?.regular || photo.urls?.small).filter(Boolean)
    }
  } catch {}

  // ─── البديل الثاني: Pixabay ───
  try {
    const res = await fetch('https://pixabay.com/api/?key=46488553-0b3cf67e62b8a0caf11764aa5&q=' + encodeURIComponent(query) + '&per_page=15&image_type=photo')
    if (res.ok) {
      const data = await res.json()
      if (data.hits?.length > 0) return data.hits.map(img => img.largeImageURL || img.webformatURL).filter(Boolean)
    }
  } catch {}

  return null
}

handler.help = ['pin <بحث>', 'بنترست <بحث>']
handler.tags = ['downloader']
handler.command = /^(بنترست|بينترست|pin|pinterest)$/i

export default handler
          
