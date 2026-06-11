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
    { emoji: "Pineapple", names: ["أناناس", "اناناس"] },
    { emoji: "🍊", names: ["برتقال", "برتقاله", "يوسفي", "سفندي"] },
    { emoji: "🍋", names: ["ليمون", "لمون"] },
    { emoji: "Peach", names: ["خوخ"] },
    { emoji: "Pear", names: ["كمثرى", "كمتري", "جوافة", "جوافه"] },
    { emoji: "🍈", names: ["شمام", "كانتالوب"] },
    { emoji: "Kiwi", names: ["كيوي"] },
    { emoji: "Coconut", names: ["جوز الهند", "جوز هند"] },
    { emoji: "Avocado", names: ["أفوكادو", "افوكادو"] },
    { emoji: "🌶️", names: ["فلفل", "فلفل حار", "شطة", "شطه"] },
    { emoji: "🌽", names: ["ذرة", "ذره", "ذرة صفراء"] },
    { emoji: "Carrot", names: ["جزر", "جزرة"] },
    { emoji: "🍅", names: ["طماطم", "قوطة", "بندورة"] },
    { emoji: "🧅", names: ["بصل"] },
    { emoji: "🥔", names: ["بطاطس", "بطاطا"] },
    { emoji: "🧄", names: ["ثوم", "توم"] },
    { emoji: "🥒", names: ["خيار", "خيارة"] }
];

// دالة توزيع الجوائز المالية بالتفصيل للأبطال
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
    
    // حفظ الإيموجيات المتاحة في الجولة الحالية عشان دالة الفحص تعرف لو العضو بيخمن غلط
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
                    text: `⏰ *انتهى الوقت ومحدش عرفها!* \nالفاكهة/الخضار كان: ✨ *${correctAns}* ${item.emoji}✨\n\n⏳ _استعدوا للجولة اللي بعدها هتبدأ حالا..._` 
                });
                
                if (round < MAX_ROUNDS) {
                    setTimeout(() => runFruitGame(m, conn, round + 1), 2500);
                } else {
                    endFruitGame(m, conn);
                }
            }
        }, 30000)
    };

    const caption = `🍓 *لعبة تخمين الفواكة* 🍏\n\nجولة رقم: [ *${round} من ${MAX_ROUNDS}* ] 🎲\n────────────────\n\n🤔 *أسرع واحد يلقط ويقولي اسم الفاكهة أو الخضار ده إيه؟*\n\n👉🏻    *${item.emoji}* 👈🏻\n\n────────────────\n> 💡 _*اكتب الاسم فوراً بالشات عشان تلقط النقطة!*_ \n⏱️ _معاك 30 ثانية والتحدي يتقفل!_`;
    
    const msg = await conn.sendMessage(chatId, { text: caption });
    g.current.id = msg.key.id;
}

async function endFruitGame(m, conn) {
    const chatId = m.chat;
    const g = global.gameFruit[chatId];
    if (!g) return;
    
    const entries = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
        await conn.sendMessage(chatId, { text: "🏁 *انتهت اللعبة ومحدش جمع نقطة واحدة! الجروب نايم في سوق الخضار باين..* 🦦" });
        delete global.gameFruit[chatId];
        return;
    }

    const prizesList = [];
    for (let i = 0; i < entries.length; i++) {
        const [id, score] = entries[i];
        const prize = getFruitPrize(i);

        if (global.db?.users[id]) {
            global.db.users[id].xp = (global.db.users[id].xp || 0) + prize.xp;
            global.db.users[id].cookies = (global.db.users[id].cookies || 0) + prize.cookies;
        }
        prizesList.push(`${prize.emoji} *المركز ${i + 1}:* @${id.split('@')[0]}\n   🎯 تجميع صح: *${score} جولات* | 🎁 جوائز: *+${prize.xp} XP* & *🍪 +${prize.cookies} كوكيز*\n────────────────`);
    }

    const winner = entries[0][0];

    await conn.sendMessage(chatId, {
        text: `🏁 *انتهت الـ ${MAX_ROUNDS} جولات كاملة من تحدي الفواكه!* 🏆\n\nثواني وبحسب لكم النتائج.. 👇\n\n────────────────\n${prizesList.join('\n')}\n🏅 كفو يا وحوش ع السرعة! 😉🔥`,
        mentions: entries.map(([id]) => id)
    });
    
    delete global.gameFruit[chatId];
}

async function handler(m, { conn, text, command }) {
    if (!global.gameFruit) global.gameFruit = {};
    const chatId = m.chat;
    
    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];

    // ميزة الحذف والإلغاء الفوري للعبة الفواكه (.فاكهة حذف)
    if (cmd === 'حذف' || cmd === 'انهاء' || cmd === 'delete') {
        if (!global.gameFruit[chatId]) return m.reply("❌ مفيش لعبة فواكه شغال حالياً عشان أحذفها يسطا!");
        if (global.gameFruit[chatId].current?.timer) clearTimeout(global.gameFruit[chatId].current.timer);
        delete global.gameFruit[chatId];
        return m.reply("🗑️ *أبشر! تم إلغاء وحذف لعبة الفواكه .*");
    }

    if (global.gameFruit[chatId]) return m.reply(`⚠️ يسطا في جولة فواكه شغالة حالياً!\nاكتب 👈🏻 *.${command} حذف* لو عايز تقفل الجولة وتبدأ من جديد.`);

    // ريأكت بدء اللعبة المبهج بالفراولة
    await conn.sendMessage(m.chat, { react: { text: "🍓", key: m.key } });

    global.gameFruit[chatId] = { round: 0, scores: {}, current: null };
    
    await m.reply(`🍏 *مستعدين ؟ تحدي الفواكه بدأ!* 🍉\nاللعبة من *10 جولات*.. ركز في الإيموجي اللي هيظهر واكتب اسمه بسرعة قبل أي حد!\n\nالجولة الأولى هتبدأ دلوقتي ... 🚀🔥`);
    
    setTimeout(() => runFruitGame(m, conn, 1), 2000);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const g = global.gameFruit?.[chatId];
    if (!g?.current || !m.text) return false;

    const cur = g.current;
    const answer = m.text.trim().toLowerCase();

    // حالة الإجابة الصحيحة بالملّي
    if (cur.answer.includes(answer)) {
        clearTimeout(cur.timer);
        g.current = null;

        g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;

        await conn.sendMessage(m.chat, { react: { text: "🎉", key: m.key } });

        let captionText = `🎉 *جبتها صح ! لقطتها وهي طايرة* ⚡\n\nأحسنت يا @${m.sender.split('@')[0]} الإجابة فعلاً هي (*${answer}*) ${cur.emoji}\n⚔️ سكورك الحالي بقا: [ *${g.scores[m.sender]} نقطة* ] 🎯\n\n`;

        const nextRound = cur.round + 1;
        if (nextRound <= MAX_ROUNDS) {
            captionText += `⏳ *استعدوا.. الجولة القادمة رقم (${nextRound} / 10) هتبدأ حالا...*`;
            await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => runFruitGame(m, conn, nextRound), 3000);
        } else {
            captionText += `🏁 *دي كانت الجولة الأخيرة في التحدي! ثواني وبحسبلكم النتائج...*`;
            await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => endFruitGame(m, conn), 2000);
        }
        return true;
    } 
    
    // حالة الإجابة الخاطئة (لو كتب اسم فاكهة تانية غلط ومش أمر بوت)
    else if (cur.allNames.includes(answer) && !answer.startsWith('.')) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        await m.reply("❌ *لأ غلط!* ركز في الإيموجي كويس شكله شبه حاجة تانية! حاول تاني بسرعة 🤫🔥");
        return true;
    }
    return false;
};

handler.usage = ["فاكهة"];
handler.category = "games";
handler.command = ['فاكهة', 'فاكه', 'فواكة'];
export default handler;
