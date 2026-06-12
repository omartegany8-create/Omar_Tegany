/*
code: premium fast writing game (بدون زخارف - نظام تفاعل بشري ذكي)
by: 𝐓𝐨جي & Gemini
*/

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

    const msgText = `📌 *تحدي الكتابة الأسطوري السريع* ✍️⚡\n\n \n*• الجولة الحالية:* [ *${game.round} من ${MAX_ROUNDS}* ]\n*• الوقت المتاح: [ *30 ثانية* ]*\n\n🔥 *اكتب الكلمة دي بسرعة عشان تاخد الجولة:* \n\n👈🏻  *${randomWord}* 👉🏻\n\n_اكتب الكلمة صح وبدون غلطات إملائية !_`;
    
    await conn.sendMessage(chatId, { text: msgText });

    if (game.timeout) clearTimeout(game.timeout);
    game.timeout = setTimeout(async () => {
        if (global.writeGame?.games[chatId] && global.writeGame.games[chatId].round === game.round) {
            global.writeGame.games[chatId].answer = "";
            
            await conn.sendMessage(chatId, {
                text: `⏰ *انتهى الوقت ومحدش لحق يكتب الكلمة!*\n\nالكلمة المطلوبة كانت: *${randomWord}*\n\nنجهز الجولة اللي بعدها حالا صحصحوا معايا..`
            });

            if (game.round < MAX_ROUNDS) {
                setTimeout(() => sendWriteQuestion(m, conn, chatId), 2500);
            } else {
                finishWriteGame(m, conn, chatId);
            }
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
        await conn.sendMessage(chatId, { text: `🏁 *انتهت الـ ${MAX_ROUNDS} جولات كاملة!*\n\nبس للأسف مفيش ولا كيبورد اتحرك انهارده.. الجروب كلو نايم! 🦦😂` });
        delete global.writeGame.games[chatId];
        delete global.writeGame.scores[chatId];
        return;
    }

    const leaderboard = finalScores.map(([user, score], idx) => {
        const prize = getWritePrize(idx);
        
        if (global.db?.users[user]) {
            global.db.users[user].xp = (global.db.users[user].xp || 0) + prize.xp;
            global.db.users[user].cookies = (global.db.users[user].cookies || 0) + prize.cookies;
        }

        return `${prize.emoji} *المركز ${idx + 1}:* @${user.split('@')[0]}\n• جولات الفوز: [ *${score} جولات* ]\n• المكافأة المضافة: [ *+${prize.xp} XP* | *🍪 +${prize.cookies} كوكيز* ]`;
    }).join('\n\n');

    const winner = finalScores[0][0];

    await conn.sendMessage(chatId, {
        text: `🏁 *النتائج 👇🏻 - نهاية تحدي الكتابة* 🏆\n\n${leaderboard}\n\n🏅 *عاش يا صواريخ الكيبورد! الصدارة @${winner.split('@')[0]} إيدك سابقة الطلقة كالعادة!* 😉🔥`,
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

    if (cmd === 'حذف' || cmd === 'انهاء' || cmd === 'delete') {
        if (!global.writeGame.games[chatId]) return m.reply("❌ مفيش جولة كتابة نشطة حالياً عشان أحذفها!");
        if (global.writeGame.games[chatId].timeout) clearTimeout(global.writeGame.games[chatId].timeout);
        delete global.writeGame.games[chatId];
        delete global.writeGame.scores[chatId];
        return m.reply("🗑️ *تم إنهاء وإغلاق تحدي الكتابة.*");
    }

    if (global.writeGame.games[chatId]) {
        return m.reply(`⚠️ في تحدي كتابة شغال حالياً في الجروب!\n\nاكتب *.${command} حذف* لو حابب تقفله وتبدأ جولة مروقة على مية بيضا.`);
    }

    await conn.sendMessage(chatId, { react: { text: "✍️", key: m.key } });

    global.writeGame.games[chatId] = {
        round: 0,
        answer: "",
        timeout: null
    };
    global.writeGame.scores[chatId] = {};

    await m.reply(`⚡ *تحدي صواريخ الكيبورد والسرعة بدأ!*\n\nالتحدي مكون من *10 جولات* حماسية.. الكلمة هتظهر وأسرع واحد يكتبها صح بالشات هيقفل النقط والجوائز..\n\nالجولة الأولى 👇🏻... 🚀🔥`);

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

    if (userInput === game.answer) {
        clearTimeout(game.timeout);
        game.answer = ""; 
        
        scores[player] = (scores[player] || 0) + 1;

        await conn.sendMessage(chatId, { react: { text: "⚡", key: m.key } });

        let replyMsg = `🎉 *سرعة خيالية ما شاء الله عليك! لقطتها طيران*\n\nعاش يا @${player.split('@')[0]} كتبتها صح وسكورك الحالي: [ *${scores[player]} نقطة* ] 🎯\n\n`;

        const nextRound = game.round + 1;
        if (nextRound <= MAX_ROUNDS) {
            replyMsg += `⏳ *استعدوا.. الكلمة الجاية للجولة رقم (${nextRound} / 10) نازلة حالا في الشات...*`;
            await conn.sendMessage(chatId, { text: replyMsg, mentions: [player] }, { quoted: m });
            setTimeout(() => sendWriteQuestion(m, conn, chatId), 3000);
        } else {
            replyMsg += `🏁 *دي كانت الجولة الأخيرة في التحدي السريع! النتائج 👇🏻...*`;
            await conn.sendMessage(chatId, { text: replyMsg, mentions: [player] }, { quoted: m });
            setTimeout(() => finishWriteGame(m, conn, chatId), 2000);
        }
        return true;
    } 
    
    // فحص الكلمات القريبة الغلط (عشان التفاعل البشري التلقائي والتريّقة الحية)
    else if (userInput.length >= game.answer.length - 1 && userInput.length <= game.answer.length + 1 && !userInput.startsWith('.')) {
        await conn.sendMessage(chatId, { react: { text: "😐", key: m.key } });
        
        const writeRoasts = [
            "❌ *حرف واحد بوظ الدنيا!* صوابعك دخلت في بعضها ولا إيه؟ ركز وحاول تاني بسرعه! 😂🔥",
            "❌ *غلطة كيبورد ضيعت النقطة!* صحصح كدا الحروف هربت منك، حاول تاني بسرعة!",
            "❌ *قريب جداً بس مش هي!* السرعة لوحدها مش كفاية ركز في الحروف يا فنان!"
        ];
        const randomRoast = writeRoasts[Math.floor(Math.random() * writeRoasts.length)];
        await m.reply(randomRoast);
        return true;
    }

    return false;
};

writeHandler.usage = ["كتابه"];
writeHandler.category = "games";
writeHandler.command = ['كتابه', 'كتابة'];
export default writeHandler;
