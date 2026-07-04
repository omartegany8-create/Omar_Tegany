const example = async (m, { conn }) => {
    // ريأكت التحضير
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    try {
        // رابط فيديو مباشر وشغال 100%
        const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; 

        // إرسال كرسالة فيديو دائرية (Note Video)
        await conn.sendMessage(m.chat, { 
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            ptv: true // لتفعيل خاصية الفيديو الدائري في الشات
        }, { quoted: m });

        // ريأكت النجاح
        await conn.sendMessage(m.chat, { react: { text: "🎥", key: m.key } });

    } catch (e) {
        console.error(e);
        m.reply(`❌ حصلت مشكلة أثناء تشغيل التست: ${e.message}`);
    }
};

example.usage = ["تست7"];
example.category = "example";
example.command = ["تست7"];

export default example;
