/*
code: guaranteed media to sticker (حقوق ميرو الفخمة)
by: 𝐓𝐨جي & Gemini
*/

const handler = async (m, { conn, command }) => {
    // التحقق من وجود ميديا مقتبسة أو رسالة مباشرة
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (!/image|video|sticker/.test(mime)) {
        return m.reply("📸 *يرجى الرد على (صورة، فيديو، أو ملصق) لتحويله بحقوقك الفخمة!*");
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    try {
        // تحميل الميديا كـ Buffer
        const mediaBuffer = await q.download();
        if (!mediaBuffer) throw new Error("Failed to download media");

        // الحقوق الفخمة بتاعتك بالملّي
        const packName = "ᯓ 𝑩𝒚┆ 𓆩 𝑺𝑻𝑰𝑪𝑲𝑬𝑹𝑺 ✮⃝";
        const authorName = "👻 𝑴𝑬𝑹𝑶 𓆪 ☁︎";

        // إرسال الملصق بالاعتماد على ميثود البوت الداخلية المضمونة (conn.sendImageAsSticker أو conn.sendFile)
        // الفكرة هنا إننا بنباصي الـ pack و author جوه الـ options علطول
        await conn.sendMessage(m.chat, { 
            sticker: mediaBuffer,
            packname: packName,
            author: authorName,
            contextInfo: contextInfoStyle(m.sender, "https://i.pinimg.com/736x/d5/c6/c1/d5c6c1f4a0562c5c7630ae59d19c33c8.jpg")
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "🎴", key: m.key } });

    } catch (error) {
        console.error(error);
        // محاولة بديلة لو الميثود الأولى علقت بسبب نوع الـ Buffer
        try {
            const mediaBuffer = await q.download();
            await conn.sendFile(m.chat, mediaBuffer, 'sticker.webp', '', m, false, { 
                asSticker: true, 
                packname: "ᯓ 𝑩𝒚┆ 𓆩 𝑺𝑻𝑰𝑪𝑲𝑬𝑹𝑺 ✮⃝", 
                author: "👻 𝑴𝑬𝑹𝑶 𓆪 ☁︎" 
            });
            await conn.sendMessage(m.chat, { react: { text: "🎴", key: m.key } });
        } catch (err) {
            console.error(err);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply("❌ *حصلت مشكلة في تحويل الملصق بسورس البوت عندك!*");
        }
    }
};

handler.help = ["ملصق"];
handler.tags = ["sticker"];
handler.command = ["ملصق", "sticker", "S", "s", "حقوق"];
export default handler;

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
