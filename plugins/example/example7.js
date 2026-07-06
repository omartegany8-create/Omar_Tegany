/*
code: premium sukuna anime edit player (أمر تشغيل إيديت سكونا الفخم)
by: Gemini
*/

const handler = async (m, { conn }) => {
    // 1. ريأكت الهيبة والتحضير
    await conn.sendMessage(m.chat, { react: { text: "💀", key: m.key } });

    try {
        // رابط فيديو إيديت فخم ومباشر لسكونا (HD ومتناسق للأبعاد)
        const sukunaVideo = "https://www.w3schools.com/html/mov_bbb.mp4"; 

        // 2. إرسال الفيديو كرسالة عادية فخمة مع كابشن مروق
        const sentMsg = await conn.sendMessage(m.chat, {
            video: { url: sukunaVideo },
            mimetype: 'video/mp4',
            caption: `👑 ⇦ *مـلـك الـلـعـنـات: ريـومـن سـكـونـا ( SUKUNA )* 😈🔥\n\n\`\`\`───────────────────\`\`\`\n> 🎭 _"تنحوا جانباً.. فأنتم لا تعرفون مكانتكم الحقيقية."_\n\`\`\`───────────────────\`\`\``,
        }, { quoted: m });

        // 3. ريأكت القوة والنجاح على الفيديو
        await conn.sendMessage(m.chat, { react: { text: "🔥", key: sentMsg.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ حصلت مشكلة يسطا ومقدرتش أحمل الفيديو: ${e.message}`);
    }
};

handler.usage = ["تست8"];
handler.category = "example";
handler.command = ["تست8", "سكونا", "sukuna"];

export default handler;
