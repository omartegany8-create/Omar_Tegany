/*
code: game tarkeb / arrange (10 rounds edition)
by: 𝐓𝐨𝐣𝐢 & Gemini
*/

const MAX_ROUNDS = 10;

// قائمة كلمات مخصصة ومستقلة تماماً لمنع التداخل مع أي ملف json في السورس
const tarkebWords = [
    { puzzle: "غ و ج و", answer: "غوجو" },
    { puzzle: "س و ك و ن ا", answer: "سوكونا" },
    { puzzle: "ل و ف ي", answer: "لوفي" },
    { puzzle: "ن ا ر و ت و", answer: "ناروتو" },
    { puzzle: "إ ي ت ا ت ش ي", answer: "إيتاتشي" },
    { puzzle: "أ ي ز ن", answer: "أيزن" },
    { puzzle: "ت و ج ي", answer: "توجي" },
    { puzzle: "م ي ج و م ي", answer: "ميغومي" },
    { puzzle: "ن و ب ا ر ا", answer: "نوبارا" },
    { puzzle: "ز و ر و", answer: "زورو" },
    { puzzle: "س ا س ك ي", answer: "ساسكي" },
    { puzzle: "م ي ر و", answer: "ميرو" },
    { puzzle: "ع م ر", answer: "عمر" },
    { puzzle: "ش ي ب و ي ا", answer: "شيبويا" },
    { puzzle: "ك ا ك ا ش ي", answer: "كاكاشي" },
    { puzzle: "ل ي ف ا ي", answer: "ليفاي" },
    { puzzle: "م ا ي ك ي", answer: "مايكي" },
    { puzzle: "ت ا ن ج ي ر و", answer: "تانجيرو" },
    { puzzle: "ك ا ن ي ك ي", answer: "كانيكي" },
    { puzzle: "ا ي ر ي ن", answer: "ايرين" }
];

async function startTarkebRound(m, conn, round) {
    const chatId = m.chat;
    const g = global.tarkebGameCustom[chatId];
    
    const item = tarkebWords[Math.floor(Math.random() * tarkebWords.length)];
    g.current = {
        answer: item.answer,
        round: round,
        timer: setTimeout(async () => {
            if (global.tarkebGameCustom?.[chatId]?.current?.round === round) {
                g.current = null;
                await conn.sendMessage(chatId, { text: `⏰ *انتهى وقت الجولة!* الإجابة الصحيحة كانت: *${item.answer}*\n\n⏳ _استعدوا للجولة التالية..._` });
                
                if (round < MAX_ROUNDS) {
                    setTimeout(() => startTarkebRound(m, conn, round + 1), 2000);
                } else {
                    endTarkebGame(m, conn);
                }
            }
        }, 30000)
    };

    await conn.sendMessage(chatId, {
        text: `🧩 *لعبة التركيب والدمج 🀄 (جولة: ${round} / ${MAX_ROUNDS})*\n\nقم بدمج وتركيب الحروف التالية بسرعة:\n👇👇\n👑  *${item.puzzle}* 👑\n\n> _معاك 30 ثانية للإجابة السليمة!_`
    });
}

async function endTarkebGame(m, conn) {
    const chatId = m.chat;
    const g = global.tarkebGameCustom[chatId];
    
    const entries = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
        await conn.sendMessage(chatId, { text: "🏁 *انتهت لعبة التركيب!* ولم يشارك أحد في هذه الجولة." });
        delete global.tarkebGameCustom[chatId];
        return;
    }

    const sorted = entries.map(([id, score], i) => `${i + 1}. @${id.split('@')[0]} ⌯︙ ${score} جولات`).join('\n');
    const mentions = entries.map(([id]) => id);
    const winner = entries[0][0];

    if (global.db?.users[winner]) {
        global.db.users[winner].xp = (global.db.users[winner].xp || 0) + 400;
        global.db.users[winner].cookies = (global.db.users[winner].cookies || 0) + 8;
    }

    await conn.sendMessage(chatId, {
        text: `🏆 *لوحة شرف أبطال التركيب والدمج* 🀄\n\n${sorted}\n\n🏅 الفائز الكينج: @${winner.split('@')[0]}\nحصل على: *+400 XP* & *🍪 +8 كوكيز* ⚡`,
        mentions
    });
    delete global.tarkebGameCustom[chatId];
}

async function handler(m, { conn, text }) {
    if (!global.tarkebGameCustom) global.tarkebGameCustom = {};
    const chatId = m.chat;
    const cmd = (text || '').trim().toLowerCase();

    // أمر الحذف لإلغاء اللعبة
    if (cmd === 'حذف' || cmd === 'delete') {
        if (!global.tarkebGameCustom[chatId]) return m.reply("❌ لا توجد لعبة تركيب نشطة لإلغائها حالياً!");
        if (global.tarkebGameCustom[chatId].current?.timer) clearTimeout(global.tarkebGameCustom[chatId].current.timer);
        delete global.tarkebGameCustom[chatId];
        return m.reply("🗑️ تم إلغاء وحذف لعبة التركيب بنجاح!");
    }

    if (global.tarkebGameCustom[chatId]) return m.reply("❌ هناك لعبة تركيب قائمة بالفعل في هذا الجروب!\nاكتب *.تركيب حذف* لإلغائها.");

    global.tarkebGameCustom[chatId] = { round: 0, scores: {}, current: null };
    
    // ريأكت بدء اللعبة 🀄
    await conn.sendMessage(m.chat, { react: { text: "🀄", key: m.key } });
    startTarkebRound(m, conn, 1);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const g = global.tarkebGameCustom?.[chatId];
    if (!g?.current || !m.text) return false;

    const cur = g.current;
    const userAnswer = m.text.trim().toLowerCase();

    if (userAnswer !== cur.answer) return false;

    clearTimeout(cur.timer);
    g.current = null;

    g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;

    // ريأكت الصاعقة ⚡ للفائز بالجولة
    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

    let captionText = `⚡ *تركيب سليم وعاش يا بطل!*\n\nالمحترف @${m.sender.split('@')[0]} ركب الكلمة صح 🏆\n⚔️ نقاطك الحالية: *${g.scores[m.sender]} نقطة*\n\n`;

    if (cur.round < MAX_ROUNDS) {
        captionText += `⏳ *استعدوا.. الجولة القادمة (${cur.round + 1} / 10) ستبدأ الآن!*`;
        await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
        setTimeout(() => startTarkebRound(m, conn, cur.round + 1), 2500);
    } else {
        captionText += `🏁 *انتهت الـ 10 جولات! تابعوا النتائج الختامية...*`;
        await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
        setTimeout(() => endTarkebGame(m, conn), 1500);
    }
    return true;
};

handler.usage = ["تركيب"];
handler.category = "games";
handler.command = ['تركيب', 'دمج'];
export default handler;
