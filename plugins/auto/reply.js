export default async function before(m, { conn , bot }) {
  const triggers = {
    "السلام عليكم": ["*وعليكم السلام منور يغالي 🤎*", "*وعليكم السلام ورحمة الله وبركاته ❤️*"],
    "هلا": ["*هلا وغلا*", "*هلا بيك*", "*يا هلا*"],
    "باي": ["*مع السلامة*", "*باي باي*", "*الله معاك*"],
    "تست": ["*𝑻𝑬𝑺𝑻 🕸️*"],
    "مساء الخير": ["*مساء النور*", "*مساء الورد*", "*مساء الفل*", "*مساء الجوري*"]
  };

  const replies = triggers[m.text];
  if (replies) {
    const ranReply = replies[Math.floor(Math.random() * replies.length)];
    m.reply(ranReply);
  }
  
  return false;
}
