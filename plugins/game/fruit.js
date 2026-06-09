/*
code: game fruits emoji
by: omar
*/

const MAX_ROUNDS = 10;

const fruitsData = [
    { emoji: "🍎", names: ["تفاح", "تفاح احمر", "تفاحه", "تفاحة"] },
    { emoji: "🍏", names: ["تفاح اخضر", "تفاحه خضرا", "تفاحة خضراء"] },
    { emoji: "🍌", names: ["موز", "موزه", "موزة"] },
    { emoji: "🍉", names: ["بطيخ", "حبحب", "دلاع"] },
    { emoji: "🍇", names: ["عنب"] },
    { emoji: "🍓", names: ["فراولة", "فراوله", "فريز"] },
    { emoji: "🍒", names: ["كرز", "كريز"] },
    { emoji: "🥭", names: ["مانجو", "مانجا", "منجا"] },
    { emoji: "🍍", names: ["أناناس", "اناناس"] },
    { emoji: "🍊", names: ["برتقال", "برتقاله", "يوسفي", "سفندي"] },
    { emoji: "🍋", names: ["ليمون", "لمون"] },
    { emoji: "🍑", names: ["خوخ"] },
    { emoji: "🍐", names: ["كمثرى", "كمتري", "جوافة", "جوافه"] },
    { emoji: "🍈", names: ["شمام", "كانتالوب"] },
    { emoji: "🥝", names: ["كيوي"] },
    { emoji: "🥥", names: ["جوز الهند", "جوز هند"] },
    { emoji: "🥑", names: ["أفوكادو", "افوكادو"] },
    { emoji: "🌶️", names: ["فلفل", "فلفل حار", "شطة", "شطه"] },
    { emoji: "🌽", names: ["ذرة", "ذره", "ذرة صفراء"] },
    { emoji: "🥕", names: ["جزر", "جزرة"] },
    { emoji: "🍅", names: ["طماطم", "قوطة", "بندورة"] }
];

async function runFruitGame(m, conn, round) {
    const chatId = m.chat;
    const g = global.gameFruit[chatId];
    
    const item = fruitsData[Math.floor(Math.random() * fruitsData.length)];
    g.current = {
        answer: item.names,
        round: round,
        timer: setTimeout(async () => {
            if (global.gameFruit?.[chatId]?.current?.round === round) {
                g.current = null;
                await conn.sendMessage(chatId, { text: `⏰ *انتهى الوقت!* محدش عرف اسم الفاكهة.\n\n⏳ _استعدوا للجولة القادمة..._` });
                
                if (round < MAX_ROUNDS) {
                    setTimeout(() => runFruitGame(m, conn, round + 1), 2000);
                } else {
                    endFruitGame(m, conn);
                }
            }
        }, 30000)
    };

    const msg = await conn.sendMessage(chatId, {
        text: `✨ *لعبة تخمين الفاكهة 🍓 (جولة: ${round} / ${MAX_ROUNDS})*\n\nأسرع واحد يكتب اسم الفاكهة أو الخضار ده كسبان:\n👇👇\n👑  *${item.emoji}* 👑\n\n> _أمامك 30 ثانية للإجابة السليمة!_`
    });
    g.current.id = msg.key.id;
}

async function endFruitGame(m, conn) {
    const chatId = m.chat;
    const g = global.gameFruit[chatId];
    
    const entries = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
        await conn.sendMessage(chatId, { text: "🏁 *انتهت اللعبة!* ولم يشارك أحد في هذه الجولة." });
        delete global.gameFruit[chatId];
        return;
    }

    const sorted = entries.map(([id, score], i) => `${i + 1}. @${id.split('@')[0]} ⌯︙ ${score} جولات`).join('\n');
    const mentions = entries.map(([id]) => id);
    const winner = entries[0][0];

    if (global.db?.users[winner]) {
        global.db.users[winner].xp = (global.db.users[winner].xp || 0) + 350;
        global.db.users[winner].cookies = (global.db.users[winner].cookies || 0) + 7;
    }

    await conn.sendMessage(chatId, {
        text: `🏆 *نتائج تحدي تخمين الفواكه الطازجة* 🍓\n\n${sorted}\n\n🏅 الفائز الأول بالمركز الأول المحترف: @${winner.split('@')[0]}\nحصل على: *+350 XP* & *🍪 +7 كوكيز* ⚡`,
        mentions
    });
    delete global.gameFruit[chatId];
}

async function handler(m, { conn }) {
    if (!global.gameFruit) global.gameFruit = {};
    const chatId = m.chat;

    if (global.gameFruit[chatId]) return m.reply("❌ هناك جولة فواكه قائمة بالفعل في هذا الجروب!");

    global.gameFruit[chatId] = { round: 0, scores: {}, current: null };
    
    // ريأكت بدء اللعبة المبهج بالفراولة
    await conn.sendMessage(m.chat, { react: { text: "🍓", key: m.key } });
    runFruitGame(m, conn, 1);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const g = global.gameFruit?.[chatId];
    if (!g?.current || !m.text) return false;

    const cur = g.current;
    const answer = m.text.trim().toLowerCase();

    if (!cur.answer.includes(answer)) return false;

    clearTimeout(cur.timer);
    g.current = null;

    g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;

    // ريأكت الاحتفال السريع 🎉
    await conn.sendMessage(m.chat, { react: { text: "🎉", key: m.key } });

    let captionText = `🎉 *إجابة صحيحة وحلوة!*\n\nعاش يا @${m.sender.split('@')[0]} جبت اسم الفاكهة صح 🏆\n⚔️ نقاطك الحالية: *${g.scores[m.sender]} نقطة*\n\n`;

    if (cur.round < MAX_ROUNDS) {
        captionText += `⏳ *استعدوا.. الجولة القادمة (${cur.round + 1} / 10) ستبدأ الآن!*`;
        await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
        setTimeout(() => runFruitGame(m, conn, cur.round + 1), 3000);
    } else {
        captionText += `🏁 *انتهت الـ 10 جولات كاملة! تابعوا الفائز النهائي الآن..*`;
        await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
        setTimeout(() => endFruitGame(m, conn), 2000);
    }
    return true;
};

handler.usage = ["فاكهة"];
handler.category = "games";
handler.command = ['فاكهة', 'فاكه', 'فواكة'];
export default handler;
  
