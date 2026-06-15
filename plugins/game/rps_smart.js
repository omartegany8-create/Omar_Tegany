

async function handler(m, { command, text, conn }) {
    global.rpsGames ??= {};
    const game = global.rpsGames[m.chat];

    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];

    const isDelete = cmd === 'delete' || cmd === 'حذف' || cmd === 'انهاء';

    // ميزة الحذف للأدمن أو المطور لو الجيم علق
    if (isDelete) {
        if (!game) return m.reply("❌ مفيش مباراة حجر ورقة مقص شغالة حالياً عشان أحذفها!");
        
        const isOwner = global.isBotOwner ? global.isBotOwner(m.sender) : (m.sender.includes('201') || m.fromMe);
        const isAdmin = m.isGroup ? (await conn.groupMetadata(m.chat)).participants.find(p => p.id === m.sender)?.admin : false;

        if (!isOwner && !isAdmin && game.player1 !== m.sender && game.player2 !== m.sender) {
            return m.reply("❌ العب بعيد يا شاطر.. اللاعبين بس يقدروا يحذفوا الجيم! 🤫🔥");
        }

        delete global.rpsGames[m.chat];
        await conn.sendMessage(m.chat, { react: { text: "🗑️", key: m.key } });
        return m.reply("🗑️🦦 *أبشر! تم إلغاء وحذف تحدي الأرقام المشفرة بنجاح.*");
    }

    // إذا كان هناك جيم شغال بالفعل
    if (game) {
        return m.reply(`⚠️🦦 يسطا في مباراة شغالة حالياً في الشات!\n\nاكتب 👈🏻 *.${command} حذف* لو عايز تقفلها وتبدأ من جديد.`);
    }

    // لقط العضو المستهدف من المنشن أو الرد
    const targetUser = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!targetUser) {
        return m.reply(`🎮 *تـحـدي حـجـر ورقـة مـقـص !* 🔥\n\nمنشن الخصم اللي عايز تتحداه !\n*مثال:* .${command} @عضو`);
    }

    if (targetUser === m.sender) return m.reply("❌ مستحيل تتحدى نفسك يسطا.. نقي خصم حقيقي! 🦦😂");
    if (targetUser === conn.user.jid) return m.reply("❌ عايز تتحداني أنا؟ أنا بوت ذكاء اصطناعي هخسرك في ثانية بلاش أحرجك!🦦 وينج");

    // توزيع الحركات عشوائياً على الأرقام 1, 2, 3
    const moves = ['حجر', 'ورقة', 'مقص'];
    const shuffledMoves = moves.sort(() => Math.random() - 0.5);

    // إنشاء اللعبة وتخزينها
    global.rpsGames[m.chat] = {
        player1: m.sender,
        player2: targetUser,
        choices: {
            '1': shuffledMoves[0],
            '2': shuffledMoves[1],
            '3': shuffledMoves[2]
        },
        p1Choice: null,
        p2Choice: null,
        status: 'p1_turn' // في انتظار اختيار اللاعب الأول
    };

    // ريأكت التحدي الحماسي
    await conn.sendMessage(m.chat, { react: { text: "⚔️", key: m.key } });

    const startMsg = await conn.sendMessage(m.chat, {
        text: `⚔️ *بـدأت الـمـعـركـة والـتـحـدي!* 🔥\n\n(حجر 🪨 / ورقة 📄 / مقص ✂️)\n\n الخانات المتاحة:  *🔢 [ 1 ]   🔢 [ 2 ]   🔢 [ 3 ]*\n\n🚹 اللاعب الأول: @${m.sender.split('@')[0]}\n🎯 اللاعب الثاني: @${targetUser.split('@')[0]}\n\n────────────────\n👉🏻 يا @${m.sender.split('@')[0]}، إنت البادئ! اختار رقم خانتك بكتابة الرقم بس (1 أو 2 أو 3)!`,
        mentions: [m.sender, targetUser]
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "🔒", key: startMsg.key } });
}

// الـ قبل (before) للقط الأرقام وإدارة مجريات اللعبة لايف
handler.before = async (m, { conn }) => {
    if (!m.text || !global.rpsGames?.[m.chat]) return false;
    const game = global.rpsGames[m.chat];

    const input = m.text.trim();
    
    // التأكد أن المدخلات رقم بين 1 و 3 فقط
    if (!['1', '2', '3'].includes(input)) return false;

    // 1️⃣ دور اللاعب الأول
    if (game.status === 'p1_turn') {
        if (m.sender !== game.player1) return false; // تجاهل لو حد تاني كتب الرقم

        game.p1Choice = input;
        game.status = 'p2_turn'; // نقل الدور للاعب الثاني

        // ريأكت قفل الخانة الأولى
        await conn.sendMessage(m.chat, { react: { text: "🛑", key: m.key } });

        const remaining = ['1', '2', '3'].filter(num => num !== input);

        const nextMsg = await conn.sendMessage(m.chat, {
            text: `🔥 *اخـتـيـار ذكـي!* @${game.player1.split('@')[0]} قفل الخانة [ *${input}* ] واختار مصيره!\n\n📌 المتبقي الآن للخصم:  *🎰 [ ${remaining[0]} ]   🎰 [ ${remaining[1]} ]*\n\n👉🏻 الدور عليك يا @${game.player2.split('@')[0]}! اختار رقم واحد من الخانتين الفاضيين دول!`,
            mentions: [game.player2, game.player1]
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: nextMsg.key } });
        return true;
    }

    // 2️⃣ دور اللاعب الثاني والنتيجة القاضية
    if (game.status === 'p2_turn') {
        if (m.sender !== game.player2) return false;

        if (input === game.p1Choice) {
            await m.reply("❌ الخانة دي اتقفلت ومشغولة يسطا! نقي رقم من الرقمين الفاضيين التانيين. 🦦");
            return true;
        }

        game.p2Choice = input;
        
        // ريأكت قفل الخانة الثانية وبدء الصدمة
        await conn.sendMessage(m.chat, { react: { text: "💥", key: m.key } });

        // جلب الحركات الحقيقية من وراء الأرقام
        const p1Move = game.choices[game.p1Choice];
        const p2Move = game.choices[game.p2Choice];

        // معرفة الحركة المتبقية في الخانة الثالثة لمزيد من الشفافية
        const thirdCard = ['1', '2', '3'].find(num => num !== game.p1Choice && num !== game.p2Choice);
        const thirdMove = game.choices[thirdCard];

        // تحويل الكلمات لإيموجي للعرض الفخم
        const emojiMap = { 'حجر': 'حجر 🪨', 'ورقة': 'ورقة 📄', 'مقص': 'مقص ✂️' };

        let resultText = `🏆 *انتهى التحدي !* 🎉\n\n`;
        resultText += ````───────────────────````\n`;
        resultText += `👤 @${game.player1.split('@')[0]} ⇦ اختار الخانة [ *${game.p1Choice}* ] وطلعت: *${emojiMap[p1Move]}*\n`;
        resultText += `👤 @${game.player2.split('@')[0]} ⇦ اختار الخانة [ *${game.p2Choice}* ] وطلعت: *${emojiMap[p2Move]}*\n`;
        resultText += `📦 الخانة المتبقية [ *${thirdCard}* ] كان مستخبي وراها: *${emojiMap[thirdMove]}*\n`;
        resultText += ````───────────────────````\n\n`;

        let winnerJid = null;

        // فحص الفوز والتعادل
        if (p1Move === p2Move) {
            resultText += `⚖️ *تـعـادل!* طلعتوا نفس الحركة .. مفيش مكسب ولا ايه 🦦`;
            await conn.sendMessage(m.chat, { react: { text: "⚖️", key: m.key } });
        } else if (
            (p1Move === 'حجر' && p2Move === 'مقص') ||
            (p1Move === 'مقص' && p2Move === 'ورقة') ||
            (p1Move === 'ورقة' && p2Move === 'حجر')
        ) {
            winnerJid = game.player1;
        } else {
            winnerJid = game.player2;
        }

        if (winnerJid) {
            resultText += `👑 *الـبـطـل الـكـيـنـج الـفـائـز:* @${winnerJid.split('@')[0]} 🎉\n`;
            
            // إضافة الجوائز في الداتا بيز لو السيستم مدعوم عندك
            if (global.db?.users?.[winnerJid]) {
                global.db.users[winnerJid].xp = (global.db.users[winnerJid].xp || 0) + 300;
                global.db.users[winnerJid].cookies = (global.db.users[winnerJid].cookies || 0) + 5;
                resultText += `🎁 الجوائز: *+300 XP* & *🍪 +5 كوكيز* ⚡`;
            } else {
                resultText += `🎁 الجوائز: *+300 نقطة!* 🔥`;
            }
            
            await conn.sendMessage(m.chat, { react: { text: "👑", key: m.key } });
        }

        // إرسال النتيجة النهائية الفخمة في الشات
        await conn.sendMessage(m.chat, {
            text: resultText,
            mentions: [game.player1, game.player2]
        }, { quoted: m });

        // تصفير اللعبة تماماً لفتح المجال لجيم جديد
        delete global.rpsGames[m.chat];
        return true;
    }

    return false;
};

handler.usage = ["حجر"];
handler.category = "games";
handler.command = ['حجر', 'ورقة', 'مقص', 'rps'];
handler.group = true; // تعمل داخل المجموعات فقط لإشعال التفاعل

export default handler;
