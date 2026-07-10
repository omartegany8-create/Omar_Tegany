// ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|
// كود صنع الموسيقى بالذكاء الاصطناعي - النسخة الكاملة والمصححة من أخطاء السيرفر
// https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z

import axios from 'axios';

const sonicFooter = '*╰━━━━━━━ 〔 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ 〕 ━━━━━━━╯*';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // --- فحص المدخلات والوسوم ---
    let prompt = text;
    let tags = 'pop, acoustic, happy'; // الوسوم الافتراضية للتلحين
    if (text && text.includes('|')) {
        const parts = text.split('|');
        prompt = parts[0].trim();
        tags = parts[1].trim();
    }

    if (!prompt) {
        return conn.reply(m.chat, `⚡ ⃟꙰⃢  *صـنـع مـوُسـيـقـى بـالـذكـاء الاصـطـنـاعـي* 🎶\n\n` +
            `🔮 *يرجى إدخال وصف الأغنية التي تريد توليدها.*\n` +
            `📌 *مثال الاستخدام:* \n» \`${usedPrefix + command} أغنية عن ركض بسرعة الصاعقة | حماسية، روك\`\n\n` +
            `${sonicFooter}`, m);
    }

    try {
        // تفاعل الانتظار الأولي
        await m.react('⏳');

        // --- المرحلة الأولى: توليد الكلمات عن طريق الـ LLM ---
        await m.reply(`⚡ ⃟꙰⃢  *الـمـرحـلـة [1/2] ↶ ✍️*\n\n` +
            `🔮 *الحالة:* جاري تأليف كلمات الأغنية وضبط الوزن الموسيقي تلقائياً...\n\n` +
            `${sonicFooter}`);

        const { data: lyricsResponse } = await axios.get('https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat', {
            params: {
                query: JSON.stringify([
                    {
                        role: 'system',
                        content: 'You are a professional lyricist AI trained to write poetic and rhythmic song lyrics. Respond with lyrics only, using [verse], [chorus], [bridge], and [instrumental] or [inst] tags to structure the song. Use only the tag (e.g., [verse]) without any numbering or extra text. Do not add explanations, titles, or any other text outside of the lyrics. Focus on vivid imagery, emotional flow, and strong lyrical rhythm. Respond in clean plain text, exactly as if it were a song lyric sheet.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ]),
                link: 'writecream.com'
            }
        });

        const lyrics = lyricsResponse.response_content;
        if (!lyrics) {
            throw new Error('فشل نظام تأليف الكلمات، قد يكون الخادم مشغولاً حالياً.');
        }

        // --- المرحلة الثانية: إرسال الكلمات والوسوم للتلحين وصنع الـ Audio ---
        await m.reply(`⚡ ⃟꙰⃢  *الـمـرحـلـة [2/2] ↶ 🎼*\n\n` +
            `🔮 *الحالة:* تم تأليف الكلمات بنجاح! جاري رندرة وتلحين الموسيقى الآن.\n` +
            `🎵 *الوسوم المستخدمة:* [ ${tags} ]\n` +
            `⚠️ *ملاحظة:* قد تستغرق المعالجة الصوتية دقيقة واحدة، يرجى الانتظار.\n\n` +
            `${sonicFooter}`);

        const session_hash = Math.random().toString(36).substring(2);

        await axios.post(`https://ace-step-ace-step.hf.space/gradio_api/queue/join?`, {
            data: [240, tags, lyrics, 60, 15, 'euler', 'apg', 10, '', 0.5, 0, 3, true, false, true, '', 0, 0, false, 0.5, null, 'none'],
            event_data: null,
            fn_index: 11,
            trigger_id: 45,
            session_hash: session_hash
        });

        // فحص الطابور (Polling) حتى يكتمل الملف الصوتي
        let audioUrl;
        const maxAttempts = 60;
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(res => setTimeout(res, 2000));

            const { data: queueData } = await axios.get(`https://ace-step-ace-step.hf.space/gradio_api/queue/data?session_hash=${session_hash}`);
            const lines = queueData.split('\n\n');
            
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const d = JSON.parse(line.substring(6));
                    if (d.msg === 'process_completed') {
                        audioUrl = d.output.data[0].url;
                        break;
                    } else if (d.msg === 'process_failed') {
                        throw new Error('فشلت معالجة الصوت داخل طابور السيرفر.');
                    }
                }
            }
            if (audioUrl) break;
        }

        if (!audioUrl) {
            throw new Error('انتهت مهلة انتظار السيرفر، يرجى إعادة المحاولة لاحقاً.');
        }

        // --- المرحلة الثالثة: جلب الملف كـ Buffer وإرساله بأمان لتفادي خطأ مجلد tmp ---
        await m.react('✅');
        
        const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(audioResponse.data);

        // إرسال الملف الصوتي مباشرة للمحادثة
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `sonic_music_${Date.now()}.mp3`,
            ptt: false, // إذا كنت تريدها بصمة صوتية غير قابلة للتقديم اجعلها true
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363427713105085@newsletter',
                    newsletterName: '⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|',
                    serverMessageId: 143
                }
            }
        }, { quoted: m });

        // إرسال رسالة النجاح المنفصلة لتوثيق الثيم الملكي
        await conn.reply(m.chat, `⚡ ⃟꙰⃢  *تـم صـنـع الأغـنـيـة بـنـجـاح* ✅\n\n` +
            `🎬 *الطلب المستهدف:* "${prompt}"\n` +
            `🎵 تم الإنتاج الموسيقي وتخطي عقبات السيرفر بنجاح.\n\n` +
            `${sonicFooter}`, m);

    } catch (error) {
        console.error(error);
        await m.react('❌');
        await m.reply(`❌ *حدث خطأ أثناء معالجة الموسيقى:* ${error.message}`);
    }
};

// إعدادات التصدير القياسية لبوت سونيك
handler.help = ['صنع_موسيقى', 'aimusic'];
handler.command = /^(صنع_موسيقى|aimusic)$/i;
handler.tags = ['ai'];
handler.limit = false;
handler.premium = false;

export default handler;