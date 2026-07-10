export default async function before(m, { conn, bot }) {
  // الكلمات المفتاحية والردود العشوائية الخاصة بك
  const triggers = {
    "السلام عليكم": ["*وعليكم السلام منور يغالي 🤎*", "*وعليكم السلام ورحمة الله وبركاته ❤️*"],
    "هلا": ["*هلا وغلا*", "*هلا بيك*", "*يا هلا*"],
    "باي": ["*مع السلامة*", "*باي باي*", "*الله معاك*"],
    "تست": ["*𝑻𝑬𝑺𝑻 🕸️*"],
    "مساء الخير": ["*مساء النور*", "*مساء الورد*", "*مساء الفل*", "*مساء الجوري*"]
  };

  const textClean = m.text?.trim();

  // التحقق إذا كانت الرسالة المكتوبة موجودة في القائمة فوق
  if (triggers[textClean]) {
    try {
      const replies = triggers[textClean];
      const ranReply = replies[Math.floor(Math.random() * replies.length)];

      // 1. 🕷️ إذا كانت الكلمة هي "تست"، قم بعمل ريأكت تلقائي
      if (textClean === "تست") {
        try { await conn.sendMessage(m.chat, { react: { text: '🕷️', key: m.key } }); } catch (e) {}
      }

      // 2. 👤 إعدادات كارت الجروب وصورة ياغامي لايت (تم تصليح التوجيه والصورة)
      const meroContext = {
        contextInfo: {
          isForwarded: true, // تفعيل خاصية رسالة محولة مظهرياً للفخامة
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363416870755391@newsletter", 
            serverMessageId: 100,
            newsletterName: "𓆩 𝒀𝑨𝑮𝑨𝑴𝑰 𝑳𝑰𝑮𝑯𝑻 𓆪 🕷️" // اسم الحقوق اللي بيظهر فوق الرسالة
          },
          externalAdReply: {
            title: "𓆩 𝑴𝑬𝑹𝑶 𝑩𝑶𝑻 𓆪",
            body: "اضغط هنا للانضمام لمجتمعنا ⚡",
            mediaType: 1,
            thumbnailUrl: "https://i.pinimg.com/originals/bb/77/0f/bb770fad66a634a6b3bf93e9c00bf4e5.jpg", // رابط صورة ياغامي لايت الثابتة
            sourceUrl: "https://chat.whatsapp.com/ItDxM47hQciHG4QdxV3aA0?s=cl&p=a&ilr=4&amv=3", // رابط الجروب بتاعك (شغال 100% دلوقتي)
            renderLargerThumbnail: true // خليتها true عشان الكارت يظهر كبير وبشكل فخم ومستطيل بالصورة كاملة
          }
        }
      };

      // إرسال الرد العشوائي مضبوط ومصلح بالكامل
      await conn.sendMessage(m.chat, { text: ranReply, ...meroContext }, { quoted: m });
      
      return true; // إيقاف المعالجة بنجاح
    } catch (error) {
      console.error("خطأ في ردود الـ before السريعة:", error);
    }
  }
  
  return false;
}
