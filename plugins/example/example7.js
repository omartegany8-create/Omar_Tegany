const example = async (m, { conn }) => {
    // ريأكت التحضير
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    try {
        // رابط فيديو مباشر خفيف
        const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; 

        // الإرسال الذكي: بنحدد الأبعاد 1:1 ونجبره يتبعت كـ Note Video
        await conn.sendMessage(m.chat, { 
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            ptv: true, // تفعيل الفيديو الدائري
            height: 360, // إجبار الارتفاع
            width: 360,  // إجبار العرض ليكون مربع متساوي 1:1
            seconds: 10  // تحديد مدة العرض
        }, { quoted: m });

        // ريأكت النجاح
        await conn.sendMessage(m.chat, { react: { text: "🎥", key: m.key } });

    } catch (e) {
        console.error(e);
        
        // خيار احتياطي آمن: لو ميزة الدائرة مرفوضة تماماً من النسخة، يتبعت كفيديو سريع فخم بدون كراش
        try {
            await conn.sendMessage(m.chat, { 
                video: { url: "https://www.w3schools.com/html/mov_bbb.mp4" },
                mimetype: 'video/mp4',
                gifPlayback: true, // يشتغل كـ GIF مروق سريع
                caption: "🎥 *تم التشغيل كفيديو سريع احتياطي!*"
            }, { quoted: m });
        } catch (err) {
            m.reply(`❌ السيرفر رافض الرفع تماماً يسطا: ${e.message}`);
        }
    }
};

example.usage = ["تست7"];
example.category = "example";
example.command = ["تست7"];

export default example;
