/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور: SONIC EL GHADAR (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.2
 * 📝 الوظيفة: تحميل تيك توك بأزرار تفاعلية (NativeFlow) عبر الـ API الجديد v2
 */

import axios from 'axios';
import crypto from 'crypto';

// كاش مؤقت لحفظ الروابط لتجنب إعادة الاتصال بالـ API عند الضغط على الزر
global.sonicTiktokCache = global.sonicTiktokCache || {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
    
    // ─── الجزء الأول: معالجة ضغطات الأزرار (عند اختيار الجودة) ───
    if (command === 'gettt') {
        const videoId = args[0];
        const quality = args[1];

        if (!global.sonicTiktokCache || !global.sonicTiktokCache[videoId]) {
            return m.reply('*❌ عذراً، انتهت صلاحية هذه الجلسة! يرجى إرسال الرابط من جديد.*');
        }

        const cached = global.sonicTiktokCache[videoId];
        // اختيار الرابط بناءً على الجودة المطلوبة مع التبديل التلقائي إذا لم تتوفر الـ HD
        const videoUrl = quality === 'hd' ? (cached.hd || cached.sd) : cached.sd;

        await conn.sendMessage(m.chat, { react: { text: '🚀', key: m.key } });
        await conn.sendPresenceUpdate('recording', m.chat);

        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `*🎬 ───〔 𝖲𝖮𝖭𝖨𝖢 𝖳𝖨𝖪𝖳𝖮𝖪 〕─── 🎬*\n\n✅ *تم تحميل الفيديو بنجاح بالجودة:* \`${quality.toUpperCase()}\`\n👤 *صاحب المقطع:* \`${cached.author}\`\n📊 *الإعجابات:* \`${cached.likes}\` | *المشاهدات:* \`${cached.views}\`\n\n*⚡ بواسطة: SonicBot-MD*`,
            mimetype: 'video/mp4'
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        
        // تنظيف الكاش فوراً للحفاظ على الرام
        delete global.sonicTiktokCache[videoId];
        return;
    }

    // ─── الجزء الثاني: معالجة الرابط وإرسال أزرار الـ NativeFlow ───
    try {
        if (!args[0]) {
            return m.reply(`*⚠️ عذراً، يرجى إدخال رابط فيديو تيك توك!*\n\n*💡 مثال الاستخدام:*\n\`${usedPrefix + command} https://vt.tiktok.com/ZSjXNEnbC/\``);
        }

        const targetUrl = args[0];
        if (!targetUrl.includes('tiktok.com')) {
            return m.reply('*❌ عذراً، هذا الرابط ليس رابط تيك توك صحيح!*');
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        // الاتصال بـ الـ API الجديد v2
        const apiUrl = `https://api.siputzx.my.id/api/d/tiktok/v2?url=${encodeURIComponent(targetUrl)}`;
        const response = await axios.get(apiUrl);
        const result = response.data;

        if (!result.status || !result.data) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply('*❌ فشل في جلب بيانات الفيديو من الـ API الجديد.*');
        }

        const data = result.data;
        
        // استخراج البيانات الفنية من الـ الـ JSON الجديد
        const authorName = data.author_nickname || 'Unknown';
        const videoTitle = data.text && data.text.trim() !== '' ? data.text : 'TikTok Video';
        const likeCount = data.like_count || '0';
        const playCount = data.play_count || '0';

        const hdVideo = data.no_watermark_link_hd;
        const sdVideo = data.no_watermark_link;

        // توليد معرف فريد وحفظ البيانات في الكاش
        const videoId = crypto.randomBytes(4).toString('hex');
        global.sonicTiktokCache[videoId] = {
            hd: hdVideo,
            sd: sdVideo,
            title: videoTitle,
            author: authorName,
            likes: likeCount,
            views: playCount
        };

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

        const mainText = `*🎬 ───〔 𝖲𝖮𝖭𝖨𝖢 𝖳𝖨𝖪𝖳𝖮𝖪 𝖵𝖱 〕─── 🎬*\n\n👤 *صاحب المقطع:* \`${authorName}\`\n📌 *الوصف:* ${videoTitle.substring(0, 150)}...\n❤️ *اللايكات:* \`${likeCount}\`\n👁️ *المشاهدات:* \`${playCount}\`\n\n🚀 *تم فحص المقطع بسيرفر v2!* اختر جودة التحميل المفضلة لديك من الأزرار أسفله 👇`;

        if (typeof generateMsg !== 'function') {
            return m.reply(mainText);
        }

        // بناء وإرسال أزرار NativeFlow التفاعلية المضمونة
        const msg = await generateMsg(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: mainText },
                        footer: { text: '＊* • ̩̩͙✩ 𝚂𝙾𝙽𝙸𝙲 𝙰𝙸 𝚂𝚈𝚂𝚃𝙴𝙼 ✩• ̩̩͙ *˚' },
                        contextInfo: botMeta,
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({ display_text: '🎬 جودة عالية HD', id: `${usedPrefix}gettt ${videoId} hd` })
                                },
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({ display_text: '📱 جودة عادية SD', id: `${usedPrefix}gettt ${videoId} sd` })
                                }
                            ]
                        }
                    }
                }
            }
        }, { userJid: botJid, quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply('*❌ واجه النظام مشكلة:*\\n\`' + e.message + '\`');
    }
}

handler.help = ['تيكتوك', 'تيك'];
handler.tags = ['التحميل 📥'];
handler.command = ['تيكتوك', 'تيك', 'tiktok', 'tt', 'gettt'];

export default handler;