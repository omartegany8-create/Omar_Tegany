// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  📌 أمر بحث صور بنترست - المضمون والسريع
//  🤖 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch"

let handler = async (m, { conn, text, usedPrefix, command }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const botName = '𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪'

  if (!text) {
    await react('❌')
    return m.reply(
      `🕸️⃟🕷️ ═══ 𓆩 𝑴𝑬𝑹𝑶 𝑷𝑰𝑵𝑻𝑬𝑹𝑬𝑺𝑻 𓆪 ═══ 🕸️⃟🕷️\n\n` +
      `📌 *يا حب، اكتب كلمة البحث بعد الأمر!*\n\n` +
      `⚡ *الاستخدام:* \n` +
      ` ➥ ${usedPrefix + command} <كلمة البحث>\n\n` +
      `💡 *أمثلة للبحث:* \n` +
      ` ➥ ${usedPrefix + command} anime\n` +
      ` ➥ ${usedPrefix + command} wallpaper\n\n` +
      `⊱⋅ ─────────────── ⋅⊰\n` +
      `⚡ ${botName} 🕸️ 🕷️`
    )
  }

  await react('⏳')
  
  // رسالة الانتظار
  let waitMsg = await m.reply(`🔍 *جـاري الـبـحـث عـن:* « ${text} »\n> ⏳ ثواني وبجيب لك أروق الصور من بنترست...`)

  try {
    const images = await searchPinterest(text)

    if (!images || images.length === 0) {
      await react('❌')
      return m.reply(`❌ *ملقيتش صور لـ:* « ${text} » \n💡 *جرب تكتب الكلمة بالإنجليزي.*`)
    }

    // هنا هناخد أفضل 5 صور عشان الشات ميتمليش ورسايل الواتساب متتحظرش
    let topImages = images.slice(0, 5)
    
    // إرسال رسالة التقديم الفخمة
    await conn.sendMessage(m.chat, {
      text: `✨ *تـم الـعـثـور عـلـى نـتـائـج مـروقـة!* \n\n` +
           `> 🔍 *الـبـحـث:* ${text}\n` +
           `> 📸 *عـدد الـصـور:* [ ${topImages.length} ]\n\n` +
           `🕯️ 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕯️`
    }, { quoted: m })

    // إرسال الصور ورا بعض كألبوم منظم جداً
    let counter = 1
    for (let imageUrl of topImages) {
      try {
        await conn.sendMessage(m.chat, { 
          image: { url: imageUrl }, 
          caption: `📸 *الـصـورة رقـم:* [ ${counter} ]\n🔍 *الـبـحـث:* ${text}\n🤖 ${botName}`
        })
        counter++
      } catch {
        continue
      }
    }

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

    if (sessionRes.ok) {
      const html = await sessionRes.text()
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

  return null
}

handler.help = ['pin <بحث>', 'بنترست <بحث>']
handler.tags = ['downloader']
handler.command = /^(بنترست|بينترست|pin|pinterest)$/i

export default handler
