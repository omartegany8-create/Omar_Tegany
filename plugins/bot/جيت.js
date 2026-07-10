/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور: SONIC EL GHADAR (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.2
 * 📝 الوظيفة: فحص وتحميل أكواد GitHub Gist وحفظها تلقائياً بـ أزرار NativeFlow
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

global.sonicGistCache = global.sonicGistCache || {};

let handler = async (m, { conn, args, usedPrefix, command }) => {

    // ─── الجزء الأول: معالجة ضغطات الأزرار والتثبيت التلقائي ───
    if (command === 'gistaction') {
        const gistId = args[0];
        const action = args[1];

        if (!global.sonicGistCache || !global.sonicGistCache[gistId]) {
            return m.reply('*❌ انتهت صلاحية هذه الجلسة! يرجى إرسال الرابط مجدداً.*');
        }

        const cached = global.sonicGistCache[gistId];
        const fileData = cached.file;

        if (action === 'save') {
            try {
                const pluginsDir = path.join(process.cwd(), 'plugins');
                const filePath = path.join(pluginsDir, fileData.name);

                // حفظ الملف مباشرة في مجلد الـ plugins
                fs.writeFileSync(filePath, fileData.content, 'utf8');

                await conn.sendMessage(m.chat, { react: { text: '💾', key: m.key } });
                return m.reply(`*🚀 [نظام التثبيت التلقائي لـ سـونـيـك]:*\n\n✅ تم حفظ الملف بنجاح داخل السيرفر!\n📂 *المسار:* \`plugins/${fileData.name}\`\n📝 *اللغة:* \`${fileData.language}\`\n\n💡 يمكنك الآن تجربة تشغيل الميزة الجديدة أو تعديلها.`);
            } catch (err) {
                return m.reply(`*❌ فشل حفظ الملف:* ${err.message}`);
            } finally {
                delete global.sonicGistCache[gistId];
            }
        }

        if (action === 'view') {
            await conn.sendMessage(m.chat, { react: { text: '👀', key: m.key } });
            
            // إرسال الكود منسق بالكامل للشات
            const codeFormat = `\`\`\`${fileData.language.toLowerCase()}\n${fileData.content}\n\`\`\``;
            await m.reply(`📂 *اسم الملف:* \`${fileData.name}\`\n\n${codeFormat}`);
            
            delete global.sonicGistCache[gistId];
            return;
        }
    }

    // ─── الجزء الثاني: استدعاء الـ API وعرض أزرار التحكم الفخمة ───
    try {
        if (!args[0]) {
            return m.reply(`*⚠️ عذراً، يرجى إدخال رابط GitHub Gist صحيح!*\n\n*💡 مثال الاستخدام:*\n\`${usedPrefix + command} https://gist.github.com/siputzx/966268..._g\``);
        }

        const targetUrl = args[0];
        if (!targetUrl.includes('gist.github.com')) {
            return m.reply('*❌ عذراً، الرابط المدخل لا يبدو أنه رابط GitHub Gist صالح!*');
        }

        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        // الاتصال بـ الـ API
        const apiUrl = `https://api.siputzx.my.id/api/d/github?url=${encodeURIComponent(targetUrl)}`;
        const response = await axios.get(apiUrl);
        const result = response.data;

        if (!result.status || !result.data || !result.data.files || result.data.files.length === 0) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply('*❌ فشل في قراءة بيانات الـ Gist من السيرفر.*');
        }

        const gistData = result.data;
        const mainFile = gistData.files[0]; // نأخذ أول ملف موجود في الـ Gist

        // حفظ بيانات الملف في الكاش المؤقت للـ Gist
        const uniqueId = gistData.gist_id || Date.now().toString();
        global.sonicGistCache[uniqueId] = {
            file: mainFile,
            owner: gistData.owner,
            description: gistData.description
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

        const mainText = `*🐙 ───〔 𝖲𝖮𝖭𝖨𝖢 𝖦𝖨𝖳𝖧𝖴𝖡 𝖦𝖨𝖲𝖳 〕─── 🐙*\n\n👤 *صاحب المستودع:* \`${gistData.owner}\`\n📝 *الوصف:* ${gistData.description || 'لا يوجد وصف'}\n📂 *اسم الملف المستخرج:* \`${mainFile.name}\`\n📊 *الحجم:* \`${mainFile.size} Bytes\`\n🛠️ *اللغة البرمجية:* \`${mainFile.language}\`\n\n🚀 *تم فحص الكود بنجاح!* اختر الإجراء المطلوب الآن من الأزرار أسفله 👇`;

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
                                    buttonParamsJson: JSON.stringify({ display_text: '💾 تثبيت وحفظ الملف', id: `${usedPrefix}gistaction ${uniqueId} save` })
                                },
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({ display_text: '👀 عرض محتوى الكود', id: `${usedPrefix}gistaction ${uniqueId} view` })
                                }
                            ]
                        }
                    }
                }
            }
        }, { userJid: botJid, quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply('*❌ واجه النظام مشكلة أثناء جلب الملف:*\\n\`' + e.message + '\`');
    }
}

handler.help = ['جيست', 'جيت']
handler.tags = ['owner']
handler.command = ['جيست', 'جيت', 'gist', 'github', 'gistaction']
handler.owner = true // جعلته للمطور فقط لحماية السيرفر من حقن ملفات خارجية ضارة

export default handler;