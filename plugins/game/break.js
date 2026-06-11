const MAX_ROUNDS = 10;

// دالة مخصصة لجلب سؤال جديد وعرضه بشكل فخم ومنسق
async function sendBreakQuestion(m, conn, chatId) {
    const game = global.breakGame.games[chatId];
    if (!game) return;

    game.round++;
    if (game.round > MAX_ROUNDS) {
        return finishBreakGame(m, conn, chatId);
    }

    try {
        const response = await fetch("https://raw.githubusercontent.com/Xov445447533/Xov11111/master/src/JSON/venom-%D8%AA%D9%81%D9%83%D9%8A%D9%84%D9%83.json");
        const data = await response.json();
        const q = data[Math.floor(Math.random() * data.length)];

        game.answer = q.response.trim();

        const msgText = `🔨 *لعبة التفكيك* 🎮\n\nجولة رقم: [ *${game.round} من ${MAX_ROUNDS}* ] 🎲\n\n🧩 *فـكـك الـكـلـمـة دي ف أسـرع وقـت:* \n👉🏻  *${q.question}* 👈🏻\n\n────────────────\n⏱️ _معاك 30 ثانية لو الشات نام ومحدش فككها اللعبة هتقفل تلقائي!_`;
        
        await conn.sendMessage(chatId, { text: msgText });

        // إعادة تشغيل التايم أوت للجولة الجديدة
        if (game.timeout) clearTimeout(game.timeout);
        game.timeout = setTimeout(async () => {
            if (global.breakGame?.games[chatId]) {
                delete global.breakGame.games[chatId];
                delete global.breakGame.scores[chatId];
                await conn.sendMessage(chatId, {
                    text: `💤 *يا خسارة! انتهى الوقت ومحدش فكك الكلمة..*🦦\n*تم إنهاء اللعبة لعدم التفاعل.*\n\n> 💡 _عايز تصحصح الجروب؟ اكتب 👈🏻 .تفكيك_`
                });
            }
        }, 30000);

    } catch (error) {
        await conn.sendMessage(chatId, { text: "❌ حصل خطأ أثناء جلب الكلمات من السيرفر يسطا!" });
        delete global.breakGame.games[chatId];
    }
}

// دالة إنهاء اللعبة وعرض كشف الحساب والجوائز بالتفصيل
async function finishBreakGame(m, conn, chatId) {
    const game = global.breakGame.games[chatId];
    const scores = global.breakGame.scores[chatId];
    if (!game) return;

    if (game.timeout) clearTimeout(game.timeout);

    let finalScores = Object.entries(scores).sort((a, b) => b[1].correct - a[1].correct);

    let leaderboard = finalScores.map(([user, data], idx) => {
        let totalAttempts = data.correct + data.wrong;
        let winRatio = totalAttempts > 0 ? Math.round((data.correct / totalAttempts) * 100) : 0;
        
        // توزيع الجوائز المالية والـ XP للأبطال
        if (global.db?.users[user]) {
            global.db.users[user].xp = (global.db.users[user].xp || 0) + (data.correct * 50);
            global.db.users[user].cookies = (global.db.users[user].cookies || 0) + (data.correct * 1);
        }

        return `${idx + 1}️⃣ ⇦ @${user.split('@')[0]}\n   🎯 تفكيك صحيح: *${data.correct}*\n   ❌ محاولات خاطئة: *${data.wrong}*\n   📊 نسبة السرعة: *${winRatio}%*\n   🏅 الجوائز: *+${data.correct * 50} XP* & *🍪 +${data.correct * 1} كوكيز*\n────────────────`;
    }).join('\n') || "😔 مفيش أي حد شارك انهارده.. الجروب كسلان وبيروح عليه نومة!";

    await conn.sendMessage(chatId, {
        text: `🏁 *انتهت الـ ${MAX_ROUNDS} جولات من تحدي التفكيك!* 🔨✨\n\nإليكم لوحة أسرع المفككين بالجروب:\n\n────────────────\n${leaderboard}\n🏆 *عاش يا وحوش السرعة والتركيز!* 🪄🔥`,
        mentions: finalScores.map(e => e[0])
    });

    delete global.breakGame.games[chatId];
    delete global.breakGame.scores[chatId];
}

async function breakHandler(m, { conn, text, command }) {
    if (!global.breakGame) global.breakGame = { games: {}, scores: {} };
    const chatId = m.chat;

    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];

    // ميزة الحذف الفورية للأمر من قبل أي عضو لمنع التعليق
    if (cmd === 'حذف' || cmd === 'انهاء' || cmd === 'delete') {
        if (!global.breakGame.games[chatId]) return m.reply("❌ مفيش لعبة تفكيك شغالة حالياً عشان أحذفها يسطا!");
        if (global.breakGame.games[chatId].timeout) clearTimeout(global.breakGame.games[chatId].timeout);
        delete global.breakGame.games[chatId];
        delete global.breakGame.scores[chatId];
        return m.reply("🗑️ *أبشر! تم إلغاء وحذف لعبة التفكيك بنجاح وتصفير النقاط.*");
    }

    if (global.breakGame.games[chatId]) {
        return m.reply(`⚠️ يسطا في جولة تفكيك شغالة في الشات!\nاكتب 👈🏻 *.${command} حذف* لو عايز تقفلها وتبدأ من جديد.`);
    }

    // ريأكت أيقونة التفكيك والبدء
    await conn.sendMessage(chatId, { react: { text: "🔨", key: m.key } });

    // تهيئة بيانات اللعبة للجروب
    global.breakGame.games[chatId] = {
        round: 0,
        answer: "",
        timeout: null
    };
    global.breakGame.scores[chatId] = {};

    await m.reply(`🔨 *مستعدين ؟ تحدي التفكيك بدأ!* 🎮\nاللعبة مكونة من *10 جولات حماسية ورا بعض*.. أسرع واحد بيكتب الإجابة الصح هو اللي بياخد النقطة والجوائز!\n\nالجولة الأولى نازلة حالا... 🚀🔥`);

    setTimeout(() => sendBreakQuestion(m, conn, chatId), 2000);
}

breakHandler.before = async (m, { conn }) => {
    const chatId = m.chat;
    if (!m.text || !global.breakGame?.games?.[chatId] || !global.breakGame?.scores?.[chatId]) return false;

    const game = global.breakGame.games[chatId];
    const scores = global.breakGame.scores[chatId];
    const player = m.sender;

    if (!game.answer) return false;

    // تهيئة سجل اللاعب لو أول مرة يشارك
    if (!scores[player]) {
        scores[player] = { correct: 0, wrong: 0 };
    }

    const userInput = m.text.trim();

    if (userInput === game.answer) {
        // إجابة صحيحة
        clearTimeout(game.timeout);
        game.answer = ""; // قفل الإجابة للجولة الحالية منعاً للتكرار
        scores[player].correct += 1;

        await conn.sendMessage(chatId, { react: { text: "✅", key: m.key } });

        let replyMsg = `🎉 *عاش يا وحش! لقطتها طلقة* ⚡\nإجابتك صحيحة وعندك دلوقتي: [ *${scores[player].correct} نقطة* ] 🎯\n\n`;

        if (game.round < MAX_ROUNDS) {
            replyMsg += `⏳ *استعدوا.. الجولة القادمة رقم (${game.round + 1}) نازلة حالا...*`;
            await conn.sendMessage(chatId, { text: replyMsg }, { quoted: m });
            setTimeout(() => sendBreakQuestion(m, conn, chatId), 3000);
        } else {
            replyMsg += `🏁 *دي كانت الجولة الأخيرة! ثواني وبحسب لكم النتائج النهائية ...*`;
            await conn.sendMessage(chatId, { text: replyMsg }, { quoted: m });
            setTimeout(() => finishBreakGame(m, conn, chatId), 2000);
        }
        return true;
    } 
    
    // فحص الإجابات الخاطئة (لو الكلمة قريبة في الطول من الإجابة ومش أمر بوت)
    else if (userInput.length >= game.answer.length - 2 && userInput.length <= game.answer.length + 2 && !userInput.startsWith('.')) {
        scores[player].wrong += 1;
        await conn.sendMessage(chatId, { react: { text: "⁉️", key: m.key } });
    }

    return false;
};

breakHandler.usage = ["تفكيك"];
breakHandler.category = "games";
breakHandler.command = ['تفكيك'];
export default breakHandler;
