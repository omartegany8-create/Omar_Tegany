// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🏓 أمر البنج — قياس سرعة الاستجابة الحقيقية
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { performance } from 'perf_hooks'

const PING_IMAGE = "https://telegra.ph/file/0de0a00df887e0766be33.jpg" // رابط صورتك الفخمة

let handler = async (m, { conn }) => {
    // قياس بداية المعالجة بدقة عالية جداً
    const old = performance.now()
    
    const react = async (emoji) => {
        try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
    }

    await react("🏓")

    // قياس النهاية وحساب الفرق
    const neww = performance.now()
    const speed = (neww - old).toFixed(4) // دقة تصل لـ 4 أرقام عشرية

    // تحديد الحالة بناءً على سرعة الـ CPU والمعالجة
    const status =
        speed < 5   ? "⚡ سـريـع كـالـبـرق" :
        speed < 20  ? "✅ مـمـتـاز"      :
        speed < 50  ? "🟡 مـقـبـول"     :
                      "🔴 بـطـيء نـسـبـيـاً"

    const pingMsg = 
      `*╔═━═━═━ ◦ • ⊰🏓⊱ • ◦ ━═━═━═╗*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
      `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
      `> *【🏓】اخـتـبـار سـرعـة الاسـتـجـابـة ✨*\n\n` +
      `*➸ الـحـالـة:* *${status}*\n` +
      `*➸ الـسـرعـة:* *${speed} ms*\n\n` +
      `*╔═━═━═━ ◦ • ⊰🕷️⊱ • ◦ ━═━═━═╗*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
      `*╚═━═━═━ ◦ • ⊰🏓⊱ • ◦ ━═━═━═╝*`

    // إرسال الصورة مع الكابشن الموزون
    await conn.sendMessage(m.chat, { 
        image: { url: PING_IMAGE }, 
        caption: pingMsg 
    }, { quoted: m })
    
    await react("✅")
}

handler.help    = ["fps", "ping"]
handler.tags    = ["info"]
handler.command = /^(بنج|ping|بينج|pong)$/i

export default handler
