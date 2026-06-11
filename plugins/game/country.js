

const flagsData = [
    { name: "مصر", img: "https://flagcdn.com/w640/eg.png" },
    { name: "السعودية", img: "https://flagcdn.com/w640/sa.png" },
    { name: "فلسطين", img: "https://flagcdn.com/w640/ps.png" },
    { name: "اليابان", img: "https://flagcdn.com/w640/jp.png" },
    { name: "البرازيل", img: "https://flagcdn.com/w640/br.png" },
    { name: "الارجنتين", img: "https://flagcdn.com/w640/ar.png" },
    { name: "المغرب", img: "https://flagcdn.com/w640/ma.png" },
    { name: "الجزائر", img: "https://flagcdn.com/w640/dz.png" },
    { name: "تونس", img: "https://flagcdn.com/w640/tn.png" },
    { name: "فرنسا", img: "https://flagcdn.com/w640/fr.png" },
    { name: "المانيا", img: "https://flagcdn.com/w640/de.png" },
    { name: "اسبانيا", img: "https://flagcdn.com/w640/es.png" },
    { name: "ايطاليا", img: "https://flagcdn.com/w640/it.png" },
    { name: "انجلترا", img: "https://flagcdn.com/w640/gb.png" },
    { name: "امريكا", img: "https://flagcdn.com/w640/us.png" },
    { name: "كوريا الجنوبية", img: "https://flagcdn.com/w640/kr.png" },
    { name: "العراق", img: "https://flagcdn.com/w640/iq.png" },
    { name: "الامارات", img: "https://flagcdn.com/w640/ae.png" },
    { name: "قطر", img: "https://flagcdn.com/w640/qa.png" },
    { name: "البرتغال", img: "https://flagcdn.com/w640/pt.png" },
    { name: "الكويت", img: "https://flagcdn.com/w640/kw.png" },
    { name: "البحرين", img: "https://flagcdn.com/w640/bh.png" },
    { name: "عمان", img: "https://flagcdn.com/w640/om.png" },
    { name: "الاردن", img: "https://flagcdn.com/w640/jo.png" },
    { name: "سوريا", img: "https://flagcdn.com/w640/sy.png" },
    { name: "لبنان", img: "https://flagcdn.com/w640/lb.png" },
    { name: "اليمن", img: "https://flagcdn.com/w640/ye.png" },
    { name: "السودان", img: "https://flagcdn.com/w640/sd.png" },
    { name: "ليبيا", img: "https://flagcdn.com/w640/ly.png" },
    { name: "روسيا", img: "https://flagcdn.com/w640/ru.png" },
    { name: "الصين", img: "https://flagcdn.com/w640/cn.png" },
    { name: "كندا", img: "https://flagcdn.com/w640/ca.png" },
    { name: "المكسيك", img: "https://flagcdn.com/w640/mx.png" },
    { name: "هولندا", img: "https://flagcdn.com/w640/nl.png" },
    { name: "بلجيكا", img: "https://flagcdn.com/w640/be.png" },
    { name: "سويسرا", img: "https://flagcdn.com/w640/ch.png" },
    { name: "كرواتيا", img: "https://flagcdn.com/w640/hr.png" },
    { name: "تركيا", img: "https://flagcdn.com/w640/tr.png" },
    { name: "الهند", img: "https://flagcdn.com/w640/in.png" },
    { name: "استراليا", img: "https://flagcdn.com/w640/au.png" },
    { name: "نيجيريا", img: "https://flagcdn.com/w640/ng.png" },
    { name: "السنغال", img: "https://flagcdn.com/w640/sn.png" },
    { name: "غانا", img: "https://flagcdn.com/w640/gh.png" },
    { name: "الكاميرون", img: "https://flagcdn.com/w640/cm.png" },
    { name: "جنوب افريقيا", img: "https://flagcdn.com/w640/za.png" }
];

async function handler(m, { conn, text, command }) {
    if (!global.gameActive) global.gameActive = {};
    
    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];

    // ميزة الحذف لمنع التكرار والبدء من جديد
    if (cmd === 'حذف' || cmd === 'delete') {
        if (!global.gameActive[m.chat]) return m.reply("❌ لا توجد لعبة علم نشطة لإلغائها حالياً!");
        if (global.gameActive[m.chat].timeout) clearTimeout(global.gameActive[m.chat].timeout);
        delete global.gameActive[m.chat];
        return m.reply("🗑️ تم إلغاء وحذف لعبة العلم بنجاح! يمكنك البدء من جديد الآن.");
    }

    if (global.gameActive[m.chat]) return m.reply(`❌ هناك جولة قائمة بالفعل في هذا الجروب!\nاكتب *.${command} حذف* لإلغائها وبدء جولة جديدة.`);
    
    // ريأكت علم مصر عند طلب اللعبة 🇪🇬
    await conn.sendMessage(m.chat, { react: { text: "🇪🇬", key: m.key } });
    
    startGame(m, conn, 1);
}

async function startGame(m, conn, round) {
    const country = flagsData[Math.floor(Math.random() * flagsData.length)];
    
    const msg = await conn.sendMessage(m.chat, {
        image: { url: country.img },
        caption: `🌍 *اسم الدولة اي [ الجولة: ${round} / 10 ]* \n${LINE_SEPARATOR}\n\n *معك 30 ثانية للإجابة!* \n *رد على الرسالة دي بإسم العلم الصحيح*`
    });
    
    global.gameActive[m.chat] = {
        answer: country.name.trim().toLowerCase(),
        image: country.img,
        msgId: msg.key.id,
        round: round,
        timeout: setTimeout(async () => {
            if (global.gameActive[m.chat]) {
                const answer = global.gameActive[m.chat].answer;
                const currentRound = global.gameActive[m.chat].round;
                delete global.gameActive[m.chat];
                
                await conn.sendMessage(m.chat, { text: `⏰ *انتهى الوقت!* الإجابة الصحيحة هي: *${answer}*` });
                
                if (currentRound < 10) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    startGame(m, conn, currentRound + 1);
                } else {
                    conn.sendMessage(m.chat, { text: `🏁 *انتهت الـ 10 جولات كاملة!*\n${LINE_SEPARATOR}\nشكراً للجميع على اللعب.` });
                }
            }
        }, 30000)
    };
}

handler.before = async (m, { conn }) => {
    if (!m.quoted || !m.text) return;
    if (!global.gameActive?.[m.chat]) return;
    
    const game = global.gameActive[m.chat];
    if (m.quoted.id !== game.msgId) return;
    
    if (m.text.toLowerCase().trim() === game.answer) {
        clearTimeout(game.timeout);
        const currentRound = game.round;
        delete global.gameActive[m.chat];
        
        if (global.db?.users[m.sender]) {
            global.db.users[m.sender].xp = (global.db.users[m.sender].xp || 0) + 100;
            global.db.users[m.sender].cookies = (global.db.users[m.sender].cookies || 0) + 2;
        }
        
        // ريأكت الفوز 💯 على رسالة العضو
        await conn.sendMessage(m.chat, { react: { text: "💯", key: m.key } });
        
        let captionText = `🎉 *إجابة صحيحة ! ✔✨* \n${LINE_SEPARATOR}\n\n عاااش يا @${m.sender.split('@')[0]} جبت اسم العلم صح 🏆\n🏅 الجوائز: *+100 XP* & *🍪 +2 كوكيز*\n\n${LINE_SEPARATOR}\n`;
        
        if (currentRound < 10) {
            captionText += `⏳ *استعدوا.. الجولة القادمة (${currentRound + 1} / 10) ستبدأ الآن!*`;
        } else {
            captionText += `🏁 *انتهت الجولات ! شكراً للجميع على اللعب 🤍.*`;
        }

        await conn.sendMessage(m.chat, {
            image: { url: game.image },
            caption: captionText,
            mentions: [m.sender]
        }, { quoted: m });
        
        if (currentRound < 10) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            startGame(m, conn, currentRound + 1);
        }
        return true;
    }
    
    await m.reply("❌ *إجابة خاطئة!* رد على رسالة العلم وحاول مرة تانية.");
    return true;
};

handler.usage = ["علم"];
handler.category = "games";
handler.command = ['علم', 'country'];

export default handler;
