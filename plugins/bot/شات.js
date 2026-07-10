/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور: SONIC EL GHADAR (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.2
 * 📝 الوظيفة: قفل وفتح الشات (إصلاح فحص رتبة المشرف للبوت)
 */

let handler = async (m, { conn, text, usedPrefix, command, args, isOwner }) => {
    try {
        const checkGroup = m.chat.endsWith('@g.us');

        if (!checkGroup) {
            return conn.sendMessage(m.chat, { text: "❪🚫❫⇇ *الأمر يشتغل في الجروبات فقط* ⇇❪🚫❫" }, { quoted: m });
        }

        // جلب بيانات المجموعة
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants;

        // تنظيف وتوحيد جميع الـ JIDs الخاصة بالمشرفين
        const groupAdmins = participants.filter(p => p.admin !== null).map(p => conn.decodeJid(p.id));
        
        // تنظيف JID المرسل والمطور
        const userJid = conn.decodeJid(m.sender);
        const isUserAdmin = isOwner || groupAdmins.includes(userJid);
        
        // 🔥 الحل الجذري: تنظيف JID البوت لضمان مطابقته بنجاح مع قائمة المشرفين
        const botJid = conn.decodeJid(conn.user.id || conn.user.jid);
        const isBotAdmin = groupAdmins.includes(botJid);

        // طباعة سجل الـ Debug لمعاينة المطابقة في الكونسول
        console.log(`[DEBUG] Bot JID: ${botJid}, IsBotAdmin: ${isBotAdmin}, Admins List:`, groupAdmins);

        if (!isBotAdmin) {
            return m.reply("❌ *البوت ليس مشرفاً!* يجب أن يكون البوت مشرفاً (Admin) في هذه المجموعة ليتمكن من قفل/فتح الشات.");
        }

        if (!isUserAdmin) {
            return conn.sendMessage(m.chat, { text: "❪🚫❫⇇ *عذراً يا صاحبي.. هذا الأمر مخصص للمشرفين ومطوري النظام فقط!* ⇇❪🚫❫" }, { quoted: m });
        }

        // ─── [ الجزء الثاني: تنفيذ الأوامر عند الضغط على الأزرار ] ───
        if (args[0] === "قفل") {
            try {
                await conn.groupSettingUpdate(m.chat, "announcement");
                return conn.sendMessage(m.chat, { text: "*🔒 تـم إغـلاق الـمـجـمـوعـة بـنـجـاح!*\n⚠️ الـشـات مـغـلـق الآن والـرسـائـل لـلـمـشـرفـيـن فـقـط." }, { quoted: m });
            } catch (e) {
                return m.reply(`*❌ فشل الإجراء!* \n*الخطأ:* ${e.message}`);
            }
        }

        if (args[0] === "فتح") {
            try {
                await conn.groupSettingUpdate(m.chat, "not_announcement");
                return conn.sendMessage(m.chat, { text: "*🔓 تـم فـتـح الـمـجـمـوعـة بـنـجـاح!*\n✨ يـمـكـن لـجـمـيـع الأعـضـاء الـمـشـاركـة وإرﺳـال الـرسـائـل الآن." }, { quoted: m });
            } catch (e) {
                return m.reply(`*❌ فشل الإجراء!* \n*الخطأ:* ${e.message}`);
            }
        }

        // ─── [ الجزء الأول: واجهة الأزرار التفاعلية الملوكية بمجرد كتابة .شات ] ───
        const channelId = "120363427713105085@newsletter";

        const bodyText = `*╭━━━━━━━ 〔 ⚙️ 𝖲𝖮𝖭𝖨𝖢 𝖢𝖮𝖭𝖳𝖱𝖮𝖫 〕 ━━━━━━━╮*\n\n` +
                         `*🛡️ غـرفـة الـتـحـكـم فـي الـمـجـمـوعـات*\n` +
                         `*👥 الـمـجـمـوعـة:* ${groupMetadata.subject}\n` +
                         `*👤 الـمـسـؤول:* @${m.sender.split("@")[0]}\n\n` +
                         `💡 *اضغط على الأزرار بالأسفل لتحديد حالة الشات فوراً.*\n\n` +
                         `*╰━━━━━━━ 〔 𝚂𝙾𝙽𝙸𝙲➥ᏴᝪᝪᎢ ❯ 〕 ━━━━━━━╯*`;

        const { generateWAMessageFromContent, generateMessageIDV2 } = (await import('@whiskeysockets/baileys')).default;

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: bodyText },
                        footer: { text: '⚙️ 𝖯𝖮𝖶𝖤𝖱𝖤𝖭 𝖡𝖸 𝚂𝙾𝙽𝙸𝖢 𝖣𝖤𝖵' },
                        header: { hasMediaAttachment: false },
                        contextInfo: {
                            mentionedJid: [m.sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: channelId,
                                newsletterName: "⃟꙰⃢  𝚂𝙾𝙽𝙸𝙲➥ᏴᝪᝪᎢ ❯ |‌⃟🇲🇦‌|‌",
                                serverMessageId: 155
                            }
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "🔒 قفل الشات",
                                        id: `${usedPrefix + command} قفل`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "🔓 فتح الشات",
                                        id: `${usedPrefix + command} فتح`
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        }, { userJid: conn.user.jid, quoted: m });

        return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (e) {
        console.error(e);
        m.reply(String(e));
    }
}
handler.help = ['شات']
handler.tags = ['group']
handler.command = ['شات']
export default handler;