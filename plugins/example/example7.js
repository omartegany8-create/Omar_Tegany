import fetch from "node-fetch"

export default async function before(m, { conn }) {
  // الكلمات المفتاحية المطلوبة لتفعيل الرد
  const triggers = ["بوت", "me", "sukuna"];

  if (triggers.includes(m.text?.trim())) {
    
    // دالة عمل الريأكت السريع
    const react = async (emoji) => {
      try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
    }

    // 1. عمل ريأكت الانتظار طيران
    await react('⏳');
    
    // رابط الفيديو المباشر الخاص بك
    const videoUrl = "https://files.catbox.moe/eterfm.mp4"; 

    try {
      // ⚡ الصياعة هنا: بنجيب الفيديو كـ Buffer عشان يتبعت بسرعة البرق وبدون تقطيع أو تأثير على الجودة
      const res = await fetch(videoUrl);
      const videoBuffer = await res.buffer();

      // 2. إرسال الفيديو الدائري الفخم
      await conn.sendMessage(m.chat, {
        video: videoBuffer,
        mimetype: 'video/mp4',
        ptv: true // الخاصية السحرية للفيديو الدائري
      }, { quoted: m });

      // 3. عمل ريأكت الهيبة لما يوصل بنجاح
      await react('⛩️');
      return true;

    } catch (e) {
      console.error("❌ خطأ في إرسال الفيديو الدائري:", e);
      await react('❌'); // ريأكت لو السيرفر الخارجي وقع
    }
  }
  
  return false;
}
