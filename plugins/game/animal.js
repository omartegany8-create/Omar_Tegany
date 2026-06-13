
const MAX_ROUNDS = 10;

const animalsData = [
    { emoji: "🐈", names: ["قطة", "قطه", "بسة", "بس", "بسه"] },
    { emoji: "🐕", names: ["كلب", "جرو"] },
    { emoji: "🦁", names: ["أسد", "اسد", "سبع"] },
    { emoji: "🐯", names: ["نمر"] },
    { emoji: "🐺", names: ["ذئب", "ذئب", "ديب", "ذيب"] },
    { emoji: "🐻", names: ["دب", "دب بني"] },
    { emoji: "🐻‍❄️", names: ["دب قطبي", "دب ابيض"] },
    { emoji: "🐨", names: ["كوالا"] },
    { emoji: "🐼", names: ["باندا"] },
    { emoji: "🐹", names: ["هامستر"] },
    { emoji: "🐭", names: ["فأر", "فار"] },
    { emoji: "🐰", names: ["أرنب", "ارنب"] },
    { emoji: "🦊", names: ["ثعلب", "تعلب"] },
    { emoji: "🐗", names: ["خنزير بري", "حلوف"] },
    { emoji: "🐴", names: ["حصان", "خيل", "فرس"] },
    { emoji: "🦎", names: ["سحلية", "سحليه"] },
    { emoji: "🦖", names: ["ديناصور", "داينصور"] },
    { emoji: "🐢", names: ["سلحفاة", "سلحفاه", "زحلفة", "زحلفه"] },
    { emoji: "🐊", names: ["تمساح"] },
    { emoji: "🐍", names: ["ثعبان", "تعبان", "أفعى", "افعى", "حية", "حيه"] },
    { emoji: "🐸", names: ["ضفدع", "ضفدعة", "ضفدعه"] },
    { emoji: "🐑", names: ["خروف", "نعجة", "نعجه", "كبش"] },
    { emoji: "🐐", names: ["ماعز", "معزة", "معزه", "جدي"] },
    { emoji: "🦌", names: ["غزال", "غزالة", "غزاله"] },
    { emoji: "🐄", names: ["بقرة", "بقره"] },
    { emoji: "🫏", names: ["حمار"] },
    { emoji: "🦍", names: ["غوريلا", "غورلا"] },
    { emoji: "🐒", names: ["قرد", "نسناس"] },
    { emoji: "🐫", names: ["جمل", "ناقة", "ناقه"] },
    { emoji: "🐿️", names: ["سنجاب"] },
    { emoji: "🦝", names: ["راكون"] },
    { emoji: "🐦", names: ["عصفور", "طائر", "طير"] },
    { emoji: "🐥", names: ["كتكوت", "صوص"] },
    { emoji: "🦜", names: ["ببغاء", "بغبغان"] },
    { emoji: "🦆", names: ["بطة", "بطه"] },
    { emoji: "🦭", names: ["فقمة", "فقمه", "كلب البحر"] },
    { emoji: "🦈", names: ["قرش", "سمكة قرش", "سمكه قرش"] },
    { emoji: "🐳", names: ["حوت"] },
    { emoji: "🐟", names: ["سمكة", "سمكه", "سمك"] },
    { emoji: "🦞", names: ["إستاكوزا", "استاكوزا", "جراد البحر"] },
    { emoji: "🐜", names: ["نملة", "نمله"] },
    { emoji: "🦋", names: ["فراشة", "فراشه"] }
];

// دالة توزيع جوائز كشف الحساب النهائي للأبطال
const getAnimalPrize = (rank) => {
    if (rank === 0) return { xp: 350, cookies: 7, emoji: "🏆" };
    if (rank === 1) return { xp: 200, cookies: 4, emoji: "🥈" };
    return { xp: 80, cookies: 1, emoji: "⭐" };
};

async function runAnimalGame(m, conn, round) {
    const chatId = m.chat;
    const g = global.gameAnimal[chatId];
    if (!g) return;

    const item = animalsData[Math.floor(Math.random() * animalsData.length)];
    const allAnimalNames = animalsData.flatMap(a => a.names);

    g.current = {
        answer: item.names,
        allNames: allAnimalNames,
        round: round,
        emoji: item.emoji,
        timer: setTimeout(async () => {
            if (global.gameAnimal?.[chatId]?.current?.round === round) {
                const correctAns = global.gameAnimal[chatId].current.answer[0];
                global.gameAnimal[chatId].current = null;
                
                await conn.sendMessage(chatId, { 
                    text: `⏰ *انتهى الوقت ومحدش عرفه!* \nالحيوان/الحشرة كان: ✨ *${correctAns}* ${item.emoji}✨\n\n⏳ _استعدوا للجولة القادمة👇🏻 ..._` 
                });
                
                if (round < MAX_ROUNDS) {
                    setTimeout(() => runAnimalGame(m, conn, round + 1), 2500);
                } else {
                    endAnimalGame(m, conn);
                }
            }
        }, 30000)
    };

    const caption = `🐾 *لعبة تخمين الحيوانات والطيور 🐼* 🦁\n\nجولة رقم: [ *${round} من ${MAX_ROUNDS}* ] 🎲\n───────────────────\n\n🤔 *أسرع واحد يلقط ويقولي اسم صاحب الإيموجي ده إيه؟*\n\n👉🏻    *${item.emoji}* 👈🏻\n\n───────────────────\n> 💡 _*اكتب الاسم بالشات عشان تلقط النقطة!*_ \n⏱️ _معاك 30 ثانية والتحدي يقفل!_`;
    
    const msg = await conn.sendMessage(chatId, { text: caption });
    g.current.id = msg.key.id;
}

async function endAnimalGame(m, conn) {
    const chatId = m.chat;
    const g = global.gameAnimal[chatId];
    if (!g) return;
    
    const entries = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
        await conn.sendMessage(chatId, { text: "🏁 *انتهت اللعبة ومحدش جمع نقطة واحدة! الجروب نايم في العسل..* 🦦" });
        delete global.gameAnimal[chatId];
        return;
    }

    const prizesList = [];
    for (let i = 0; i < entries.length; i++) {
        const [id, score] = entries[i];
        const prize = getAnimalPrize(i);

        if (global.db?.users[id]) {
            global.db.users[id].xp = (global.db.users[id].xp || 0) + prize.xp;
            global.db.users[id].cookies = (global.db.users[id].cookies || 0) + prize.cookies;
        }
        prizesList.push(`${prize.emoji} *المركز ${i + 1}:* @${id.split('@')[0]}\n   🎯 تجميع صح: *${score} جولات* | 🎁 جوائز: *+${prize.xp} XP* & *🍪 +${prize.cookies} كوكيز*\n─────────────────────`);
    }

    await conn.sendMessage(chatId, {
        text: `🏁 *انتهت الـ ${MAX_ROUNDS} جولات كاملة من تحدي الحيوانات!* 🏆\n\nثواني وبحسبلكم نتائج الفائزين.. 👇\n\n─────────────────────\n${prizesList.join('\n')}\n🏅 مبروك عليكم الجوائز! كفو والله 👻🔥`,
        mentions: entries.map(([id]) => id)
    });
    
    delete global.gameAnimal[chatId];
}

async function handler(m, { conn, text, command }) {
    if (!global.gameAnimal) global.gameAnimal = {};
    const chatId = m.chat;
    
    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];

    // ميزة الحذف والإلغاء الفوري للعبة الحيوانات (.حيوان حذف)
    if (cmd === 'حذف' || cmd === 'انهاء' || cmd === 'delete') {
        if (!global.gameAnimal[chatId]) return m.reply("❌ مفيش لعبة حيوانات شغالة حالياً عشان أحذفها يسطا!");
        if (global.gameAnimal[chatId].current?.timer) clearTimeout(global.gameAnimal[chatId].current.timer);
        delete global.gameAnimal[chatId];
        return m.reply("🗑️ *أبشر! تم إلغاء وحذف تحدي الحيوانات.*");
    }

    if (global.gameAnimal[chatId]) return m.reply(`⚠️ يسطا في جولة حيوانات قائمة بالفعل وشغالة حالياً!\nاكتب 👈🏻 *.${command} حذف* لو عايز تقفل الجولة وتبدأ من جديد.`);

    // ريأكت بدء اللعبة المبهج 🐾
    await conn.sendMessage(m.chat, { react: { text: "🐼", key: m.key } });

    global.gameAnimal[chatId] = { round: 0, scores: {}, current: null };
    
    await m.reply(`🦁 *مستعدين👻🔥؟ تحدي الحيوانات السريع بدأ!* 🦅\nاللعبة من *10 جولات*.. ركز في الإيموجي واكتب اسمه قبل أي حد!\n\nالجولة الأولى 👇🏻... 🚀🔥`);
    
    setTimeout(() => runAnimalGame(m, conn, 1), 2000);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const g = global.gameAnimal?.[chatId];
    if (!g?.current || !m.text) return false;

    const cur = g.current;
    const answer = m.text.trim().toLowerCase();

    // حالة الإجابة الصحيحة بالملّي
    if (cur.answer.includes(answer)) {
        clearTimeout(cur.timer);
        g.current = null;

        g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;

        await conn.sendMessage(m.chat, { react: { text: "🎉", key: m.key } });

        let captionText = `🎉 *جبتها صح! عاش  * ⚡\n\nأحسنت يا @${m.sender.split('@')[0]} الإجابة فعلاً هي (*${answer}*) ${cur.emoji}\n⚔️ سكورك الحالي بقا: [ *${g.scores[m.sender]} نقطة* ] 🎯\n\n`;

        const nextRound = cur.round + 1;
        if (nextRound <= MAX_ROUNDS) {
            captionText += `⏳ *استعدوا.. الجولة القادمة رقم (${nextRound} / 10) نازلة حالا...*`;
            await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => runAnimalGame(m, conn, nextRound), 3000);
        } else {
            captionText += `🏁 *دي كانت الجولة الأخيرة في التحدي! النتائج 🔥👇🏻 ...*`;
            await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => endAnimalGame(m, conn), 2000);
        }
        return true;
    } 
    
    // حالة الإجابة الخاطئة (لو كتب اسم حيوان تاني غلط ومش أمر بوت)
    else if (cur.allNames.includes(answer) && !answer.startsWith('.')) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        await m.reply("❌ *لأ غلط!* ركز في شكل الإيموجي كويس ده فصيلته حاجة تانية خالص! حاول تاني بسرعة 🔥");
        return true;
    }
    return false;
};

handler.usage = ["حيوان"];
handler.category = "games";
handler.command = ['حيوان', 'حيوانات', 'حيواان'];
export default handler;
