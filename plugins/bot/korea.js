/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور: SONIC EL GHADAR (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.2
 * 📝 الوظيفة: جلب صور عشوائية لفتيات كوريات (إصلاح شامل لجلسة الرفع والأزرار)
 */

import axios from 'axios';

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // تفاعل بالانتظار
        await conn.sendMessage(m.chat, { react: { text: '📸', key: m.key } });

        const imageUrl = 'https://api.siputzx.my.id/api/r/cecan/korea';
        const captionText = `*✨ ───〔 𝖲𝖮𝖭𝖨𝖢 𝖪𝖮𝖱𝖤𝖳𝖨 〕─── ✨*\n\nتفضّل طلبك! صورة عشوائية بجودة عالية من السيرفر السحابي لـ سـونـيـك 💖\n\nاضغط على الزر أسفله لعرض الصورة التالية مباشرة 👇`;

        // ميتاداتا التوثيق والـ Forward الخاصة ببوتك
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

        if (typeof generateMsg !== 'function') {
            return conn.sendMessage(m.chat, { image: { url: imageUrl }, caption: captionText, contextInfo: botMeta }, { quoted: m });
        }

        // 1. جلب الصورة كـ Buffer من السيرفر
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'utf-8');

        // 2. توليد كائن الـ imageMessage داخلياً (الواتساب كيرفعو تلقائياً بشكل صامت)
        const prepareMedia = await (await import('@whiskeysockets/baileys')).prepareWAMessageMedia(
            { image: buffer },
            { upload: conn.waUploadToServer }
        );

        // 3. بناء رسالة الـ NativeFlow التفاعلية المضمونة بدون تكرار
        const msg = await generateMsg(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            hasMediaAttachment: true,
                            imageMessage: prepareMedia.imageMessage
                        },
                        body: { text: captionText },
                        footer: { text: '＊* • ̩̩͙✩ 𝚂𝙾𝙽𝙸𝙲 𝙰𝙸 𝚂𝚈𝚂𝚃𝙴𝙼 ✩• ̩̩͙ *˚' },
                        contextInfo: botMeta,
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({ display_text: '» 𝖭𝖤𝖷𝖳 𝖯𝖨𝖢𝖳𝖴𝖱𝖤 ➡️ «', id: `${usedPrefix}${command}` })
                                }
                            ]
                        }
                    }
                }
            }
        }, { userJid: botJid, quoted: m });

        // إرسال الرسالة النهائية للشات
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply('*❌ حدث خطأ في محرك الميديا السحابي، يرجى إعادة المحاولة.*');
    }
};

handler.help = ['كورية'];
handler.tags = ['الترفيه 🎪'];
handler.command = ['كورية', 'كوريه', 'korea', 'korean'];

export default handler;