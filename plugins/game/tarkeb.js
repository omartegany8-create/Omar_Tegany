// تغيير اسم الفانكشن لـ arrangeHandler لمنع التضارب نهائياً
async function arrangeHandler(m, { conn }) {
    if (!global.arrangeGame) global.arrangeGame = { games: {}, scores: {} };

    if (global.arrangeGame.games[m.chat]) {
        clearTimeout(global.arrangeGame.games[m.chat].timeout);
        delete global.arrangeGame.games[m.chat];
    }

    // جلب قائمة الكلمات من رابط JSON أونلاين
    const data = await (await fetch("https://raw.githubusercontent.com/Xov445447533/Xov11111/master/src/JSON/venom-تفكيك.json")).json();
    const q = data[Math.floor(Math.random() * data.length)];
    
    // البوت هيعرض الكلمة كاملة وصحيحة والمطلوب كتابتها بسرعة
    m.reply(`
╭─┈─┈─┈─⟞🧩⟝─┈─┈─┈─╮
┃ *⌯︙ ${q.response}*
╰─┈─┈─┈─⟞⚙️⟝─┈─┈─┈─╯
> _*اكتب الكلمة السابقة بسرعة وبنفس الحروف لتكسب نقطة! معاك ٣٠ ثانية قبل انتهاء الجولة*_`);
    
    if (!global.arrangeGame.scores[m.chat]) global.arrangeGame.scores[m.chat] = {};
    
    global.arrangeGame.games[m.chat] = {
        answer: q.response, // الإجابة هي نفس الكلمة المعروضة
        timeout: setTimeout(() => {
            if (global.arrangeGame.games[m.chat]) {
                delete global.arrangeGame.games[m.chat];
                delete global.arrangeGame.scores[m.chat];
                m.reply("`⏰: انتهى الوقت`");
            }
        }, 30000)
    };
}

arrangeHandler.before = async (m, { conn }) => {
    if (!m.text || !global.arrangeGame?.games[m.chat] || !global.arrangeGame?.scores[m.chat]) return;

    const game = global.arrangeGame.games[m.chat];
    const player = m.sender;
    
    // التحقق من الإجابة (تطابق الكلمة بالملّي)
    if (m.text.trim() !== game.answer) return;

    clearTimeout(game.timeout);
    delete global.arrangeGame.games[m.chat];

    if (!global.arrangeGame.scores[m.chat][player]) global.arrangeGame.scores[m.chat][player] = 0;
    global.arrangeGame.scores[m.chat][player]++;
    
    let total = 0;
    for (let id in global.arrangeGame.scores[m.chat]) {
        total += global.arrangeGame.scores[m.chat][id];
    }
    
    // إذا وصل إجمالي النقاط في الجروب لـ 20، تنتهي اللعبة ويعلن الفائز
    if (total >= 20) {
        const entries = Object.entries(global.arrangeGame.scores[m.chat])
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
            text: `🏆 *الفائزون في لـعـبـة الـتـركـيـب*\n\n${sorted.join('\n')}\n\n🏅 @${winner.split('@')[0]} حصل على +500 XP و 🍪 +10 كوكيز`,
            mentions
        });
        delete global.arrangeGame.scores[m.chat];
        return;
    }

    await m.reply(`✅ احسنت معاك: ${global.arrangeGame.scores[m.chat][player]} نقطه`);
    arrangeHandler(m, { conn }); // استدعاء نفس الفانكشن الخاصة بالتركيب
};

arrangeHandler.usage = ["تركيب"];
arrangeHandler.category = "games";
arrangeHandler.command = ['تركيب', 'دمج'];
export default arrangeHandler;
