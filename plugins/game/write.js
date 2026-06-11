const MAX_ROUNDS = 10;

// قائمة الكلمات المنوعة والمطورة لمنافسة نارية
const wordsList = [
    "سكونا", "غوجو", "لوفي", "ميرو", "ناروتو", "إيتاتشي", "أيزن", "شيبويا", 
    "لاو", "توجي", "كارولين", "فريزا", "غوكو" ,"يوجي", "ميغومي", "نوبارا", 
    "جوجتسو", "كاكاشي", "زورو", "كوروساكي", "ميكاسا", "ليفاي", "مادارا", 
    "تانجيرو", "نيزوكو", "ميهوك", "شانكس", "ماكيما", "باين"
];

// دالة توزيع جوائز كشف الحساب النهائي بالملّي
const getWritePrize = (rank) => {
    if (rank === 0) return { xp: 500, cookies: 10, emoji: "🏆" };
    if (rank === 1) return { xp: 300, cookies: 5, emoji: "🥈" };
    return { xp: 100, cookies: 2, emoji: "⭐" };
};

async function sendWriteQuestion(m, conn, chatId) {
    const game = global.writeGame.games[chatId];
    if (!game) return;

    game.round++;
    if (game.round > MAX_ROUNDS) {
        return finishWriteGame(m, conn, chatId);
    }

    const randomWord = wordsList[Math.floor(Math.random() * wordsList.length)];
    game.answer = randomWord.trim();

    const msgText = `✍️ *لعبة الكتابة السريعة الاسطورية* ⚡\n\nجولة رقم: [ *${game.round} من ${MAX_ROUNDS}* ] 🎲\n────────────────\n\n🔥 *أنقش الكلمة دي بأسـرع سرعة عندك:* \n\n👉🏻  *${randomWord}* 👈🏻\n\n────────────────\n> _*اكتب الكلمة طلقة عشان النقطة تتحسبلك!*_\n⏱️ _معاك 30 ثانية أشوف سرعتكم!_`;
    
    await conn.sendMessage(chatId, { text: msgText });

    if (game.timeout) clearTimeout(game.timeout);
    game.timeout = setTimeout(async () => {
        if (global.writeGame?.games[chatId]) {
            delete global.writeGame.games[chatId];
            delete global.writeGame.scores[chatId];
            await conn.sendMessage(chatId, {
                text: `⏰ *انتهى الوقت ومحدش كتب حاجة!* 🦦\nمالكو كدا انهارده مش مظبوطين؟ إيدكم مقطوعة ولا إيه؟ 😂\n\n> _عايز تصحصح الشات تاني؟ اكتب 👈🏻 .كتابه_`
            });
        }
    }, 30000);
}

async function finishWriteGame(m, conn, chatId) {
    const game = global.writeGame.games[chatId];
    const scores = global.writeGame.scores[chatId];
    if (!game) return;

    if (game.timeout) clearTimeout(game.timeout);

    let finalScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    if (finalScores.length === 0) {
        await conn.sendMessage(chatId, { text: "🏁 *خلصت الـ 10 جولات ومحدش عبرنا بنقطة واحدة.. كسلانين بشكل!* 🦦" });
        delete global.writeGame.games[chatId];
        delete global.writeGame.scores[chatId];
        return;
    }

    let leaderboard = finalScores.map(([user, score], idx) => {
        const prize = getWritePrize(idx);
        
        if (global.db?.users[user]) {
            global.db.users[user].xp = (global.db.users[user].xp || 0) + prize.xp;
            global.db.users[user].cookies = (global.db.users[user].cookies || 0) + prize.cookies;
        }

        return `${prize.emoji} *المركز ${idx + 1}:* @${user.split('@')[0]}\n   🎯 سرعة وكتب صح: *${score} جولات* | 🎁 جوائز: *+${prize.xp} XP* & *🍪 +${prize.cookies} كوكيز*\n────────────────`;
    }).join('\n');

    const winner = finalScores[0][0];

    await conn.sendMessage(chatId, {
        text: `🏁 *انتهت جولات تحدي الكتابة السريعة!* ✍️⚡\n\nإليكم النتائج :\n\n────────────────\n${leaderboard}\n🏅 *ألف مبروك للمكتسح @${winner.split('@')[0]}.. إيدك صروخ !* 😉🔥`,
        mentions: finalScores.map(e => e[0])
    });

    delete global.writeGame.games[chatId];
    delete global.writeGame.scores[chatId];
}

async function writeHandler(m, { conn, text, command }) {
    if (!global.writeGame) global.writeGame = { games: {}, scores: {} };
    const chatId = m.chat;

    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];

    // ميزة الحذف والإلغاء الفوري للأمر (.كتابه حذف)
    if (cmd === 'حذف' || cmd === 'انهاء' || cmd === 'delete') {
        if (!global.writeGame.games[chatId]) return m.reply("❌ مفيش لعبة كتابة شغالة عشان أحذفها يسطا!");
        if (global.writeGame.games[chatId].timeout) clearTimeout(global.writeGame.games[chatId].timeout);
        delete global.writeGame.games[chatId];
        delete global.writeGame.scores[chatId];
        return m.reply("🗑️ *أبشر! تم إلغاء وحذف لعبة الكتابة.*");
    }

    if (global.writeGame.games[chatId]) {
        return m.reply(`⚠️ يسطا في جولة كتابة شغالة في الجروب حالياً!\nاكتب 👈🏻 *.${command} حذف* لو عايز تقفلها وتبدأ على مية بيضا.`);
    }

    // ريأكت القلم عند البدء ✏️
    await conn.sendMessage(chatId, { react: { text: "✏️", key: m.key } });

    global.writeGame.games[chatId] = {
        round: 0,
        answer: "",
        timeout: null
    };
    global.writeGame.scores[chatId] = {};

    await m.reply(`✍️ *تحدي لعبة الكتابة يلا نشوف مين اسرع!* ⚡\nاللعبة عبارة عن *10 جولات*.. الكلمة هتظهر وأسرع واحد هيكتبها هياخد النقطة والجوائز!\n\nالجولة الأولى ... 🚀🔥`);

    setTimeout(() => sendWriteQuestion(m, conn, chatId), 2000);
}

writeHandler.before = async (m, { conn }) => {
    const chatId = m.chat;
    if (!m.text || !global.writeGame?.games?.[chatId] || !global.writeGame?.scores?.[chatId]) return false;

    const game = global.writeGame.games[chatId];
    const scores = global.writeGame.scores[chatId];
    const player = m.sender;

    if (!game.answer) return false;

    const userInput = m.text.trim();

    // حالة الإجابة الصحيحة والسريعة
    if (userInput === game.answer) {
        clearTimeout(game.timeout);
        game.answer = ""; // قفل الإجابة فوراً لمنع التكرار
        
        scores[player] = (scores[player] || 0) + 1;

        await conn.sendMessage(chatId, { react: { text: "⚡", key: m.key } });

        let replyMsg = `🎉 *سرعة خياليه ماشاء الله عليك ! كتبتها صح* ⚡\n\nعاش  @${player.split('@')[0]} نقاطك الحالية بقت: [ *${scores[player]} نقطة* ] 🎯\n\n`;

        const nextRound = game.round + 1;
        if (nextRound <= MAX_ROUNDS) {
            replyMsg += `⏳ *استعدوا.. الكلمة الجاية للجولة رقم (${nextRound} / 10) نازلة دلوقتي...*`;
            await conn.sendMessage(chatId, { text: replyMsg, mentions: [player] }, { quoted: m });
            setTimeout(() => sendWriteQuestion(m, conn, chatId), 3000);
        } else {
            replyMsg += `🏁 *دي كانت الجولة الأخيرة! ثواني وبطلعلكم نتائح اسرع اعضاء ف الجروب...*`;
            await conn.sendMessage(chatId, { text: replyMsg, mentions: [player] }, { quoted: m });
            setTimeout(() => finishWriteGame(m, conn, chatId), 2000);
        }
        return true;
    } 
    
    // تلميح لو العضو كتب كلمة قريبة أو غط في الحروف (ومش أمر بوت)
    else if (userInput.length >= game.answer.length - 1 && userInput.length <= game.answer.length + 1 && !userInput.startsWith('.')) {
        await conn.sendMessage(chatId, { react: { text: "❌", key: m.key } });
    }

    return false;
};

writeHandler.usage = ["كتابه"];
writeHandler.category = "games";
writeHandler.command = ['كتابه', 'كتابة'];
export default writeHandler;
