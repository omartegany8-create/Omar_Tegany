/*
code: text to white background sticker (أمر بريت الاحترافي)
by: 𝐓𝐨جي & Gemini
*/
import { createSticker } from "../../system/utils.js";

const handler = async (m, { conn, text, command }) => {
    if (!text) return m.reply(`📝 *الاستخدام الصحيح للأمر:*\n\n.${command} [النص اللي عايزه في الملصق]\n\n*مثال:*\n`.${command} Omar``);

    await conn.sendMessage(m.chat, { react: { text: "✍🏻", key: m.key } });

    try {
        // استخدام رابط API مستقر وممتاز لتوليد صورة بخلفية بيضاء ونص أسود فخم مائل للوسط
        const encodedText = encodeURIComponent(text);
        const textImgUrl = `https://dummyimage.com/600x600/ffffff/000000.png&text=${encodedText}`;

        const packName = "ᯓ 𝑩𝒚┆ 𓆩 𝑺𝑻𝑰𝑪𝑲𝑬𝑹𝑺 ✮⃝";
        const authorName = "👻 𝑴𝑬𝑹𝑶 𓆪 ☁︎";

        // جلب بافر الصورة المولدة
        const response = await fetch(textImgUrl);
        if (!response.ok) throw new Error("Failed to fetch text image");
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // تحويل الصورة البيضاء المكتوب عليها لملصق بحقوقك
        const stickerBuffer = await createSticker(buffer, {
            mime: "image/png",
            pack: packName,
            author: authorName
        });

        await conn.sendMessage(m.chat, { react: { text: "🎴", key: m.key } });

        await conn.sendMessage(
            m.chat,
            { 
                sticker: stickerBuffer,
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '',
                        newsletterName: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️',
                        serverMessageId: 0
                    }
                }
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply("❌ *فشل توليد ملصق الكتابة، جرب تاني يسطا!*");
    }
};

handler.help = ["بريت"];
handler.tags = ["sticker"];
handler.command = ["بريت", "اكتب", "write"];
export default handler;
