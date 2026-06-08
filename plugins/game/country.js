// مصفوفة الأعلام العالمية
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
    { name: "إنجلترا", img: "https://flagcdn.com/w640/gb.png" },
    { name: "أمريكا", img: "https://flagcdn.com/w640/us.png" },
    { name: "كوريا الجنوبية", img: "https://flagcdn.com/w640/kr.png" },
    { name: "العراق", img: "https://flagcdn.com/w640/iq.png" },
    { name: "الإمارات", img: "https://flagcdn.com/w640/ae.png" },
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
    { name: "جنوب أفريقيا", img: "https://flagcdn.com/w640/za.png" }
];

async function handler(m, { conn }) {
    if (!global.gameActive) global.gameActive = {};
    
    // لو اللعبة شغالة بالفعل في الشات، نمنع تكرار الأمر
    if (global.gameActive[m.chat]) return m.reply("❌ هناك جولة قائمة بالفعل في هذا الجروب!");
    
    // بدء جولة جديدة من الصفر (1/10)
    startGame(m, conn, 1);
}

// دالة لتشغيل الجولة وإرسال العلم
async function startGame(m, conn, round) {
    const country = flagsData[Math.floor(Math.random() * flagsData.length)];
    
    const msg = await conn.sendMessage(m.chat, {
        image: { url: country.img },
        caption: `🌍 *خـمـن الـعـلـم [ الجولة: ${round} / 10 ]* 🌍\n\nلديك 30 ثانية للإجابة!\n*رد على هذه الرسالة باسم العلم الصحيح*`
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
                
                // الانتقال للجولة التالية تلقائياً لو لسه مخلصناش الـ 10
                if (currentRound < 10) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // انتظر ثانيتين قبل الجولة الجديدة
                    startGame(m, conn, currentRound + 1);
                } else {
                    conn.sendMessage(m.chat, { text: "🏁 *انتهت الـ 10 جولات كاملة! شكراً للجميع على اللعب.*" });
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
        
        // رسالة الفوز مع المنشن وتغيير سطر الجولة القادمة
        let captionText = `🎉 *إجابة صحيحة !* \n\nعاش يا @${m.sender.split('@')[0]} جبت اسم العلم صح 🏆\n🏅 الجوائز: *+100 XP* & *🍪 +2 كوكيز*\n\n`;
        
        if (currentRound < 10) {
            captionText += `⏳ *استعدوا.. الجولة القادمة (${currentRound + 1} / 10) ستبدأ الآن!*`;
        } else {
            captionText += `🏁 *انتهت الـ 10 جولات كاملة! شكراً للجميع على اللعب.*`;
        }

        await conn.sendMessage(m.chat, {
            image: { url: game.image },
            caption: captionText,
            mentions: [m.sender]
        });
        
        // الدخول في الجولة الجديدة بعد 3 ثواني
        if (currentRound < 10) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            startGame(m, conn, currentRound + 1);
        }
        return true;
    }
    
    await m.reply("❌ *إجابة خاطئة!* رد على رسالة العلم وحاول مرة أخرى.");
    return true;
};

handler.usage = ["علم"];
handler.category = "games";
handler.command = ['علم', 'country'];

export default handler;
