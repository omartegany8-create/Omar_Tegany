import { proto, downloadMediaMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // التحقق من وجود رد على رسالة
        if (!m.quoted) {
            return conn.sendMessage(m.chat, { 
                text: `❌ يرجى الرد على ملصق (Sticker) لاستخدام هذا الأمر.

مثال: 
${usedPrefix}${command} (بالرد على ملصق)` 
            }, { quoted: m })
        }

        // الحصول على رسالة الملصق من الرسالة المقتبسة
        const quotedMsg = m.quoted
        const stickerMessage = quotedMsg.message?.stickerMessage
        
        // التحقق من أن الرسالة المقتبسة هي ملصق
        if (!stickerMessage) {
            return conn.sendMessage(m.chat, { 
                text: '❌ الرسالة المحددة ليست ملصقاً. يرجى الرد على ملصق صحيح.' 
            }, { quoted: m })
        }

        // تحميل الوسائط من الملصق باستخدام الرسالة المقتبسة مباشرة
        const media = await downloadMediaMessage(quotedMsg, 'buffer', {})
        
        if (!media) {
            return conn.sendMessage(m.chat, { 
                text: '❌ فشل في تحميل الملصق. يرجى المحاولة مرة أخرى.' 
            }, { quoted: m })
        }

        // إرسال الملصق كصورة عادية مع ذكر المرسل
        await conn.sendMessage(m.chat, {
            image: media,
            caption: '✅ تم تحويل الملصق إلى صورة',
            mentions: [m.sender]
        }, { quoted: m })

    } catch (e) {
        console.error('Error in stickertoimg:', e)
        return conn.sendMessage(m.chat, { 
            text: '❌ حدث خطأ أثناء تحويل الملصق: ' + e.message 
        }, { quoted: m })
    }
}

handler.help = ['toimg', 'stickertoimg']
handler.tags = ['tools', 'converter']
handler.command = /^(toimg|stickertoimg|simg|stickertoimage)$/i

export default handler