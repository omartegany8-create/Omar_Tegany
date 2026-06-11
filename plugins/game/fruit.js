/*
code: premium animal guessing game (بدون زخارف - نظام تفاعل بشري ذكي)
by: 𝐓𝐨جي & Gemini
*/

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
    { emoji: "🐍", names: ["ثعبان", "تعبان"] },
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
    { emoji: "🦈", names: ["قرش", "سمكة قرش"] },
    { emoji: "🐳", names: ["حوت"] },
    { emoji: "🐟", names: ["سمكة", "سمكه", "سمك"] },
    { emoji: "🦞", names: ["إستاكوزا", "استاكوزا", "جراد البحر"] },
    { emoji: "🐜", names: ["نملة", "نمله"] },
    { emoji: "🦋", names: ["فراشة", "فراشه"] }
];

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
                    text: `⏰ *انتهى الوقت ومحدش لحق يجاوب!*\n\nالحيوان المطلوب كان: *${correctAns}* ${item.emoji}\n\nنجهز الجولة اللي بعدها حالا صحصحوا معايا..` 
                });
                
                if (round < MAX_ROUNDS) {
                    setTimeout(() => runAnimalGame(m, conn, round + 1), 2500);
                } else {
                    endAnimalGame(m, conn);
                }
            }
        }, 30000)
    };

    const caption = `📌 *تحدي تخمين الحيوانات والطيور* 🐾\n\n*البيانات الحالية للجولة:*\n• الجولة الحالية: [ *${round} من ${MAX_ROUNDS}* ]\n• الوقت المتاح: [ *30 ثانية* ]\n\n👀 *أسرع واحد يلقط اسم صاحب الإيموجي ده:* \n\n👉🏻  *${item.emoji}* 👈🏻\n\n_اكتب الاسم في الشات عشان النقطة تتحسبلك!_`;
    
    const msg = await conn.sendMessage(chatId, { text: caption });
    g.current.id = msg.key.id;
}

async function endAnimalGame(m, conn) {
    const chatId = m.chat;
    const g = global.gameAnimal[chatId];
    if (!g) return;
    
    const entries = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
        await conn.sendMessage(chatId, { text: `🏁 *انتهت الـ ${MAX_ROUNDS} جولات كاملة!*\n\nبس للأسف محدش فيكم جمع ولا نقطة.. الجروب كله نايم في العسل انهارده مفيش جوائز! 🦦` });
        delete global.gameAnimal[chatId];
        return;
    }

    const prizesList = [];
    const mentions = [];
    for (let i = 0; i < entries.length; i++) {
        const [id, score] = entries[i];
        const prize = getAnimalPrize(i);
        mentions.push(id);

        if (global.db?.users[id]) {
            global.db.users[id].xp = (global.db.users[id].xp || 0) + prize.xp;
            global.db.users[id].cookies = (global.db.users[id].cookies || 0) + prize.cookies;
        }
        prizesList.push(`${prize.emoji} *المركز ${i + 1}:* @${id.split('@')[0]}\n• الجولات الصحيحة: [ *${score} جولات* ]\n• المكافأة المضافة: [ *+${prize.xp} XP* | *🍪 +${prize.cookies} كوكيز* ]`);
    }

    const winner = entries[0][0];

    await conn.sendMessage(chatId, {
        text: `🏁 *لوحة نتائج الأبطال - نهاية تحدي الحيوانات* 🏆\n\n${prizesList.join('\n\n')}\n\n🏅 *عاش عليكم والله 🤍🔥! مبروك الصدارة يا @${winner.split('@')[0]} إيدك طلقة كالعادة!* 😉🔥`,
        mentions
    });
    
    delete global.gameAnimal[chatId];
}

async function handler(m, { conn, text, command }) {
    if (!global.gameAnimal) global.gameAnimal = {};
    const chatId = m.chat;
    
    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];

    if (cmd === 'حذف' || cmd === 'انهاء' || cmd === 'delete') {
        if (!global.gameAnimal[chatId]) return m.reply("❌ مفيش جولة حيوانات نشطة حالياً عشان أقفلها!");
        if (global.gameAnimal[chatId].current?.timer) clearTimeout(global.gameAnimal[chatId].current.timer);
        delete global.gameAnimal[chatId];
        return m.reply("🗑️ *تم إنهاء وإغلاق تحدي الحيوانات.*");
    }

    if (global.gameAnimal[chatId]) return m.reply(`⚠️ في جولة حيوانات شغالة حالياً في الجروب!\n\nاكتب *.${command} حذف* لو حابب تقفلها وتبدأ من الاول.`);

    await conn.sendMessage(chatId, { react: { text: "🐼", key: m.key } });

    global.gameAnimal[chatId] = { round: 0, scores: {}, current: null };
    
    await m.reply(`🐾 *تحدي الذاكرة والسرعة بدأ!*\n\nالتحدي مكون من *10 جولات متتالية*، ركزوا في الإيموجي واكتبوا الإجابة بسرعة عشان تاخدو النقط والـ XP..\n\nالجولة الأولى نازلة في الشات حالا... 🔥🚀`);
    
    setTimeout(() => runAnimalGame(m, conn, 1), 2000);
}

handler.before = async (m, { conn }) => {
    const chatId =.chat;
    const g = global.gameAnimal?.[chatId];
    if (!g?.current || !m.text) return false;

    const cur = g.current;
    const answer = m.text.trim().toLowerCase();

    if (cur.answer.includes(answer)) {
        clearTimeout(cur.timer);
        g.current = null;

        g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;

        await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

        let captionText = `🎉 *لقطة أسطورية وسريعة جداً!*\n\nعاش يا @${m.sender.split('@')[0]} الإجابة صحيحة وهي فعلاً (*${answer}*) ${cur.emoji}\n🎯 مجموع نقاطك حالياً: [ *${g.scores[m.sender]} نقطة* ]\n\n`;

        const nextRound = cur.round + 1;
        if (nextRound <= MAX_ROUNDS) {
            captionText += `⏳ *استعدوا.. الجولة رقم (${nextRound} / 10) نازلة حالا في الشات...*`;
            await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => runAnimalGame(m, conn, nextRound), 3000);
        } else {
            captionText += `🏁 *دي كانت الجولة الأخيرة في التحدي! ثواني وبحسب لكم كشف حساب الجوائز والترتيب...*`;
            await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => endAnimalGame(m, conn), 2000);
        }
        return true;
    } 
    
    else if (cur.allNames.includes(answer) && !answer.startsWith('.')) {
        await conn.sendMessage(m.chat, { react: { text: "🙂", key: m.key } });
        
        const animalRoasts = [
            "❌ *لأ غلط * انت فطرت انهاردة ؟ ركز في تفاصيل الإيموجي! 😂🔥",
            "❌ *مش هو خالص!* ركز كدا وصحصح، ايدك سبقت عقلك في الكتابة! حاول تاني 🧐",
            "❌ *إجابة بعيدة خالص!* ركزوا يا شباب مالكم انهارده مش مظبوطين كدا ليه؟"
        ];
        const randomRoast = animalRoasts[Math.floor(Math.random() * animalRoasts.length)];
        await m.reply(randomRoast);
        return true;
    }
    return false;
};

handler.usage = ["حيوان"];
handler.category = "games";
handler.command = ['حيوان', 'حيوانات', 'حيواان'];
export default handler;
