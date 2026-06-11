/*
code: game tarkeb / arrange (10 rounds premium edition)
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
    { puzzle: "ش ي ب و ي ا", answer: "شيبويا" },
    { puzzle: "ك ا ك ا ش ي", answer: "كاكاشي" },
    { puzzle: "ل ي ف ا ي", answer: "ليفاي" },
    { puzzle: "م ا ي ك ي", answer: "مايكي" },
    { puzzle: "ت ا ن ج ي ر و", answer: "تانجيرو" },
    { puzzle: "ك ا ن ي ك ي", answer: "كانيكي" },
    { puzzle: "ا ي ر ي ن", answer: "ايرين" }
];

// دالة توزيع جوائز كشف الحساب النهائي بالملّي للترتيب
const getTarkebPrize = (rank) => {
    if (rank === 0) return { xp: 450, cookies: 9, emoji: "🏆" };
    if (rank === 1) return { xp: 250, cookies: 5, emoji: "🥈" };
    return { xp: 100, cookies: 2, emoji: "⭐" };
};

// تجميع كل الإجابات المتاحة لفحص الحالات القريبة والغلط
const allTarkebAnswers = tarkebWords.map(w => w.answer);

async function startTarkebRound(m, conn, chatId, round) {
    const g = global.tarkebGameCustom[chatId];
    if (!g) return;

    g.round = round;
    const item = tarkebWords[Math.floor(Math.random() * tarkebWords.length)];
    
    g.current = {
        answer: item.answer,
        round: round,
        timer: setTimeout(async () => {
            // التحقق أن اللعبة لسه في نفس الجروب ونفس الجولة ممشتش
            if (global.tarkebGameCustom?.[chatId]?.round === round) {
                const correctAns = global.tarkebGameCustom[chatId].current.answer;
                global.tarkebGameCustom[chatId].current = null;
                
                await conn.sendMessage(chatId, { 
                    text: `⏰ *انتهى الوقت ومحدش لحق يركبها!*\n\nالتركيب الصحيح كان: *${correctAns}*\n\nنجهز الجولة اللي بعدها حالا صحصحوا معايا..` 
                });
                
                if (round < MAX_ROUNDS) {
                    setTimeout(() => startTarkebRound(m, conn, chatId, round + 1), 2500);
                } else {
                    endTarkebGame(m, conn, chatId);
                }
            }
        }, 30000)
    };

    const msgText = `📌 *تحدي تركيب ودمج الحروف المبعثرة* 🀄\n\n*البيانات الحالية للجولة:*\n• الجولة الحالية: [ *${round} من ${MAX_ROUNDS}* ]\n• الوقت المتاح: [ *30 ثانية* ]\n\n🧩 *اجمع الحروف دي واكتب الكلمة مدموجة فوراً بالشات:* \n\n👉🏻  *${item.puzzle}* 👈🏻\n\n_اكتب الكلمة شبك في بعضها وبدون زخرفة عشان تقفش النقطة!_`;
    
    const msg = await conn.sendMessage(chatId, { text: msgText });
    g.current.id = msg.key.id;
}

async function endTarkebGame(m, conn, chatId) {
    const g = global.tarkebGameCustom[chatId];
    if (!g) return;
    
    if (g.current?.timer) clearTimeout(g.current.timer);

    const entries = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
        await conn.sendMessage(chatId, { text: `🏁 *انتهت الـ ${MAX_ROUNDS} جولات كاملة!*\n\nبس للأسف مفيش ولا دماغ اشتغلت انهارده.. الجروب كله حروفه مبعثرة ومحتاج تجميع! 🦦😂` });
        delete global.tarkebGameCustom[chatId];
        return;
    }

    const leaderboard = entries.map(([user, score], idx) => {
        const prize = getTarkebPrize(idx);
        
        if (global.db?.users[user]) {
            global.db.users[user].xp = (global.db.users[user].xp || 0) + prize.xp;
            global.db.users[user].cookies = (global.db.users[user].cookies || 0) + prize.cookies;
        }

        return `${prize.emoji} *المركز ${idx + 1}:* @${user.split('@')[0]}\n• تركيب صحيح: [ *${score} جولات* ]\n• المكافأة المضافة: [ *+${prize.xp} XP* | *🍪 +${prize.cookies} كوكيز* ]`;
    }).join('\n\n');

    const winner = entries[0][0];

    await conn.sendMessage(chatId, {
        text: `🏁 *لوحة show الأبطال - نهاية تحدي التركيب* 🏆\n\n${leaderboard}\n\n🏅 *عاش يا أبطال! الصدارة @${winner.split('@')[0]} دمجت الكلمات في ثواني!* 🀄🔥`,
        mentions: entries.map(e => e[0])
    });
    
    delete global.tarkebGameCustom[chatId];
}

async function handler(m, { conn, text, command }) {
    if (!global.tarkebGameCustom) global.tarkebGameCustom = {};
    const chatId = m.chat;
    const cmd = (text || '').trim().toLowerCase().split(' ')[0];

    // ميزة الحذف الفوري والإلغاء
    if (cmd === 'حذف' || cmd === 'انهاء' || cmd === 'delete') {
        if (!global.tarkebGameCustom[chatId]) return m.reply("❌ مفيش جولة تركيب نشطة حالياً عشان أحذفها!");
        if (global.tarkebGameCustom[chatId].current?.timer) clearTimeout(global.tarkebGameCustom[chatId].current.timer);
        delete global.tarkebGameCustom[chatId];
        return m.reply("🗑️ *تم إنهاء وإغلاق تحدي التركيب وتصفير اللوحة بنجاح.*");
    }

    if (global.tarkebGameCustom[chatId]) return m.reply(`⚠️ في تحدي تركيب شغال حالياً في الجروب!\n\nاكتب *.${command} حذف* لو حابب تقفله وتبدأ جولة جديدة.`);

    await conn.sendMessage(chatId, { react: { text: "🀄", key: m.key } });

    global.tarkebGameCustom[chatId] = { round: 0, scores: {}, current: null };
    
    await m.reply(`🀄 *تحدي تركيب ودمج الحروف السريع بدأ!*\n\nالتحدي مكون من *10 جولات* حماسية.. الحروف هتظهر متفككة وأسرع واحد يدمجها صح في كلمة هيقفل النقط والجوائز..\n\nالجولة الأولى نازلة في الشات حالا... 🚀🔥`);
    
    setTimeout(() => startTarkebRound(m, conn, chatId, 1), 2000);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const g = global.tarkebGameCustom?.[chatId];
    if (!g?.current || !m.text) return false;

    const cur = g.current;
    const userAnswer = m.text.trim().toLowerCase();

    if (userAnswer === cur.answer) {
        clearTimeout(cur.timer);
        g.current = null;

        g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;

        await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

        let replyMsg = `🎉 *سرعة متمكنة وتركيب عالي!* \n\nعاش يا @${m.sender.split('@')[0]} دمجتها صح وهي فعلاً (*${userAnswer}*) 🏆\n🎯 مجموع نقاطك حالياً: [ *${g.scores[m.sender]} نقطة* ]\n\n`;

        const nextRound = cur.round + 1;
        if (nextRound <= MAX_ROUNDS) {
            replyMsg += `⏳ *استعدوا.. الجولة رقم (${nextRound} / 10) نازلة حالا في الشات...*`;
            await conn.sendMessage(chatId, { text: replyMsg, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => startTarkebRound(m, conn, chatId, nextRound), 3000);
        } else {
            replyMsg += `🏁 *دي كانت الجولة الأخيرة في التحدي!  النتائج 👇🏻...*`;
            await conn.sendMessage(chatId, { text: replyMsg, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => endTarkebGame(m, conn, chatId), 2000);
        }
        return true;
    } 
    
    // فحص الإجابات الخاطئة القريبة من أي كلمة في القائمة (عشان التفاعل البشري المروق)
    else if (allTarkebAnswers.includes(userAnswer) && !userAnswer.startsWith('.')) {
        await conn.sendMessage(m.chat, { react: { text: "🙂", key: m.key } });
        
        const tarkebRoasts = [
            "❌ *التركيب مش مظبوط نهائي!* ركز في الحروف المعروضة فوق يسطا ومتبدلش رموز! 😂🔥",
            "❌ *تجميعة فاشلة!* الحروف دي متطلعش الكلمة دي خالص، ركز وحاول تاني بسرعه!",
            "❌ *قربت بس مش هي!* ركز في الحروف المبعثرة عشان تاخد النقطة!"
        ];
        const randomRoast = tarkebRoasts[Math.floor(Math.random() * tarkebRoasts.length)];
        await m.reply(randomRoast);
        return true;
    }

    return false;
};

handler.usage = ["تركيب"];
handler.category = "games";
handler.command = ['تركيب', 'دمج', 'التركيب'];
export default handler;
