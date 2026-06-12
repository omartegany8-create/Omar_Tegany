/*
code: premium media to sticker (حقوق ميرو الفخمة)
by: 𝐓𝐨جي & Gemini
*/
import { createSticker } from "../../system/utils.js";

const handler = async (m, { conn, command }) => {
    // تحديد الميديا سواء مقتبسة (quoted) أو الرسالة المباشرة نفسها
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    // التحقق إذا كانت الميديا صورة أو فيديو أو ملصق
    if (!/image|video|sticker/.test(mime)) {
        return m.reply("📸 *يرجى الرد على (صورة، فيديو، أو ملصق) لتحويله بحقوقك الفخمة!*");
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    try {
        // تحميل الميديا وتحويلها لبافر
        const mediaBuffer = await q.download();
        if (!mediaBuffer) throw new Error("Failed to download media");

        // اسم الباك والمؤلف حسب طلبك بالملّي
        const packName = "ᯓ 𝑩𝒚┆ 𓆩 𝑺𝑻𝑰𝑪𝑲𝑬𝑹𝑺 ✮⃝";
        const authorName = "👻 𝑴𝑬𝑹𝑶 𓆪 ☁︎";

        // صناعة الملصق الاحترافي
        const stickerBuffer = await createSticker(mediaBuffer, {
            mime: mime,
            pack: packName,
            author: authorName
        });

        await conn.sendMessage(m.chat, { react: { text: "🎴", key: m.key } });

        // إرسال الملصق مع لوحة معلومات ميرو الجانبية
        await conn.sendMessage(
            m.chat,
            { 
                sticker: stickerBuffer, 
                contextInfo: contextInfoStyle(m.sender, "https://i.pinimg.com/736x/d5/c6/c1/d5c6c1f4a0562c5c7630ae59d19c33c8.jpg") 
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply("❌ *حصل خطأ أثناء معالجة وصناعة الملصق، تأكد إن الميديا صالحة يسطا!*");
    }
};

handler.help = ["ملصق"];
handler.tags = ["sticker"];
handler.command = ["ملصق", "sticker", "S", "s", "حقوق"];
export default handler;

// ستايل المينيو والـ Context الفخم الخاص بـ MERO AI
const contextInfoStyle = (jid, img) => ({
    mentionedJid: [jid],
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '',
        newsletterName: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️',
        serverMessageId: 0
    },
    externalAdReply: {
        title: "𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️",
        body: "𝚆𝚑𝚊𝒕𝒔𝙰𝒑𝒑 𝚋𝚘𝒕 𝒕𝒉𝒂𝒕 𝒊𝒔 𝒆𝒂𝒔𝒚 𝒕𝒐 𝒎𝒐𝒅𝒊𝒇𝒚 𝒂𝒏𝒅 𝒗𝒆𝒓𝒚 𝒇𝒂𝒔𝒕",
        thumbnailUrl: img,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: true
    }
});
