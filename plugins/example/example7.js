export default async function before(m, { conn , bot }) {
  // الكلمات المفتاحية المطلوبة لتفعيل الرد
  const triggers = ["بوت", "ed", "سكونا"];

  if (triggers.includes(m.text?.trim())) {
    
    // 💡 ضع رابط الفيديو المباشر الخاص بك هنا بين علامتي الاقتباس
    const videoUrl = "https://www.image2url.com/r2/default/videos/1783357765467-230b3c21-8945-4126-acd7-b1cba3600e30.mp4"; 

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      ptv: true // هذه الخاصية تجعل الفيديو يظهر على شكل فيديو ملاحظات (دائري)
    }, { quoted: m });

    return true; 
  }
  
  return false;
}
