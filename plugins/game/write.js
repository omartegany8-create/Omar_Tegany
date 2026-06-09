/*
code: game write
by: 𝐓𝐨𝐣𝐢 & Gemini
*/

const LINE_SEPARATOR = "❉═━═━═━ ◦ • ⊰🍂⊱ • ◦ ━═━═━═❉";

async function writeHandler(m, { conn, text, command }) {
    if (!global.writeGame) global.writeGame = { games: {}, scores: {} };

    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];

    // ميزة الحذف لمنع التكرار والبدء من جديد
    if (cmd === 'حذف' || cmd === 'delete') {
        if (!global.writeGame.games[m.chat]) return m.reply("❌ لا توجد لعبة كتابة نشطة لإلغائها حالياً!");
        if (global.writeGame.games[m.chat].timeout) clearTimeout(global.writeGame.games[m.chat].timeout);
        delete global.writeGame.games[m.chat];
        return m.reply("🗑️ تم إلغاء وحذف لعبة الكتابة بنجاح! يمكنك البدء من جديد الآن.");
    }

    if (global.writeGame.games[m.chat]) {
        return m.reply(`❌ هناك جولة قائمة بالفعل في هذا الجروب!\nاكتب *.${command} حذف* لإلغائها وبدء جولة جديدة.`);
    }

    // ريأكت قلم الرصاص عند طلب اللعبة ✏️
    await conn.sendMessage(m.chat, { react: { text: "✏️", key: m.key } });

    const wordsList = [
        "سكونا", "غوجو", "لوفي", "ميرو", "ناروتو", "إيتاتشي", "أيزن", "شيبويا", 
        "ل", "لاو", "توجي", "كارولين", "فريزا", "غوكو" ,"يوجي", "ميغومي", "نوبارا", "جوجتسو", "كاكاشي", "زورو", "كوروساكي"
    ];
    
    const randomWord = wordsList[Math.floor(Math.random() * wordsList.length)];
    
    m.reply(`
╭─┈─┈─┈─⟞✍️⟝─┈─┈─┈─╮
┃ *⌯︙ ${randomWord}*
╰─┈─┈─┈─⟞⚙️⟝─┈─┈─┈─╯
${LINE_SEPARATOR}
> _*أسرع واحد يكتب الكلمة السابقة بشكل صحيح يكسب نقطة! ⏱️ 30 ثانية*_`);
    
    if (!global.writeGame.scores[m.chat]) global.writeGame.scores[m.chat] = {};
    
    global.writeGame.games[m.chat] = {
        answer: randomWord,
        timeout: setTimeout(() => {
            if (global.writeGame.games[m.chat]) {
                delete global.writeGame.games[m.chat];
                delete global.writeGame.scores[m.chat];
                m.reply("`⏰: انتهى الوقت`");
            }
        }, 30000)
    };
}

writeHandler.before = async (m, { conn }) => {
    if (!m.text || !global.writeGame?.games[m.chat] || !global.writeGame?.scores[m.chat]) return;

    const game = global.writeGame.games[m.chat];
    const player = m.sender;
    
    if (m.text.trim() !== game.answer) return;

    clearTimeout(game.timeout);
    delete global.writeGame.games[m.chat];

    if (!global.writeGame.scores[m.chat][player]) global.writeGame.scores[m.chat][player] = 0;
    global.writeGame.scores[m.chat][player]++;
    
    // ريأكت فوز سريع برق ⚡ على رسالة العضو
    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

    let total = 0;
    for (let id in global.writeGame.scores[m.chat]) {
        total += global.writeGame.scores[m.chat][id];
    }
    
    if (total >= 20) {
        const entries = Object.entries(global.writeGame.scores[m.chat])
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
            text: `🏆 *الفائزون في لـعـبـة الـكـتـابـة*\n${LINE_SEPARATOR}\n\n${sorted.join('\n')}\n\n🏅 @${winner.split('@')[0]} حصل على +500 XP و 🍪 +10 كوكيز`,
            mentions
        });
        delete global.writeGame.scores[m.chat];
        return;
    }

    await conn.sendMessage(m.chat, {
        text: `✅ احسنت معاك: ${global.writeGame.scores[m.chat][player]} نقطه`
    }, { quoted: m });
    
    writeHandler(m, { conn, text: '', command: 'كتابه' });
};

writeHandler.usage = ["كتابه"];
writeHandler.category = "games";
writeHandler.command = ['كتابه', 'كتابة'];
export default writeHandler;
