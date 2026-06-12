/*
code: premium word breaking game (أنمي إديشن - تفاعل ذكي ونظيف)
by: 𝐓𝐨جي & Gemini
*/

const MAX_ROUNDS = 10;

// قاعدة بيانات داخلية ضخمة ومضمونة لشخصيات ومصطلحات الأنمي متفككة جاهزة
const LOCAL_WORDS_DATABASE = [
    { word: "لوفي", answer: "ل و ف ي" },
    { word: "زورو", answer: "ز و ر و" },
    { word: "سانجي", answer: "س ا ن ج ي" },
    { word: "شانكس", answer: "ش ا ن ك س" },
    { word: "ايس", answer: "ا ي س" },
    { word: "ميهوك", answer: "م ي ه و ك" },
    { word: "كايدو", answer: "ك ا ي د و" },
    { word: "ناروتو", answer: "ن ا ر و ت و" },
    { word: "ساسكي", answer: "س ا س ك ي" },
    { word: "إيتاشي", answer: "إ ي ت ا ش ي" },
    { word: "كاكاشي", answer: "ك ا ك ا ش ي" },
    { word: "مادارا", answer: "م ا د ا ر ا" },
    { word: "جيرايا", answer: "ج ي ر ا ي ا" },
    { word: "غوجو", answer: "غ و ج و" },
    { word: "سوكونا", answer: "س و ك و ن ا" },
    { word: "توجي", answer: "ت و ج ي" },
    { word: "يوجي", answer: "ي و ج ي" },
    { word: "ميجومي", answer: "م ي ج و م ي" },
    { word: "إيرين", answer: "إ ي ر ي ن" },
    { word: "ليفاي", answer: "ل ي ف ا ي" },
    { word: "ميكاسا", answer: "م ي ك ا س ا" },
    { word: "ارمين", answer: "ا ر م ي ن" },
    { word: "أروين", answer: "أ ر و ي ن" },
    { word: "غوكو", answer: "غ و ك و" },
    { word: "فيجيتا", answer: "ف ي ج ي ت ا" },
    { word: "فريزا", answer: "ف ر ي ز ا" },
    { word: "برولي", answer: "ب ر و ل ي" },
    { word: "تانجيرو", answer: "ت ا ن ج ي ر و" },
    { word: "نيزوكو", answer: "ن ي ز و ك و" },
    { word: "زينيتسو", answer: "ز ي ن ي ت س و" },
    { word: "اينوسكي", answer: "ا ي ن و س ك ي" },
    { word: "موزان", answer: "م و ز ا ن" },
    { word: "رينغوكو", answer: "ر ي ن غ و ك و" },
    { word: "غون", answer: "غ و ن" },
    { word: "كيلوا", answer: "ك ي ل و ا" },
    { word: "هيسوكا", answer: "ه ي س و ك ا" },
    { word: "كورابيكا", answer: "ك و ر ا ب ي ك ا" },
    { word: "ميرويم", answer: "م ي ر و ي م" },
    { word: "نيتيرو", answer: "ن ي ت ي ر و" },
    { word: "أيزن", answer: "أ ي ز ن" },
    { word: "إيتشيغو", answer: "إ ي ت ش ي غ و" },
    { word: "بياكويا", answer: "ب ي ا ك و ي ا" },
    { word: "كينباتشي", answer: "ك ي ن ب ا ت ش ي" },
    { word: "أولكيورا", answer: "أ و ل ك ي و ر ا" }
];

// دالة مخصصة لجلب سؤال جديد وعرضه بشكل فخم ومنسق
async function sendBreakQuestion(m, conn, chatId) {
    const game = global.breakGame.games[chatId];
    if (!game) return;

    game.round++;
    if (game.round > MAX_ROUNDS) {
        return finishBreakGame(m, conn, chatId);
    }

    // اختيار كلمة عشوائية من القاعدة المحلية المضمونة
    const q = LOCAL_WORDS_DATABASE[Math.floor(Math.random() * LOCAL_WORDS_DATABASE.length)];
    
    game.question = q.word; 
    game.answer = q.answer.trim();

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
        text: `🏁 *النتائج 👇🏻  - نهاية تحدي التفكيك* 🏆\n\n${leaderboard}\n\n🏅 *عاش يا ابطال السرعة والتركيز! الصدارة انهارده من نصيب @${winner.split('@')[0]} إيدك طلقة متمكن!* 🪄🔥`,
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
        timeout: null,
        msgId: null
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

    const userInput = m.text.trim();

    // 1. التحقق من الإجابة الصحيحة بالملّي
    if (userInput === game.answer) {
        if (!scores[player]) scores[player] = { correct: 0, wrong: 0 };
        
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
            replyMsg += `🏁 *دي كانت الجولة الأخيرة في التحدي! النتائج 👇🏻...*`;
            await conn.sendMessage(chatId, { text: replyMsg, mentions: [player] }, { quoted: m });
            setTimeout(() => finishBreakGame(m, conn, chatId), 2000);
        }
        return true;
    } 
    
    // 2. فحص ذكي جداً للإجابات القريبة: يشتغل فقط لو الإجابة متفرقة وبنفس الطول التقريبي للإجابة الصح (لمنع التداخل مع السوالف العادية)
    else if (userInput.includes(' ') && userInput.length >= game.answer.length - 2 && userInput.length <= game.answer.length + 2 && !userInput.startsWith('.')) {
        if (!scores[player]) scores[player] = { correct: 0, wrong: 0 };
        
        scores[player].wrong += 1;
        await conn.sendMessage(chatId, { react: { text: "🤦🏻", key: m.key } });
        
        const breakRoasts = [
            "❌ *التفكيك غلط خالص!* ركز في الحروف ايدك سابقاك في الكتابة! 😂🔥",
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
