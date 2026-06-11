const MAX_ROUNDS = 10;

// قائمة الشخصيات الموسعة والمحدثة لضمان التنوع المطلق في الاختيارات الخاطئة
const NAMES = [
  "ايرين", "نيزوكو", "سوكونا", "موزان", "كيلوا", "غون", "ايتاتشي", "ساسكي", "دابي", "اوبيتو",
  "نوبارا", "ليفاي", "يوتا", "فريدا", "شيده", "ياماتو", "نامي", "ايمو", "انيا", "جينبي",
  "بوروتو", "شانكس", "لاو", "لوفي", "زورو", "اكازا", "ميكاسا", "رين", "دوما", "كانيكي",
  "غوجو", "ساي", "نيجي", "انمي", "ساكورا", "اوريتشمارو", "ماهيتو", "جيرايا", "روبين",
  "سانجي", "ميهوك", "كايدو", "مايكي", "كورابيكا", "شيغاراكي", "تينغن", "تانجيرو",
  "ميدوريا", "كونان", "الكيورا", "شوتو", "غاتارو", "بارو", "غارا", "باكوغو", "ماكيما",
  "توجا", "باين", "كوراما", "توجي", "نانامي", "ميجومي", "جوجو", "أوي هانامي", "جيتو",
  "روك لي", "ميناتو", "كوشينا", "مادارا", "هاشيراما", "توبيراما", "تسونادي", "اوراهارا",
  "بياكويا", "كينباتشي", "ياماموتو", "يوروتشي", "رينجي", "إسبادا", "هيسوكا", "كورولو",
  "ليوريو", "نيترو", "ميرويم", "بيتو", "أرمين", "إروين", "هانجي", "راينر", "بيرتولت",
  "غابي", "فالكو", "زيك", "بورتغاس دي ايس", "سابو", "تيتش", "أكاينو", "كيزارو", "أوكيجي"
];

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

// دالة توزيع الجوائز المالية ونقاط الشرف بالتفصيل
const getPrize = (rank) => {
  if (rank === 0) return { xp: 500, cookies: 10, emoji: "🏆" };
  if (rank === 1) return { xp: 300, cookies: 5, emoji: "🥈" };
  if (rank === 2) return { xp: 150, cookies: 3, emoji: "🥉" };
  return { xp: 50, cookies: 1, emoji: "⭐" };
};

async function runGame(m, conn, round) {
  const chatId = m.chat;
  const g = global.gameEye[chatId];
  
  // شاشة إنهاء اللعبة وحساب كشف الحساب
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
        
        prizes.push(`${prize.emoji} *المركز ${i + 1}:* @${id.split('@')[0]}\n   🎯 لقطات صح: *${score}* |  🎁 الجوائز: *+${prize.xp} XP* & *🍪 +${prize.cookies} كوكيز*\n────────────────`);
      }
      
      await conn.sendMessage(chatId, {
        text: `🏁 *انتهت الـ ${MAX_ROUNDS} جولات من تحدي لعبة العين!* 👁️✨\n\nثواني وبحسبلكم النتائج.. 👇🏻\n\n────────────────\n${prizes.join('\n')}\n🏆 *عاش يا وحوش الملاحظة والتركيز! نورتم اللعبة* 😉🔥`,
        mentions: sorted.map(s => s[0])
      });
    } else if (g) {
      await conn.sendMessage(chatId, { 
        text: "💤 *انتهت اللعبة ومحدش جمع أي نقاط! الجروب نايم كالعادة..* 🦦" 
      });
    }
    delete global.gameEye[chatId];
    return;
  }

  g.round = round;

  try {
    const response = await fetch("https://raw.githubusercontent.com/fjfilhfjjg-boop/Pomni-AI/refs/heads/main/%D8%B9%D9%8A%D9%86.md");
    const data = await response.json();
    const char = data[Math.floor(Math.random() * data.length)];
    
    const wrong = shuffle([...NAMES]).filter(n => n !== char.name).slice(0, 3);
    const opts = shuffle([char.name, ...wrong]);
    
    const caption = `👁️ *لعبة تخمين العين الحماسية* 👁️\n\nجولة رقم: [ *${round} من ${MAX_ROUNDS}* ] 🎲\n────────────────\n\n🤔 *ركز في التفاصيل وقولي العين دي بتاعة مين؟*\n\n1️⃣ ⇦  *${opts[0]}*\n2️⃣ ⇦  *${opts[1]}*\n3️⃣ ⇦  *${opts[2]}*\n4️⃣ ⇦  *${opts[3]}*\n\n────────────────\n> 💡 _*عشان تحسب النقطة: رد على الصورة دي واكتب اسم الشخصية الـصح!*_ \n⏱️ _معاك 30 ثانية قبل ما الجولة تقفل!_`;
    
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
          
          await conn.sendMessage(chatId, { 
            text: `⏰ *انتهى الوقت ومحدش لقطها!* \nالإجابة الصح كانت: ✨ *${ans}* ✨\n\n⏳ _استعدوا.. الجولة اللي بعدها نازلة حالا!_` 
          });
          
          await new Promise(resolve => setTimeout(resolve, 2500));
          runGame(m, conn, round + 1);
        }
      }, 30000)
    };
  } catch (e) {
    console.error(e);
    await conn.sendMessage(chatId, { text: "❌ حصل خطأ خفيف في جلب العين من السيرفر، بندخل على الجولة اللي بعدها علطول..." });
    runGame(m, conn, round + 1);
  }
}

const handler = async (m, { conn, text, command }) => {
  const chatId = m.chat;
  if (!global.gameEye) global.gameEye = {};
  
  const args = (text || '').trim().toLowerCase().split(' ');
  const cmd = args[0];

  // ميزة الحذف الفوري للعبة
  if (cmd === 'حذف' || cmd === 'انهاء' || cmd === 'delete') {
    if (!global.gameEye[chatId]) return m.reply("❌ مفيش لعبة عين شغالة حالياً في الجروب عشان أحذفها!");
    if (global.gameEye[chatId].current?.timer) clearTimeout(global.gameEye[chatId].current.timer);
    delete global.gameEye[chatId];
    return m.reply("🗑️ *أبشر! تم إلغاء وحذف لعبة العين بنجاح.*");
  }

  if (global.gameEye[chatId]) {
    return m.reply(`⚠️ يسطا في جولة عين قائمة وشغالة بالفعل حالياً!\nاكتب 👈🏻 *.${command} حذف* لو عايز تقفلها وتبدأ من جديد وبأرقام جديدة.`);
  }

  // ريأكت البدء
  await conn.sendMessage(chatId, { react: { text: "👁️", key: m.key } });

  global.gameEye[chatId] = { round: 0, scores: {}, current: null };
  
  await m.reply(`👁️ *مستعدين؟ تحدي العين بدأ!* 🧩\nاللعبة مكونة من *10 جولات*.. ركز في تفاصيل الرسمة عشان تلقطها صح وتكتسح السكور!\n\nالجولة الأولى ... 🚀🔥`);
  
  setTimeout(() => runGame(m, conn, 1), 2000);
};

handler.before = async (m, { conn }) => {
  const g = global.gameEye?.[m.chat];
  if (!g?.current || !m.text) return false;
  
  const cur = g.current;
  const answer = m.text.toLowerCase().trim();
  
  // التأكد التام إن العضو عامل ريبلاي على صورة السؤال بالظبط
  if (m.quoted?.id !== cur.id) return false;
  
  // حالة الإجابة الصحيحة
  if (answer === cur.answer) {
    clearTimeout(cur.timer);
    g.current = null;
    
    g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;
    
    await conn.sendMessage(m.chat, { react: { text: "🎉", key: m.key } });
    
    let replyMsg = `🎉 *جبتها صح يا وحش! لقطتها طلقة* ⚡\n\nأحسنت يا @${m.sender.split('@')[0]} الإجابة فعلاً هي (*${cur.answer}*)\n⚔️ سكورك الحالي بقا: [ *${g.scores[m.sender]} نقطة* ] 🎯\n\n`;
    
    const nextRound = g.round + 1;
    if (nextRound <= MAX_ROUNDS) {
      replyMsg += `⏳ *استعدوا.. الجولة القادمة رقم (${nextRound}) نازلة حالا...*`;
      await conn.sendMessage(m.chat, { text: replyMsg, mentions: [m.sender] }, { quoted: m });
      await new Promise(resolve => setTimeout(resolve, 3000));
      runGame(m, conn, nextRound);
    } else {
      replyMsg += `🏁 *دي كانت الجولة الأخيرة في التحدي! ثواني وبحسب لكم النتائج ...*`;
      await conn.sendMessage(m.chat, { text: replyMsg, mentions: [m.sender] }, { quoted: m });
      await new Promise(resolve => setTimeout(resolve, 2000));
      runGame(m, conn, nextRound);
    }
    return true;
  } 
  
  // حالة الإجابة الخاطئة (لو الاسم المكتوب موجود في الاختيارات الـ 4 المتاحة)
  else if (cur.opts.includes(answer)) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    await m.reply("❌ *لأ غلط!* ركز في النظرة والـرسمة كويس وحاول تاني قبل ما الوقت يطير! 🤫🔥");
    return true;
  }
  return false;
};

handler.command = ['عين', 'eye'];
handler.category = "games";
export default handler;
