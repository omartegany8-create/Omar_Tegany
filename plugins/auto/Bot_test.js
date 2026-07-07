export default async function before(m, { conn , bot }) {
  // الكلمات المفتاحية المطلوبة لتفعيل الرد
  const triggers = ["open", "e", "mero"];

  if (triggers.includes(m.text?.trim())) {
    
    // 💡 ضع رابط الفيديو المباشر الخاص بك هنا بين علامتي الاقتباس
    const videoUrl = "https://files.catbox.moe/32lk04.mp4"; 

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      ptv: true // هذه الخاصية تجعل الفيديو يظهر على شكل فيديو ملاحظات (دائري)
    }, { quoted: m });

    return true; 
  }
  
  return false;
}
