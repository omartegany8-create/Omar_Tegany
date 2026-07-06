import fetch from "node-fetch"

export default async function before(m, { conn }) {
  // الكلمات المفتاحية المطلوبة لتفعيل الرد
  const triggers = ["بوت", "me", "e"];

  if (triggers.includes(m.text?.trim())) {
    
    // دالة عمل الريأكت السريع
    const react = async (emoji) => {
      try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
    }

    // 1. عمل ريأكت الانتظار طيران
    await react('⏳');
    
    // رابط الفيديو المباشر الخاص بك
    const videoUrl = "https://files.catbox.moe/mx4x02.mp4"; 

    try {
      // جلب الفيديو
      const res = await fetch(videoUrl);
      const videoBuffer = await res.buffer();

      // 2. إرسال الفيديو الدائري مع تمرير خصائص أبعاد البث لتخطي حظر السيرفرات
      await conn.sendMessage(m.chat, {
        video: videoBuffer,
        mimetype: 'video/mp4',
        ptv: true, // الخاصية السحرية للفيديو الدائري
        seconds: 15, // بيعرف السيرفر إن المدة قصيرة عشان يوافق فوراً
        gifPlayback: false
      }, { 
        quoted: m,
        ephemeralExpiration: 86400 // تسريع المعالجة في الشات
      });

      // 3. عمل ريأكت الهيبة لما يوصل بنجاح
      await react('⛩️');
      return true;

    } catch (e) {
      console.error("❌ خطأ في إرسال الفيديو الدائري:", e);
      // حل احتياطي سريع لو سيرفر الرفع علق نهائياً: إرساله كرابط ميديا مباشر
      try {
        await conn.sendMessage(m.chat, { video: { url: videoUrl }, mimetype: 'video/mp4', ptv: true }, { quoted: m });
        await react('⛩️');
        return true;
      } catch (err) {
        await react('❌');
      }
    }
  }
  
  return false;
}
