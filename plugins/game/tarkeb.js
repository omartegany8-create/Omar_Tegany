/*
code: game arrange / tarkeb
by: 𝐓𝐨𝐣𝐢 & Gemini
*/

const LINE_SEPARATOR = "❉═━═━═━ ◦ • ⊰🍂⊱ • ◦ ━═━═━═❉";

async function arrangeHandler(m, { conn, text, command }) {
    if (!global.arrangeGame) global.arrangeGame = { games: {}, scores: {} };

    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];

    // ميزة الحذف لمنع التكرار والبدء من جديد
    if (cmd === 'حذف' || cmd === 'delete') {
        if (!global.arrangeGame.games[m.chat]) return m.reply("❌ لا توجد لعبة تركيب نشطة لإلغائها حالياً!");
        if (global.arrangeGame.games[m.chat].timeout) clearTimeout(global.arrangeGame.games[m.chat].timeout);
        delete global.arrangeGame.games[m.chat];
        return m.reply("🗑️ تم إلغاء وحذف لعبة التركيب بنجاح! يمكنك البدء من جديد الآن.");
    }

    if (global.arrangeGame.games[m.chat]) {
        return m.reply(`❌ هناك جولة قائمة بالفعل في هذا الجروب!\nاكتب *.${command} حذف* لإلغائها وبدء جولة جديدة.`);
    }

    // ريأكت بازل أيقونة التركيب 🧩 عند طلب الأمر
    await conn.sendMessage(m.chat, { react: { text: "🧩", key: m.key } });

    try {
        // جلب قائمة الكلمات
        const data = await (await fetch("https://raw.githubusercontent.com/Xov445447533/Xov11111/master/src/JSON/venom-تفكيك.json")).json();
        const q = data[Math.floor(Math.random() * data.length)];
        
        // هنا بنضمن إن الكلمة تتبعت نظيفة وصحيحة
        const targetWord = q.response.trim();

        m.reply(`
╭─┈─┈─┈─⟞🧩⟝─┈─┈─┈─╮
┃ *⌯︙ ${targetWord}*
╰─┈─┈─┈─⟞⚙️⟝─┈─┈─┈─╯
${LINE_SEPARATOR}
> _*اكتب الكلمة السابقة بسرعة وبنفس الحروف لتكسب نقطة! معاك ٣٠ ثانية قبل انتهاء الجولة*_`);
        
        if (!global.arrangeGame.scores[m.chat]) global.arrangeGame.scores[m.chat] = {};
        
        global.arrangeGame.games[m.chat] = {
            answer: targetWord.toLowerCase(), // حفظ الإجابة بشكل صحيح للمقارنة
            timeout: setTimeout(() => {
                if (global.arrangeGame.games[m.chat]) {
                    delete global.arrangeGame.games[m.chat];
                    delete global.arrangeGame.scores[m.chat];
                    m.reply("`⏰: انتهى الوقت`");
                }
            }, 30000)
        };
    } catch (e) {
        console.error(e);
        m.reply("❌ حدث خطأ أثناء جلب كلمات لعبة التركيب، جرب مرة أخرى.");
    }
}

arrangeHandler.before = async (m, { conn }) => {
    if (!m.text || !global.arrangeGame?.games?.[m.chat] || !global.arrangeGame?.scores?.[m.chat]) return;

    const game = global.arrangeGame.games[m.chat];
    const player = m.sender;
    const userAnswer = m.text.trim().toLowerCase();
    
    // التحقق الصارم من الإجابة لمنع التجميد والاستجابة الخاطئة
    if (userAnswer !== game.answer) return;

    clearTimeout(game.timeout);
    delete global.arrangeGame.games[m.chat];

    if (!global.arrangeGame.scores[m.chat][player]) global.arrangeGame.scores[m.chat][player] = 0;
    global.arrangeGame.scores[m.chat][player]++;
    
    // ريأكت نجمة الفوز 🌟 على رسالة العضو اللي جاوب صح فوراً
    await conn.sendMessage(m.chat, { react: { text: "🌟", key: m.key } });
    
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
            text: `🏆 *الفائزون في لـعـبـة الـتـركـيـب والـدمـج*\n${LINE_SEPARATOR}\n\n${sorted.join('\n')}\n\n🏅 @${winner.split('@')[0]} حصل على +500 XP و 🍪 +10 كوكيز`,
            mentions
        });
        delete global.arrangeGame.scores[m.chat];
        return true;
    }

    await conn.sendMessage(m.chat, {
        text: `✅ احسنت معاك: ${global.arrangeGame.scores[m.chat][player]} نقطه`
    }, { quoted: m });
    
    // استدعاء جولة جديدة تلقائياً بدون تضارب
    await new Promise(resolve => setTimeout(resolve, 1500));
    arrangeHandler(m, { conn, text: '', command: 'تركيب' });
    return true;
};

arrangeHandler.usage = ["تركيب"];
arrangeHandler.category = "games";
arrangeHandler.command = ['تركيب', 'دمج'];
export default arrangeHandler;
    
