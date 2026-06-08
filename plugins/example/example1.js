/* by: 𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️
*/

const example = async (m, { conn }) => {

conn.msgUrl(m.chat,
  '*🔥 Special Offer*',
  {
    img: 'https://example.com/promo.jpg',
    title: '50% OFF',
    body: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️',
    big: true,
    mentions: ['201158601817@s.whatsapp.net'],
    newsletter: {
      name: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️',
      jid: '120363225356834044@newsletter'
    }
  },
  m
)

};

example.usage = ["تست1"]


/* ↓ قسم الأمر ↓ */
example.category = "example"


/* ↓ استخدم الأوامر ↓ */
example.command = ["تست1"] 


/* ↓ بتعمل ايقاف ل الأمر ↓ */
example.disabled = false // لو عملتها true بيشتغل ب بدايه لو خليتها false بيشتغل بدون بدايه 

/* ↓ استخدام الأمر بعد ثانيه من الاستخدام لمنع الاسبام ↓ */
example.cooldown = 1000; // تقدر تزود الثواني 


/* ↓ استخدام الأمر ب بدايه أو لا ↓ */
example.usePrefix = false; // لو عملتها true الأمر هيبقي من غير بدايه 

export default example;
