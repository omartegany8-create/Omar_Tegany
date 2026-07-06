import { addExif } from '../lib/sticker.js'

let handler = async (m, { conn, text }) => {
    const react = async (emoji) => {
        try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
    }

    // ━━━ 1. التأكد من وجود رد على استيكر ━━━
    if (!m.quoted) {
        await react('❌')
        return m.reply('❌ *يا حب، لازم تعمل ريبلاي (رد) على الاستيكر اللي عايز تغير حقوقه!*')
    }

    // ━━━ 2. فصل اسم الحزمة واسم المؤلف وتحديد الافتراضي ━━━
    let packname, author
    
    if (text) {
        let parts = text.split('|')
        packname = parts[0] ? parts[0].trim() : '—̳͟͞͞☁️ 𓆩𝑺𝑻𝑰𝑪𝑲𝑬𝑹𝑺𓆪 🕸️⃟🕷️'
        author = parts[1] ? parts[1].trim() : '𓆩𝑴𝑬𝑹𝑶𓆪🕯️ ☁︎'
    } else {
        // الحقوق الافتراضية الصايعة بتاعتك لو مأكتبش حاجة
        packname = '—̳͟͞͞☁️ 𓆩𝑺𝑻𝑰𝑪𝑲𝑬𝑹𝑺𓆪 🕸️⃟🕷️'
        author = '𓆩𝑴𝑬𝑹𝑶𓆪🕯️ ☁︎'
    }

    // رياكشن الانتظار والبدء
    await react('⏳')

    let stiker = false
    try {
        let mime = m.quoted.mimetype || ''
        if (!/webp/.test(mime)) {
            await react('❌')
            return m.reply('❌ *ده مش استيكر يسطا! تأكد انك عامل ريبلاي على استيكر حقيقي.*')
        }
        
        // تحميل داتا الاستيكر
        let img = await m.quoted.download()
        if (!img) throw new Error('فشل تحميل الاستيكر')
        
        // حقن الحقوق الجديدة المخفية (EXIF) داخل ملف الاستيكر
        stiker = await addExif(img, packname, author)
        
    } catch (e) {
        console.error(e)
        if (Buffer.isBuffer(e)) stiker = e
    } finally {
        if (stiker) {
            // إرسال الاستيكر الجديد بالحقوق المعدلة
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
            await react('✅')
        } else {
            await react('❌')
            throw '⚠️ حصلت مشكلة أثناء حقن الحقوق الجديدة في ملف الاستيكر.'
        }
    }
}

handler.help = ['st <حزمة>|<مؤلف>']
handler.tags = ['sticker']
handler.command = /^(st|حقوق)$/i // الاختصار السريع .st

export default handler
    
