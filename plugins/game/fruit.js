/*
code: premium fruit guessing game (بدون زخارف - نظام تفاعل بشري ذكي)
by: 𝐓𝐨جي & Gemini
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
    { emoji: "🍅", names: ["طماطم", "قوطة", "بندورة"] },
    { emoji: "🧅", names: ["بصل"] },
    { emoji: "🥔", names: ["بطاطس", "بطاطا"] },
    { emoji: "🧄", names: ["ثوم", "توم"] },
    { emoji: "🥒", names: ["خيار", "خيارة"] }
];

const getFruitPrize = (rank) => {
    if (rank === 0) return { xp: 350, cookies: 7, emoji: "🏆" };
    if (rank === 1) return { xp: 200, cookies: 4, emoji: "🥈" };
    return { xp: 80, cookies: 1, emoji: "⭐" };
};

async function runFruitGame(m, conn, round) {
    const chatId = m.chat;
    const g = global.gameFruit[chatId];
    if (!g) return;

    const item = fruitsData[Math.floor(Math.random() * fruitsData.length)];
    const allFruitNames = fruitsData.flatMap(f => f.names);

    g.current = {
        answer: item.names,
        allNames: allFruitNames,
        round: round,
        emoji: item.emoji,
        timer: setTimeout(async () => {
            if (global.gameFruit?.[chatId]?.current?.round === round) {
                const correctAns = global.gameFruit[chatId].current.answer[0];
                global.gameFruit[chatId].current = null;
                
                await conn.sendMessage(chatId, { 
                    text: `⏰ *انتهى الوقت ومحدش عرفها في الـ 30 ثانية!*\n\nالفاكهة/الخضار كان: *${correctAns}* ${item.emoji}\n\nنستعد عشان الجولة الجاية نازلة حالا..` 
                });
                
                if (round < MAX_ROUNDS) {
                    setTimeout(() => runFruitGame(m, conn, round + 1), 2500);
                } else {
                    endFruitGame(m, conn);
                }
            }
        }, 30000)
    };

    const caption = `📌 *تحدي تخمين الفواكه والخضروات* 🍓\n\n*البيانات الحالية للجولة:*\n• الجولة الحالية: [ *${round} من ${MAX_ROUNDS}* ]\n• الوقت المتاح: [ *30 ثانية* ]\n\n👀 *أسرع واحد يلقط اسم صاحب الإيموجي ده:* \n\n👉🏻  *${item.emoji}* 👈🏻\n\n_اكتب اسم الفاكهة أو الخضار فوراً في الشات بدون نقط وبأسرع سرعة عندك!_`;
    
    const msg = await conn.sendMessage(chatId, { text: caption });
    g.current.id = msg.key.id;
}

async function endFruitGame(m, conn) {
    const chatId = m.chat;
    const g = global.gameFruit[chatId];
    if (!g) return;
    
    const entries = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
        await conn.sendMessage(chatId, { text: `🏁 *انتهت الـ ${MAX_ROUNDS} جولات كاملة!*\n\nومفيش أي حد كسب نقطة واحدة.. الجروب نايم في سوق الخضار باين انهارده! 🦦` });
        delete global.gameFruit[chatId];
        return;
    }

    const prizesList = [];
    const mentions = [];
    for (let i = 0; i < entries.length; i++) {
        const [id, score] = entries[i];
        const prize = getFruitPrize(i);
        mentions.push(id);

        if (global.db?.users[id]) {
            global.db.users[id].xp = (global.db.users[id].xp || 0) + prize.xp;
            global.db.users[id].cookies = (global.db.users[id].cookies || 0) + prize.cookies;
        }
        prizesList.push(`${prize.emoji} *المركز ${i + 1}:* @${id.split('@')[0]}\n• الجولات الصحيحة: [ *${score} جولات* ]\n• المكافأة المضافة: [ *+${prize.xp} XP* | *🍪 +${prize.cookies} كوكيز* ]`);
    }

    const winner = entries[0][0];

    await conn.sendMessage(chatId, {
        text: `🏁 *لوحة النتائج - نهاية تحدي الفواكه* 🏆\n\n${prizesList.join('\n\n')}\n\n🏅 *مبروك الفوز الساحق والصدارة يا @${winner.split('@')[0]}.. كتبتها طلقة وعرّقت الجروب وراك!* 😉🔥`,
        mentions
    });
    
    delete global.gameFruit[chatId];
}

async function handler(m, { conn, text, command }) {
    if (!global.gameFruit) global.gameFruit = {};
    const chatId = m.chat;
    
    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];

    if (cmd === 'حذف' || cmd === 'انهاء' || cmd === 'delete') {
        if (!global.gameFruit[chatId]) return m.reply("❌ مفيش جولة فواكه نشطة حالياً عشان أقفلها يسطا!");
        if (global.gameFruit[chatId].current?.timer) clearTimeout(global.gameFruit[chatId].current.timer);
        delete global.gameFruit[chatId];
        return m.reply("🗑 *تم إنهاء وإغلاق لعبة الفواكه.*");
    }

    if (global.gameFruit[chatId]) return m.reply(`⚠️ في جولة فواكه شغالة حالياً في الجروب!\n\nاكتب *.${command} حذف* لو حابب تقفلها وتبدأ من جديد.`);

    await conn.sendMessage(chatId, { react: { text: "🍓", key: m.key } });

    global.gameFruit[chatId] = { round: 0, scores: {}, current: null };
    
    await m.reply(`🍏 *تحدي الفواكه والخضروات الفخم بدأ!*\n\nالتحدي مكون من *10 جولات متتالية*، ركزوا في الإيموجي اللي هيظهر واكتبوا اسمه بسرعة في الشات عشان تجمعوا الجوائز..\n\nالجولة الأولى 👇🏻... 🔥🚀`);
    
    setTimeout(() => runFruitGame(m, conn, 1), 2000);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const g = global.gameFruit?.[chatId];
    if (!g?.current || !m.text) return false;

    const cur = g.current;
    const answer = m.text.trim().toLowerCase();

    if (cur.answer.includes(answer)) {
        clearTimeout(cur.timer);
        g.current = null;

        g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;

        await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

        let captionText = `🎉 *سرعة ممتازة وجبتها صح!*\n\nأحسنت يا @${m.sender.split('@')[0]} الإجابة فعلاً هي (*${answer}*) ${cur.emoji}\n🎯 مجموع نقاطك حالياً: [ *${g.scores[m.sender]} نقطة* ]\n\n`;

        const nextRound = cur.round + 1;
        if (nextRound <= MAX_ROUNDS) {
            captionText += `⏳ *استعدوا.. الجولة رقم (${nextRound} / 10) نازلة حالا في الشات...*`;
            await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => runFruitGame(m, conn, nextRound), 3000);
        } else {
            captionText += `🏁 *دي كانت الجولة الأخيرة في التحدي! ثواني وبطلع لوحة الشرف والترتيب النهائي...*`;
            await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => endFruitGame(m, conn), 2000);
        }
        return true;
    } 
    
    else if (cur.allNames.includes(answer) && !answer.startsWith('.')) {
        await conn.sendMessage(m.chat, { react: { text: "🧐", key: m.key } });
        
        const fruitRoasts = [
            "❌ *لأ غلط!* ركز في شكل الإيموجي ده حاجة تانية خالص! حاول تاني بسرعة 😂🔥",
            "❌ *إجابة بريئة من سوق الخضار تماماً!* ركز كدا وصحصح بلاش كسل 😂",
            "❌ *مش هو!* فكر كويس قبل ما تبعت، الشات هيطير منك!"
        ];
        const randomRoast = fruitRoasts[Math.floor(Math.random() * fruitRoasts.length)];
        await m.reply(randomRoast);
        return true;
    }
    return false;
};

handler.usage = ["فاكهة"];
handler.category = "games";
handler.command = ['فاكهة', 'فاكه', 'فواكة'];
export default handler;
