/*
code: text to white background sticker (أمر بريت المضمون)
by: 𝐓𝐨جي & Gemini
*/
import axios from 'axios';

const handler = async (m, { conn, text, command }) => {
    if (!text) return m.reply(`📝 *الاستخدام الصحيح للأمر:*\n\n.${command} [النص اللي عايزه]\n\n*مثال:*\n.${command} Omar`);

    await conn.sendMessage(m.chat, { react: { text: "✍🏻", key: m.key } });

    try {
        const packName = "ᯓ 𝑩𝒚┆ 𓆩 𝑺𝑻𝑰𝑪𝑲𝑬𝑹𝑺 ✮⃝";
        const authorName = "👻 𝑴𝑬𝑹𝑶 𓆪 ☁︎";
        
        // استخدام رابط لتوليد الصورة بـ API سريع ومستقر ومفتوح
        const textImgUrl = `https://api.screenshotlayer.com/api/capture?access_key=demo&url=https://dummyimage.com/512x512/ffffff/000000.png?text=${encodeURIComponent(text)}&viewport=512x512`;
        
        // جلب البافر باستخدام axios وهو آمن ومستقر جداً في التعامل مع الـ Streams
        const response = await axios.get(`https://dummyimage.com/512x512/ffffff/000000.png?text=${encodeURIComponent(text)}`, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        // إرسال الصورة كملصق فوراً بالحقوق
        await conn.sendMessage(m.chat, { 
            sticker: buffer,
            packname: packName,
            author: authorName,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '',
                    newsletterName: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️',
                    serverMessageId: 0
                }
            }
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "🎴", key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply("❌ *فشل توليد ملصق الكتابة، جرب تاني يسطا أو اكتب الكلمة بالانجليزي!*");
    }
};

handler.help = ["بريت"];
handler.tags = ["sticker"];
handler.command = ["بريت", "اكتب", "write"];
export default handler;
