/*
code: game break
by: 𝐓𝐨𝐣𝐢 & Gemini
*/

const LINE_SEPARATOR = "❉═━═━═━ ◦ • ⊰🍂⊱ • ◦ ━═━═━═❉";

async function breakHandler(m, { conn, text, command }) {
    if (!global.breakGame) global.breakGame = { games: {}, scores: {} };

    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];

    // ميزة الحذف لمنع التكرار والبدء من جديد
    if (cmd === 'حذف' || cmd === 'delete') {
        if (!global.breakGame.games[m.chat]) return m.reply("❌ لا توجد لعبة تفكيك نشطة لإلغائها حالياً!");
        if (global.breakGame.games[m.chat].timeout) clearTimeout(global.breakGame.games[m.chat].timeout);
        delete global.breakGame.games[m.chat];
        return m.reply("🗑️ تم إلغاء وحذف لعبة التفكيك بنجاح! يمكنك البدء من جديد الآن.");
    }

    if (global.breakGame.games[m.chat]) {
        return m.reply(`❌ هناك جولة قائمة بالفعل في هذا الجروب!\nاكتب *.${command} حذف* لإلغائها وبدء جولة جديدة.`);
    }

    // ريأكت بازل أيقونة التفكيك 🧩
    await conn.sendMessage(m.chat, { react: { text: "🧩", key: m.key } });

    const data = await (await fetch("https://raw.githubusercontent.com/Xov445447533/Xov11111/master/src/JSON/venom-تفكيك.json")).json();
    const q = data[Math.floor(Math.random() * data.length)];
    
    m.reply(`
╭─┈─┈─┈─⟞🔨⟝─┈─┈─┈─╮
┃ *⌯︙ ${q.question}*
╰─┈─┈─┈─⟞⚙️⟝─┈─┈─┈─╯
${LINE_SEPARATOR}
> _*اكتب الكلام بسرعه عشان تتحسبلك نقطه + بعد ٣٠ ثانيه لو مردتش اللعبه هتنتهي*_`);
    
    if (!global.breakGame.scores[m.chat]) global.breakGame.scores[m.chat] = {};
    
    global.breakGame.games[m.chat] = {
        answer: q.response,
        timeout: setTimeout(() => {
            if (global.breakGame.games[m.chat]) {
                delete global.breakGame.games[m.chat];
                delete global.breakGame.scores[m.chat];
                m.reply("`⏰: انتهى الوقت`");
            }
        }, 30000)
    };
}

breakHandler.before = async (m, { conn }) => {
    if (!m.text || !global.breakGame?.games[m.chat] || !global.breakGame?.scores[m.chat]) return;

    const game = global.breakGame.games[m.chat];
    const player = m.sender;
    
    if (m.text.trim() !== game.answer) return;

    clearTimeout(game.timeout);
    delete global.breakGame.games[m.chat];

    if (!global.breakGame.scores[m.chat][player]) global.breakGame.scores[m.chat][player] = 0;
    global.breakGame.scores[m.chat][player]++;
    
    // ريأكت نجمة الفوز 🌟 على رسالة العضو الصح
    await conn.sendMessage(m.chat, { react: { text: "🌟", key: m.key } });
    
    let total = 0;
    for (let id in global.breakGame.scores[m.chat]) {
        total += global.breakGame.scores[m.chat][id];
    }
    
    if (total >= 20) {
        const entries = Object.entries(global.breakGame.scores[m.chat])
            .sort((a, b) => b[1] - a[1]);
        
        const sorted = entries.map(([id, score], i) => 
            `${i+1}. @${id.split('@')[0]} - ${score} نقطة`
        );
        
        const mentions = entries.map(([id]) => id);
        const winner = entries[0][0];
        
        if (global.db?.users[winner]) {
            global.db.users[winner].xp = (global.db.users[winner].xp || 0) + 500;
            global.db.users[winner].cookies = (global.db.users[winner].cookies || 0) + 10;
        }
        
        await conn.sendMessage(m.chat, { 
            text: `🏆 *الفائزون في التفكيك*\n${LINE_SEPARATOR}\n\n${sorted.join('\n')}\n\n🏅 @${winner.split('@')[0]} حصل على +500 XP و 🍪 +10 كوكيز`,
            mentions
        });
        delete global.breakGame.scores[m.chat];
        return;
    }

    await conn.sendMessage(m.chat, {
        text: `✅ احسنت معاك: ${global.breakGame.scores[m.chat][player]} نقطه`
    }, { quoted: m });
    
    breakHandler(m, { conn, text: '', command: 'تفكيك' });
};

breakHandler.usage = ["تفكيك"];
breakHandler.category = "games";
breakHandler.command = ['تفكيك'];
export default breakHandler;
