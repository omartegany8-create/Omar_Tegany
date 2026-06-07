let handler = async (m, { conn, bot }) => {

    // 🛠️ دالة مخصصة لإنشاء كارت الحقوق والتوجيه التفاعلي (Context Info)
    const context = (jid, img) => ({
        mentionedJid: [jid], // عمل منشن للشخص اللي كتب الأمر
        isForwarded: true, // إظهار الرسالة كأنها محولة لإعطائها مظهر احترافي
        forwardingScore: 1, 
        
        // 🔗 ربط الكارت بقناة الواتساب بتاعتك بشكل رسمي
        forwardedNewsletterMessageInfo: {
            newsletterJid: '0029Vb8Q2Q56WaKx5Qk8QM2y@newsletter', // آيدي قناتك المبرمج
            newsletterName: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 ☁︎', // اسم قناتك اللي هيظهر فوق الكارت
            serverMessageId: 0
        },
        
        // 🖼️ إعدادات الإعلان الخارجي (الكارت التفاعلي اللي بيظهر تحت الرسالة)
        externalAdReply: {
            title: "𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️ | WhatsApp Bot", // العنوان الرئيسي للكارت
            body: "Advanced WhatsApp bot, customized and maintained by Omar Tegany", // الوصف المصغر
            thumbnailUrl: img, // الصورة العشوائية اللي البوت هيختارها
            sourceUrl: 'https://whatsapp.com/channel/0029Vb8Q2Q56WaKx5Qk8QM2y', // رابط قناتك لو حد داس على الكارت يروح ليها
            mediaType: 1,
            renderLargerThumbnail: true // جعل الصورة تظهر بحجم كبير وفخم
        }
    });

    // 📸 سحب مصفوفة الصور العشوائية من إعدادات البوت الأساسية واختيار واحدة
    const { images } = bot.config.info;
    const img = images.random();

    // ✉️ إرسال رسالة السورس مع تطبيق الكارت التفاعلي المخصص فوقها
    await conn.sendMessage(m.chat, { 
      text: `
🤖 *𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 - 𝐒𝐨𝐮𝐫𝐜𝐞 𝐂𝐨𝐝𝐞* 🕷️

🌐 *GitHub Repo:*
_*https://github.com/omar-tegany9/Omar_Tegany*_

📢 *Official Channel:*
_*https://whatsapp.com/channel/0029Vb8Q2Q56WaKx5Qk8QM2y*_

> *لا تنسى وضع نجمة للمستودع لدعم المطور 🌟*
`,
      contextInfo: context(m.sender, img) // تطبيق الكارت التفاعلي هنا
    }, { quoted: m }); // الرد المباشر على رسالة المستخدم (تم استبدال reply_status المتغيرة بـ m الأضمن)
}

// ⚙️ إعدادات تشغيل الأمر والكلمات المفتاحية
handler.usage = ["سكريبت"]; // طريقة الاستخدام
handler.category = "group"; // قسم الأمر (جروب)
handler.command = ["سكريبت", "سورس", "sc"]; // الكلمات التي يستجيب لها البوت

export default handler;
