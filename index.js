import { Client } from 'meowsab';
import { group, access } from "./system/control.js";
import UltraDB from "./system/UltraDB.js";
import sub from './sub.js';

/* =========== Client ========== */
const client = new Client({
  phoneNumber: '201031044377', // رقم البوت بدون مسافات
  prefix: [".", "/", "!"],
  fromMe: true, // 🌟 تم التعديل لـ true عشان البوت يرد على رسايلك ويسمع كلامك أنت كمان
  owners: [
  
    { name: "Mero", lid: "201031044377@lid", jid: "201031044377@s.whatsapp.net" },
    
  ],
  settings: { noWelcome: false },
  commandsPath: './plugins'
});

client.onGroupEvent(group);
client.onCommandAccess(access);

/* =========== Database ========== */
if (!global.db) {
    global.db = new UltraDB();
}

/* =========== Config ========== */
const { config } = client;
config.info = { 
  nameBot: "𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️", 
  nameChannel: "𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️", 
  idChannel: "0029Vb8Q2Q56WaKx5Qk8QM2y@newsletter", // 🔗 هنا حطينا الـ ID بتاع قناتك اللي طلعناه من الرابط
  urls: {
    repo: "https://github.com/omar-tegany9/Omar_Tegany", // 🔗 تم تحديث مستودع الجيت هاب بتاعك أنت الشخصي
    api: "",
    channel: "https://whatsapp.com/channel/0029Vb8Q2Q56WaKx5Qk8QM2y" // 🔗 هنا حطينا رابط قناتك الرسمي اللي بعتهولي
  },
  copyright: { 
    pack: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️', 
    author: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️'
  },
  images: [
    "https://i.pinimg.com/originals/11/26/97/11269786cdb625c60213212aa66273a9.png",
    "https://i.pinimg.com/originals/e2/21/20/e221203f319df949ee65585a657501a2.jpg",
    "https://i.pinimg.com/originals/bb/77/0f/bb770fad66a634a6b3bf93e9c00bf4e5.jpg"
  ]
};

/* =========== Start ========== */
client.start();

setTimeout(async () => {
if (client.commandSystem) { 
sub(client)
  }
}, 2000);


/* =========== Catch Errors ========== */
process.on('uncaughtException', (e) => {
    if (e.message.includes('rate-overlimit')) {}
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
});
