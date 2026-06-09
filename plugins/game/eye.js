/*
code: game eye anime
by: 𝐓𝐨𝐣𝐢 & Gemini
*/

const MAX_ROUNDS = 10;
const LINE_SEPARATOR = "❉═━═━═━ ◦ • ⊰🍂⊱ • ◦ ━═━═━═❉";

const NAMES = [
  "ايرين", "نيزوكو", "سوكونا", "موازن", "كيلوا", "غون", "ايتاتشي", "ساسكي", "دابي", "اوبيتو",
  "نوبارا", "ليفاي", "يوتا", "فريدا", "شيده", "ياماتو", "نامي", "ايمو", "انيا", "جينبي",
  "بوروتو", "شانكس", "لاو", "لوفي", "زورو", "اكازا", "ميكاسا", "رين", "دوما", "كانيكي",
  "غوجو", "ساي", "نيجي", "انمي", "ساكورا", "اوريتشمارو", "ماهيتو", "جيرايا", "روبين",
  "سانجي", "ميهوك", "كايدو", "مايكي", "كورابيكا", "شيغاراكي", "تينغن", "تانجيرو",
  "ميدوريا", "كونان", "الكيورا", "شوتو", "غاتارو", "بارو", "غارا", "باكوغو", "ماكيما",
  "توجا", "باين", "كوراما", "توجي", "نانامي", "ميجومي", "جوجو", "أوي هانامي", "جيتو"
];

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const getPrize = (rank) => {
  if (rank === 0) return { xp: 500, cookies: 10, emoji: "🎉" };
  if (rank === 1) return { xp: 300, cookies: 5, emoji: "🎖" };
  return { xp: 100, cookies: 2, emoji: "⭐" };
};

async function runGame(m, conn, round) {
  const chatId = m.chat;
  const g = global.gameEye[chatId];
  
  if (!g || round > MAX_ROUNDS) {
    if (g && Object.keys(g.scores).length > 0) {
      const sorted = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
      const prizes = [];
      
      for (let i = 0; i < sorted.length; i++) {
        const [id, score] = sorted[i];
        const prize = getPrize(i);
        if (global.db?.users[id]) {
          global.db.users[id].xp = (global.db.users[id].xp || 0) + prize.xp;
          global.db.users[id].cookies = (global.db.users[id].cookies || 0) + prize.cookies;
        }
        prizes.push(`${prize.emoji} @${id.split('@')[0]} - ${score} نقطة (+${prize.xp}xp)`);
      }
      
      await conn.sendMessage(chatId, {
        text: `🏆 *انتهت لعبة العين بالكامل!*\n${LINE_SEPARATOR}\n\n*ترتيب الفائزين:*\n${prizes.join('\n')}`,
        mentions: sorted.map(s => s[0])
      });
    } else if (g) {
      await conn.sendMessage(chatId, { text: "🏁 *انتهت اللعبة ولم يجمع أحد أي نقاط!*" });
    }
    delete global.gameEye[chatId];
    return;
  }

  g.round = round;

  try {
    const data = await fetch("https://raw.githubusercontent.com/fjfilhfjjg-boop/Pomni-AI/refs/heads/main/%D8%B9%D9%8A%D9%86.md").then(r => r.json());
    const char = data[Math.floor(Math.random() * data.length)];
    
    const wrong = shuffle([...NAMES]).filter(n => n !== char.name).slice(0, 3);
    const opts = shuffle([char.name, ...wrong]);
    
    const caption = `👁️ *خـمـن لـمـن هـذه الـعـيـن [ الجولة: ${round} / ${MAX_ROUNDS} ]* 👁️\n${LINE_SEPARATOR}\n\n1️⃣ ⌯︙ ${opts[0]}\n2️⃣ ⌯︙ ${opts[1]}\n3️⃣ ⌯︙ ${opts[2]}\n4️⃣ ⌯︙ ${opts[3]}\n\n${LINE_SEPARATOR}\n> _رد على الرسالة باسم الشخصية الصحيح ككتابة! ⏱️ 30 ثانية_`;
    
    const msg = await conn.sendMessage(chatId, {
      image: { url: char.img },
      caption
    });
    
    g.current = {
      answer: char.name.trim().toLowerCase(),
      opts: opts.map(o => o.toLowerCase()),
      img: char.img,
      id: msg.key.id,
      timer: setTimeout(async () => {
        if (global.gameEye[chatId]?.current) {
          const ans = global.gameEye[chatId].current.answer;
          global.gameEye[chatId].current = null;
          
          await conn.sendMessage(chatId, { text: `⏰ *انتهى الوقت!* الإجابة الصحيحة هي: *${ans}*` });
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          runGame(m, conn, round + 1);
        }
      }, 30000)
    };
  } catch (e) {
    console.error(e);
    await conn.sendMessage(chatId, { text: "❌ حدث خطأ أثناء جلب بيانات العين، جاري تخطي الجولة..." });
    runGame(m, conn, round + 1);
  }
}

const handler = async (m, { conn, text, command }) => {
  const chatId = m.chat;
  if (!global.gameEye) global.gameEye = {};
  
  const args = (text || '').trim().toLowerCase().split(' ');
  const cmd = args[0];

  // ميزة الحذف لمنع التكرار والبدء من جديد
  if (cmd === 'حذف' || cmd === 'delete') {
    if (!global.gameEye[chatId]) return m.reply("❌ لا توجد لعبة عين نشطة لإلغائها حالياً!");
    if (global.gameEye[chatId].current?.timer) clearTimeout(global.gameEye[chatId].current.timer);
    delete global.gameEye[chatId];
    return m.reply("🗑️ تم إلغاء وحذف لعبة العين بنجاح! يمكنك البدء من جديد الآن.");
  }

  if (global.gameEye[chatId]) return m.reply(`❌ هناك لعبة عين قائمة بالفعل في هذا الجروب!\nاكتب *.${command} حذف* لإلغائها وبدء جولة جديدة.`);

  // ريأكت أيقونة اللعبة عند البدء
  await conn.sendMessage(chatId, { react: { text: "👁️", key: m.key } });

  global.gameEye[chatId] = { round: 0, scores: {}, current: null };
  runGame(m, conn, 1);
};

handler.before = async (m, { conn }) => {
  const g = global.gameEye?.[m.chat];
  if (!g?.current || !m.text) return;
  
  const cur = g.current;
  const answer = m.text.toLowerCase().trim();
  
  if (m.quoted?.id !== cur.id) return;
  
  if (answer === cur.answer) {
    clearTimeout(cur.timer);
    g.current = null;
    
    g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;
    
    // ريأكت الفوز 🎉 على رسالة العضو الصح بالملّي
    await conn.sendMessage(m.chat, { react: { text: "🎉", key: m.key } });
    
    await conn.sendMessage(m.chat, {
      text: `🎉 *إجابة صحيحة!* \n\nأحسنت يا @${m.sender.split('@')[0]} جبت اسم الشخصية صح 🏆\n⚔️ نقاطك الحالية: *${g.scores[m.sender]} نقطة*\n\n⏳ _استعدوا للجولة القادمة..._`,
      mentions: [m.sender]
    }, { quoted: m });
    
    const nextRound = g.round + 1;
    await new Promise(resolve => setTimeout(resolve, 3000));
    runGame(m, conn, nextRound);
    return true;
  } else if (cur.opts.includes(answer)) {
    await m.reply("❌ *إجابة خاطئة!* حاول مرة أخرى وركز في تفاصيل العين.");
    return true;
  }
  return false;
};

handler.command = ['عين', 'eye'];
handler.category = "games";
export default handler;
