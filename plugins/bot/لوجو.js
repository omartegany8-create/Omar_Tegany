/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور: SONIC EL GHADAR (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.2
 * 📝 الوظيفة: لعبة تخمين شعار الشركات والمنصات التفاعلية (Tebak Logo)
 */

import axios from 'axios';

// إنشاء كائن كاش للعبة إذا لم يكن موجوداً
global.sonicLogoGame = global.sonicLogoGame || {};

let handler = async (m, { conn, usedPrefix, command }) => {
    const id = m.chat;

    // 1. التحقق هل هناك لعبة قائمة بالفعل ف نفس الشات
    if (id in global.sonicLogoGame) {
        return conn.reply(m.chat, `*⚠️ هـنـاك لُـعْـبَـة قَـائِـمَـة بـالـفِـعْـل فِـي هَـذَا الـشَّـات!*\n\nأجب على اللوجو السابق أو اضغط على زر الاستسلام للبدء من جديد.`, global.sonicLogoGame[id].msg);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '🎮', key: m.key } });

        // 2. استدعاء الـ API لجلب اللوجو والجواب
        const apiUrl = 'https://api.siputzx.my.id/api/games/tebaklogo';
        const response = await axios.get(apiUrl);
        const result = response.data;

        if (!result.status || !result.data || !result.data.data) {
            return m.reply('*❌ واجه السيرفر مشكلة في توليد اللوجو، يرجى المحاولة لاحقاً.*');
        }

        const gameData = result.data.data;
        const imageUrl = gameData.image;
        const correctAnswer = gameData.jawaban.trim();

        const captionText = `*🧩 ───〔 𝖲𝖮𝖭𝖨𝖢 𝖳𝖤𝖡𝖤𝖪 𝖫𝖮𝖦𝖮 〕─── 🧩*\n\nخمن اسم الشعار أو المنصة الظاهرة في الصورة أسفله! 👇\n\n⏳ *الوقت المتاح:* 60 ثانية\n*✨ بواسطة: SonicBot-MD*`;

        // ميتاداتا التوثيق والـ Forward لبوتك
        const botJid = conn.user?.id?.includes(':') ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : conn.user?.id;
        const botMeta = {
            isForwarded: true,
            forwardingScore: 999,
            forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
            forwardOrigin: 4
        };

        const generateMsg = conn.generateWAMessageFromContent || 
                            (await import('@whiskeysockets/baileys')).default?.generateWAMessageFromContent || 
                            (await import('@whiskeysockets/baileys')).generateWAMessageFromContent;

        // 3. بناء وإرسال الصورة مع أزرار التفاعل الفخمة (NativeFlow)
        const msg = await generateMsg(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            hasMediaAttachment: true,
                            imageMessage: (await conn.sendMessage(m.chat, { image: { url: imageUrl } }, { quoted: m })).message.imageMessage
                        },
                        body: { text: captionText },
                        footer: { text: '＊* • ̩̩͙✩ 𝚂𝙾𝙽𝙸𝙲 𝙰𝙸 𝚂𝚈𝚂𝚃𝙴𝙼 ✩• ̩̩͙ *˚' },
                        contextInfo: botMeta,
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({ display_text: '🏳️ استسلام وعرض الجواب', id: `${usedPrefix}surrenderlogo` })
                                }
                            ]
                        }
                    }
                }
            }
        }, { userJid: botJid, quoted: m });

        // إرسال الرسالة وحفظها ف الكاش
        const sentMsg = await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        // تخزين بيانات اللعبة الحالية مع مؤقت 60 ثانية للإلغاء التلقائي
        global.sonicLogoGame[id] = {
            answer: correctAnswer.toLowerCase(),
            msg: m,
            timeout: setTimeout(() => {
                if (global.sonicLogoGame[id]) {
                    conn.reply(m.chat, `*⏳ انـتـهَـى الـوَقْـتُ!*\n\nالجواب الصحيح كان: *${correctAnswer}* ❌`, global.sonicLogoGame[id].msg);
                    delete global.sonicLogoGame[id];
                }
            }, 60000) // 60000 مللي ثانية = دقيقة واحدة
        };

    } catch (e) {
        console.error(e);
        m.reply('*❌ فشل في تشغيل اللعبة:* ' + e.message);
    }
};

// ─── الـ Watcher الذكي لمراقبة الإجابات وسط الشات وميزة الاستسلام ───
handler.before = async (m, { conn }) => {
    const id = m.chat;

    // معالجة ضغط زر الاستسلام
    if (m.text && m.text.endsWith('surrenderlogo')) {
        if (!(id in global.sonicLogoGame)) return false;
        const current = global.sonicLogoGame[id];
        clearTimeout(current.timeout);
        m.reply(`*🏳️ تم الاستسلام!*\n\nالجواب الصحيح هو: *${current.answer.toUpperCase()}*`);
        delete global.sonicLogoGame[id];
        return true;
    }

    // فحص هل الشات فيه لعبة جارية والمستخدم صيفط رسالة نصية
    if (!(id in global.sonicLogoGame) || !m.text) return false;
    
    const game = global.sonicLogoGame[id];
    const userAttempt = m.text.trim().toLowerCase();

    // مقارنة محاولة المستخدم بالجواب الصحيح المخزن
    if (userAttempt === game.answer) {
        clearTimeout(game.timeout);
        await conn.sendMessage(m.chat, { react: { text: '🎉', key: m.key } });
        m.reply(`*🎉 إِجَـابَـة صَـحِـيـحَـة! تـبـارك الله عـلـيـك 🌟*\n\n🎯 *الـجَـوَاب:* \`${game.answer.toUpperCase()}\`\n👤 *الـفَـائِـز:* @${m.sender.split('@')[0]}`, null, { mentions: [m.sender] });
        delete global.sonicLogoGame[id];
        return true;
    } else {
        // إذا كانت الإجابة خاطئة، نترك المجال للباقي ولا نفعل شيئاً لكي تستمر اللعبة
        return false;
    }
};

handler.help = ['خمن_اللوجو'];
handler.tags = ['الألعاب 🎮'];
handler.command = ['لوجو', 'لوقو', 'تخمين', 'tebaklogo'];

export default handler;