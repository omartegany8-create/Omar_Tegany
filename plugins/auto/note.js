import fetch from 'node-fetch';

// ذاكرة مؤقتة لحفظ الفيديوهات في الرام لمنع البطء والتحميل المتكرر
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
      // إذا لم يتم تحميل الفيديو في الذاكرة من قبل، قم بتحميله الآن (لأول مرة فقط)
      if (!currentVideo.buffer) {
        const response = await fetch(currentVideo.url);
        currentVideo.buffer = await response.buffer();
      }

      // إرسال الفيديو كـ رسالة مرئية دائرية (PTV) فورا من الذاكرة
      await conn.sendMessage(m.chat, {
        video: currentVideo.buffer,
        mimetype: 'video/mp4',
        ptv: true 
      }, { quoted: m });

      return true; 
    } catch (error) {
      console.error(`خطأ في إرسال فيديو الأمر ${command}:`, error);
      
      // حل احتياطي سريع بالرابط المباشر في حال حدوث أي مشكلة في السيرفر
      await conn.sendMessage(m.chat, {
        video: { url: currentVideo.url },
        mimetype: 'video/mp4',
        ptv: true
      }, { quoted: m });
      
      return true;
    }
  }
  
  return false;
}
