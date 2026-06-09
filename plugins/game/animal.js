/*
code: game animals emoji
by:omar
*/

const MAX_ROUNDS = 10;

const animalsData = [
    { emoji: "🐈", names: ["قطة", "قطه", "بسة", "بس"] },
    { emoji: "🐕", names: ["كلب", "جرو"] },
    { emoji: "🦁", names: ["أسد", "اسد", "سبع"] },
    { emoji: "🐯", names: ["نمر"] },
    { emoji: "🐺", names: ["ذئب", "ذئب", "ديب"] },
    { emoji: "🐻", names: ["دب", "دب بني"] },
    { emoji: "🐻‍❄️", names: ["دب قطبي", "دب ابيض"] },
    { emoji: "🐨", names: ["كوالا"] },
    { emoji: "🐼", names: ["باندا"] },
    { emoji: "🐹", names: ["هامستر"] },
    { emoji: "🐭", names: ["فأر", "فأر", "فار"] },
    { emoji: "🐰", names: ["أرنب", "ارنب"] },
    { emoji: "🦊", names: ["ثعلب", "تعلب"] },
    { emoji: "🐗", names: ["خنزير بري", "حلوف"] },
    { emoji: "🐴", names: ["حصان", "خيل"] },
    { emoji: "🦎", names: ["سحلية", "سحليه"] },
    { emoji: "🦖", names: ["ديناصور", "داينصور"] },
    { emoji: "🐢", names: ["سلحفاة", "سلحفاه", "زحلفة"] },
    { emoji: "🐊", names: ["تمساح"] },
    { emoji: "🐍", names: ["ثعبان", "تعبان", "أفعى", "افعى", "حية"] },
    { emoji: "🐸", names: ["ضفدع", "ضفدعة", "ضفدعه"] },
    { emoji: "🐑", names: ["خروف", "نعجة", "كابش"] },
    { emoji: "🐐", names: ["ماعز", "معزة", "معزه", "جدي"] },
    { emoji: "🦌", names: ["غزال", "غزالة", "غزاله"] },
    { emoji: "🐄", names: ["بقرة", "بقره"] },
    { emoji: "🫏", names: ["حمار"] },
    { emoji: "🦍", names: ["غوريلا", "غورلا"] },
    { emoji: "🐒", names: ["قرد", "نسناس"] },
    { emoji: "🐫", names: ["جمل", "ناقة", "ناقه"] },
    { emoji: "Squirrel", names: ["سنجاب"] },
    { emoji: "🦝", names: ["راكون"] },
    { emoji: "🐦", names: ["عصفور", "طائر", "طير"] },
    { emoji: "🐥", names: ["كتكوت", "صوص"] },
    { emoji: "🦜", names: ["ببغاء", "بغبغان"] },
    { emoji: "🦆", names: ["بطة", "بطه"] },
    { emoji: "🦭", names: ["فقمة", "فقمة", "كلب البحر"] },
    { emoji: "🦈", names: ["قرش", "سمكة قرش"] },
    { emoji: "🐳", names: ["حوت"] },
    { emoji: "🐟", names: ["سمكة", "سمكه", "سمك"] },
    { emoji: "Lobster", names: ["إستاكوزا", "استاكوزا", "جراد البحر"] },
    { emoji: "🐜", names: ["نملة", "نمله"] },
    { emoji: "🦋", names: ["فراشة", "فراشه"] }
];

async function runAnimalGame(m, conn, round) {
    const chatId = m.chat;
    const g = global.gameAnimal[chatId];
    
    const item = animalsData[Math.floor(Math.random() * animalsData.length)];
    g.current = {
        answer: item.names,
        round: round,
        timer: setTimeout(async () => {
            if (global.gameAnimal?.[chatId]?.current?.round === round) {
                g.current = null;
                await conn.sendMessage(chatId, { text: `⏰ *انتهى الوقت!* لم يعرف أحد اسم الحيوان المقنع.\n\n⏳ _استعدوا للجولة القادمة..._` });
                
                if (round < MAX_ROUNDS) {
                    setTimeout(() => runAnimalGame(m, conn, round + 1), 2000);
                } else {
                    endAnimalGame(m, conn);
                }
            }
        }, 30000)
    };

    const msg = await conn.sendMessage(chatId, {
        text: `✨ *لعبة تخمين الحيوان 🐾 (جولة: ${round} / ${MAX_ROUNDS})*\n\nأسرع واحد يكتب اسم الحيوان صاحب هذا الإيموجي كسبان:\n👇👇\n👑  *${item.emoji}* 👑\n\n> _أمامك 30 ثانية للإجابة السليمة!_`
    });
    g.current.id = msg.key.id;
}

async function endAnimalGame(m, conn) {
    const chatId = m.chat;
    const g = global.gameAnimal[chatId];
    
    const entries = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
        await conn.sendMessage(chatId, { text: "🏁 *انتهت اللعبة!* ولم يشارك أحد في هذه الجولة." });
        delete global.gameAnimal[chatId];
        return;
    }

    const sorted = entries.map(([id, score], i) => `${i + 1}. @${id.split('@')[0]} ⌯︙ ${score} جولات`).join('\n');
    const mentions = entries.map(([id]) => id);
    const winner = entries[0][0];

    if (global.db?.users[winner]) {
        global.db.users[winner].xp = (global.db.users[winner].xp || 0) + 350;
        global.db.users[winner].cookies = (global.db.users[winner].cookies || 0) + 7;
    }

    await conn.sendMessage(chatId, {
        text: `🏆 *نتائج ملحمة تخمين الحيوانات كامله* 🐾\n\n${sorted}\n\n🏅 الفائز الأول بالمركز الأول المحترف: @${winner.split('@')[0]}\nحصل على: *+350 XP* & *🍪 +7 كوكيز* ⚡`,
        mentions
    });
    delete global.gameAnimal[chatId];
}

async function handler(m, { conn }) {
    if (!global.gameAnimal) global.gameAnimal = {};
    const chatId = m.chat;

    if (global.gameAnimal[chatId]) return m.reply("❌ هناك جولة حيوانات قائمة بالفعل في هذا الجروب!");

    global.gameAnimal[chatId] = { round: 0, scores: {}, current: null };
    
    // ريأكت بدء اللعبة الفخم
    await conn.sendMessage(m.chat, { react: { text: "🐾", key: m.key } });
    runAnimalGame(m, conn, 1);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const g = global.gameAnimal?.[chatId];
    if (!g?.current || !m.text) return false;

    const cur = g.current;
    const answer = m.text.trim().toLowerCase();

    // التأكد من تطابق الإجابة مع مصفوفة الأسماء
    if (!cur.answer.includes(answer)) return false;

    clearTimeout(cur.timer);
    g.current = null;

    g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;

    // ريأكت الاحتفال بالفوز في الجولة السريعة 🎉
    await conn.sendMessage(m.chat, { react: { text: "🎉", key: m.key } });

    let captionText = `🎉 *إجابة صحيحة ومذهلة!*\n\nعاش يا @${m.sender.split('@')[0]} لقطت اسم الحيوان صح 🏆\n⚔️ نقاطك الحالية: *${g.scores[m.sender]} نقطة*\n\n`;

    if (cur.round < MAX_ROUNDS) {
        captionText += `⏳ *استعدوا.. الجولة القادمة (${cur.round + 1} / 10) ستبدأ الآن!*`;
        await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
        setTimeout(() => runAnimalGame(m, conn, cur.round + 1), 3000);
    } else {
        captionText += `🏁 *انتهت الـ 10 جولات كاملة! تابعوا لوحة الشرف الثنائية الكبرى..*`;
        await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
        setTimeout(() => endAnimalGame(m, conn), 2000);
    }
    return true;
};

handler.usage = ["حيوان"];
handler.category = "games";
handler.command = ['حيوان', 'حيوانات'];
export default handler;
