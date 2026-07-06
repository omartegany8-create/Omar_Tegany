import axios from 'axios';

const handler = async (m, { conn }) => {
    await conn.sendMessage(m.chat, { react: { text: "💀", key: m.key } });

    // رابط فيديو مباشر وشغال
    const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; 

    try {
        // جلب الفيديو كـ Buffer متدفق مباشرة لتخطي حظر الاستضافة والـ Hosts
        const response = await axios({
            method: 'get',
            url: videoUrl,
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const videoBuffer = Buffer.from(response.data, 'binary');

        // إرسال البافار المباشر
        const sentMsg = await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: `👑 ⇦ *مـلـك الـلـعـنـات: ريـومـن سـكـونـا ( SUKUNA )* 😈🔥\n\n\`\`\`───────────────────\`\`\`\n> 🎭 _"تنحوا جانباً.. فأنتم لا تعرفون مكانتكم الحقيقية."_\n\`\`\`───────────────────\`\`\``,
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "🔥", key: sentMsg.key } });

    } catch (e) {
        console.error(e);
        
        // الحل البديل الذكي والمضمون 100% لو الآي بي محظور تماماً من الرفع
        try {
            const fallbackMsg = await conn.sendMessage(m.chat, {
                text: `👑 ⇦ *مـلـك الـلـعـنـات: ريـومـن سـكـونـا ( SUKUNA )* 😈🔥\n\n\`\`\`───────────────────\`\`\`\n> 🎭 _"تنحوا جانباً.. فأنتم لا تعرفون مكانتكم الحقيقية."_\n\`\`\`───────────────────\`\`\`\n\n🔗 *رابط مشاهدة وتحميل الإيديت مباشر:* ${videoUrl}`,
                contextInfo: {
                    externalAdReply: {
                        title: "SUKUNA PREMIUM EDIT 🎥",
                        body: "اضغط هنا للمشاهدة المباشرة السريعة",
                        mediaType: 2,
                        mediaUrl: videoUrl,
                        sourceUrl: videoUrl,
                        thumbnailUrl: "https://telegra.ph/file/p/sukuna.jpg" // تقدر تحط رابط صورة ثابتة لسكونا هنا لو تحب
                    }
                }
            }, { quoted: m });
            
            await conn.sendMessage(m.chat, { react: { text: "🔗", key: fallbackMsg.key } });
        } catch (err) {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`❌ الاستضافة عندك حظراها تماماً يسطا: ${e.message}`);
        }
    }
};

handler.usage = ["تست8"];
handler.category = "example";
handler.command = ["تست8", "سكونا", "sukuna"];

export default handler;
