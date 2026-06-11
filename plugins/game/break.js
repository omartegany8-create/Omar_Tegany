/*
code: premium word breaking game (بدون زخارف - نظام تفاعل بشري ذكي)
by: 𝐓𝐨جي & Gemini
*/

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
        // تحديث الرابط لسيرفر مستقر ومضمون لأسئلة التفكيك والتركيب
        const response = await fetch("https://raw.githubusercontent.com/Afghany/Premium-Files/main/games/tefkeek.json");
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        const q = data[Math.floor(Math.random() * data.length)];

        // ظبط قراءة المفاتيح حسب نظام ملف الـ JSON المستقر (الكلمة وتفكيكها الصحيح)
        game.question = q.question || q.word; 
        game.answer = (q.response || q.result || q.answer).trim();

        const msgText = `📌 *تحدي تفكيك الكلمات السريع* 🔨\n\n*البيانات الحالية للجولة:*\n• الجولة الحالية: [ *${game.round} من ${MAX_ROUNDS}* ]\n• الوقت المتاح: [ *30 ثانية* ]\n\n🧩 *أسرع واحد يفكك الكلمة دي فوراً بالشات:* \n\n👉🏻  *${game.question}* 👈🏻\n\n_اكتب الحروف متباعدة وبدون أي زخرفة عشان النقطة تتحسبلك بسرعة!_`;
        
        const msg = await conn.sendMessage(chatId, { text: msgText });
        game.msgId = msg.key.id;

        if (game.timeout) clearTimeout(game.timeout);
        game.timeout = setTimeout(async () => {
            if (global.breakGame?.games[chatId] && global.breakGame.games[chatId].round === game.round) {
                const correctAns = global.breakGame.games[chatId].answer;
                global.breakGame.games[chatId].answer = "";
                
                await conn.sendMessage(chatId, {
                    text: `⏰ *انتهى الوقت ومحدش لحق يفككها!*\n\nالتفكيك الصحيح كان: *${correctAns}*\n\nنجهز الجولة اللي بعدها حالا صحصحوا معايا..`
                });

                if (game.round < MAX_ROUNDS) {
                    setTimeout(() => sendBreakQuestion(m, conn, chatId), 2500);
                } else {
                    finishBreakGame(m, conn, chatId);
                }
            }
        }, 30000);

    } catch (error) {
        console.error(error);
        await conn.sendMessage(chatId, { text: "❌ حصل خطأ أثناء جلب الكلمات من السيرفر! جرب تشغل اللعبة تاني يسطا." });
        delete global.breakGame.games[chatId];
        delete global.breakGame.scores[chatId];
    }
}

// دالة إنهاء اللعبة وعرض كشف الحساب والجوائز بالتفصيل
async function finishBreakGame(m, conn, chatId) {
    const game = global.breakGame.games[chatId];
    const scores = global.breakGame.scores[chatId];
    if (!game) return;

    if (game.timeout) clearTimeout(game.timeout);

    let finalScores = Object.entries(scores).sort((a, b) => b[1].correct - a[1].correct);

    if (finalScores.length === 0) {
        await conn.sendMessage(chatId, { text: `🏁 *انتهت الـ ${MAX_ROUNDS} جولات كاملة!*\n\nبس للأسف محدش فيكم جمع ولا نقطة.. الجروب كله كسلان ورايح عليه نومة! 🦦` });
        delete global.breakGame.games[chatId];
        delete global.breakGame.scores[chatId];
        return;
    }

    const leaderboard = finalScores.map(([user, data], idx) => {
        let totalAttempts = data.correct + data.wrong;
        let winRatio = totalAttempts > 0 ? Math.round((data.correct / totalAttempts) * 100) : 0;
        let rankEmoji = idx === 0 ? "🏆" : idx === 1 ? "🥈" : "⭐";
        
        if (global.db?.users[user]) {
            global.db.users[user].xp = (global.db.users[user].xp || 0) + (data.correct * 50);
            global.db.users[user].cookies = (global.db.users[user].cookies || 0) + (data.correct * 1);
        }

        return `${rankEmoji} *المركز ${idx + 1}:* @${user.split('@')[0]}\n• تفكيك صحيح: [ *${data.correct} جولات* ]\n• محاولات خاطئة: [ *${data.wrong} مرة* ]\n• دقة السرعة: [ *${winRatio}%* ]\n• الجوائز المضافة: [ *+${data.correct * 50} XP* | *🍪 +${data.correct * 1} كوكيز* ]`;
    }).join('\n\n');

    const winner = finalScores[0][0];

    await conn.sendMessage(chatId, {
        text: `🏁 *لوحة شرف الأبطال - نهاية تحدي التفكيك* 🏆\n\n${leaderboard}\n\n🏅 *عاش يا ابطال السرعة والتركيز! الصدارة انهارده من نصيب @${winner.split('@')[0]} إيدك طلقة متمكن!* 🪄🔥`,
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

    if (cmd === 'حذف' || cmd === 'انهاء' || cmd === 'delete') {
        if (!global.breakGame.games[chatId]) return m.reply("❌ مفيش لعبة تفكيك شغالة حالياً عشان أحذفها يسطا!");
        if (global.breakGame.games[chatId].timeout) clearTimeout(global.breakGame.games[chatId].timeout);
        delete global.breakGame.games[chatId];
        delete global.breakGame.scores[chatId];
        return m.reply("🗑️ *أبشر! تم إلغاء وحذف لعبة التفكيك بنجاح وتصفير النقاط.*");
    }

    if (global.breakGame.games[chatId]) {
        return m.reply(`⚠️ يسطا في جولة تفكيك شغالة طحن حالياً في الشات!\n\nاكتب *.${command} حذف* لو عايز تقفلها وتبدأ على مضافة.`);
    }

    await conn.sendMessage(chatId, { react: { text: "🔨", key: m.key } });

    global.breakGame.games[chatId] = {
        round: 0,
        answer: "",
        timeout: null
    };
    global.breakGame.scores[chatId] = {};

    await m.reply(`🔨 *تحدي تفكيك الكلمات السريع بدأ!*\n\nالتحدي مكون من *10 جولات متتالية*، ركز في الكلمة وفكك حروفها طياري بالشات عشان تقفش النقط والجوائز..\n\nالجولة الأولى نازلة حالا في السكة... 🚀🔥`);

    setTimeout(() => sendBreakQuestion(m, conn, chatId), 2000);
}

breakHandler.before = async (m, { conn }) => {
    const chatId = m.chat;
    if (!m.text || !global.breakGame?.games?.[chatId] || !global.breakGame?.scores?.[chatId]) return false;

    const game = global.breakGame.games[chatId];
    const scores = global.breakGame.scores[chatId];
    const player = m.sender;

    if (!game.answer) return false;

    if (!scores[player]) {
        scores[player] = { correct: 0, wrong: 0 };
    }

    const userInput = m.text.trim();

    if (userInput === game.answer) {
        clearTimeout(game.timeout);
        game.answer = ""; 
        scores[player].correct += 1;

        await conn.sendMessage(chatId, { react: { text: "⚡", key: m.key } });

        let replyMsg = `🎉 *ماشاءالله سريع وجبتها طيران!*\n\nعاش يا @${player.split('@')[0]} التفكيك صح وعندك دلوقتي: [ *${scores[player].correct} نقطة* ] 🎯\n\n`;

        const nextRound = game.round + 1;
        if (nextRound <= MAX_ROUNDS) {
            replyMsg += `⏳ *استعدوا.. الجولة رقم (${nextRound} / 10) نازلة حالا في الشات...*`;
            await conn.sendMessage(chatId, { text: replyMsg, mentions: [player] }, { quoted: m });
            setTimeout(() => sendBreakQuestion(m, conn, chatId), 3000);
        } else {
            replyMsg += `🏁 *دي كانت الجولة الأخيرة في التحدي! ثواني وبحسب لكم الترتيب النهائي والجوائز...*`;
            await conn.sendMessage(chatId, { text: replyMsg, mentions: [player] }, { quoted: m });
            setTimeout(() => finishBreakGame(m, conn, chatId), 2000);
        }
        return true;
    } 
    
    // فحص الإجابات الخاطئة القريبة (عشان التفاعل البشري الذكي والتريّقة الحية)
    else if (userInput.length >= game.answer.length - 2 && userInput.length <= game.answer.length + 2 && !userInput.startsWith('.')) {
        scores[player].wrong += 1;
        await conn.sendMessage(chatId, { react: { text: "🤦🏻", key: m.key } });
        
        const breakRoasts = [
            "❌ *التفكيك غلط خالص!* ركز في الحروف يسطا ايدك سابقت عقلك في الكتابة! 😂🔥",
            "❌ *مش قايلك صحصح؟* الحروف متبهدلة منك حاول تاني بسرعة الجولة هتطير!",
            "❌ *قريب بس غلط!* ركزوا يا شباب وفككوا الكلمة صح!"
        ];
        const randomRoast = breakRoasts[Math.floor(Math.random() * breakRoasts.length)];
        await m.reply(randomRoast);
        return true;
    }

    return false;
};

breakHandler.usage = ["تفكيك"];
breakHandler.category = "games";
breakHandler.command = ['تفكيك', 'فكك'];
export default breakHandler;
