// ذاكرة مؤقتة لحفظ الفيديوهات في الرام لمنع البطء والتعليق
const videoCache = {
  e1: { url: "https://files.catbox.moe/32lk04.mp4", buffer: null },
  e2: { url: "https://files.catbox.moe/a2m77u.mp4", buffer: null },
  e3: { url: "https://files.catbox.moe/eterfm.mp4", buffer: null },
  e4: { url: "https://files.catbox.moe/uy8nbz.mp4", buffer: null }
};

export default async function before(m, { conn, bot }) {
  // تنظيف النص وتحويله لسمول
  const command = m.text?.trim().toLowerCase();

  // التحقق إذا كان الأمر المرسل هو أحد الأوامر الأربعة
  if (videoCache[command]) {
    const currentVideo = videoCache[command];

    try {
      // إذا لم يتم تحميل الفيديو في الذاكرة من قبل، قم بتحميله باستخدام دالة البوت المدمجة
      if (!currentVideo.buffer) {
        const download = await conn.getFile(currentVideo.url);
        if (download && download.data) {
          currentVideo.buffer = download.data;
        }
      }

      // إرسال الفيديو كـ رسالة مرئية دائرية (PTV) فورا من الذاكرة
      await conn.sendMessage(m.chat, {
        video: currentVideo.buffer || { url: currentVideo.url }, // لو الكاش فشل يبعت بالرابط علطول كحماية
        mimetype: 'video/mp4',
        ptv: true 
      }, { quoted: m });

      return true; 
    } catch (error) {
      console.error(`خطأ في إرسال فيديو الأمر ${command}:`, error);
      
      // حل احتياطي أخير بالرابط المباشر في حال حدوث أي مشكلة
      try {
        await conn.sendMessage(m.chat, {
          video: { url: currentVideo.url },
          mimetype: 'video/mp4',
          ptv: true
        }, { quoted: m });
      } catch (e) {
        console.error("فشل الإرسال الاحتياطي أيضاً:", e);
      }
      
      return true;
    }
  }
  
  return false;
}
