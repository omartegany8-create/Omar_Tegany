import fetch from 'node-fetch';

// ذاكرة مؤقتة لحفظ الفيديو في الرام لمنع التحميل المتكرر
let videoBuffer = null;
const videoUrl = "https://files.catbox.moe/32lk04.mp4";

export default async function before(m, { conn, bot }) {
  const triggers = ["open", "not", "mero"];

  if (triggers.includes(m.text?.trim().toLowerCase())) {
    
    try {
      // 1. إذا لم يكن الفيديو محملاً في الذاكرة بعد، قم بتحميله مرة واحدة فقط
      if (!videoBuffer) {
        const response = await fetch(videoUrl);
        videoBuffer = await response.buffer();
      }

      // 2. إرسال الفيديو من الذاكرة (Buffer) مباشرة، سريع جداً ولا يعتمد على سرعة سيرفر التحميل
      await conn.sendMessage(m.chat, {
        video: videoBuffer,
        mimetype: 'video/mp4',
        ptv: true 
      }, { quoted: m });

      return true; 
    } catch (error) {
      console.error("خطأ في إرسال الفيديو السريع:", error);
      
      // حل احتياطي سريع في حال فشل الـ Buffer (إرسال بالرابط المباشر كخيار بديل)
      await conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        ptv: true
      }, { quoted: m });
      
      return true;
    }
  }
  
  return false;
}
