import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { sticker } from '../lib/sticker.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, '../tmp');

if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  دوال معالجة الميديا (فيديو / متحرك)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function videoToAnimatedSticker(videoBuffer, packName, authorName, videoDuration) {
    const inputPath = path.join(tmpDir, `video_${Date.now()}.mp4`);
    const outputPath = path.join(tmpDir, `sticker_${Date.now()}.webp`);
    
    try {
        fs.writeFileSync(inputPath, videoBuffer);
        
        let maxDuration = videoDuration;
        if (videoDuration >= 9.95 && videoDuration <= 10.05) {
            maxDuration = 9.8;
        } else {
            maxDuration = Math.min(videoDuration, 10);
        }
        
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoFilters([
                    'scale=512:512:force_original_aspect_ratio=increase',
                    'crop=512:512',
                    'fps=15',
                    'setpts=PTS'
                ])
                .outputOptions([
                    '-vcodec', 'libwebp',
                    '-lossless', '0',
                    '-compression_level', '6',
                    '-q:v', '60',
                    '-loop', '0',
                    '-preset', 'default',
                    '-vsync', '0',
                    '-an'
                ])
                .duration(maxDuration)
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .save(outputPath);
        });
        
        if (!fs.existsSync(outputPath)) throw new Error('فشل إنشاء الستيكر');
        const stickerBuffer = fs.readFileSync(outputPath);
        
        if (stickerBuffer.length < 100) throw new Error('الستيكر الناتج فارغ');
        
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        return stickerBuffer;
        
    } catch (err) {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        throw err;
    }
}

async function videoToStickerAlternative(videoBuffer, packName, authorName) {
    try {
        const { Sticker } = await import('wa-sticker-formatter');
        const stickerObj = new Sticker(videoBuffer, {
            pack: packName,
            author: authorName,
            type: 'crop',
            quality: 50
        });
        return await stickerObj.toBuffer();
    } catch (err) {
        throw err;
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  الـ Handler الرئيسي للستيكر والتحويل العكسي
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const handler = async (m, { conn }) => {
    // ريأكت التحضير
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let mediaMsg  = null;
    let mediaType = null;

    if (m.message?.imageMessage) {
        mediaMsg  = m.message.imageMessage;
        mediaType = 'image';
    } else if (m.message?.videoMessage) {
        mediaMsg  = m.message.videoMessage;
        mediaType = 'video';
    } else if (m.message?.stickerMessage) {
        mediaMsg  = m.message.stickerMessage;
        mediaType = 'sticker';
    } else if (quoted?.imageMessage) {
        mediaMsg  = quoted.imageMessage;
        mediaType = 'image';
    } else if (quoted?.videoMessage) {
        mediaMsg  = quoted.videoMessage;
        mediaType = 'video';
    } else if (quoted?.stickerMessage) {
        mediaMsg  = quoted.stickerMessage;
        mediaType = 'sticker';
    }

    if (!mediaMsg) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return m.reply("❌ يسطا لازم تعمل رد (Reply) على صورة أو فيديو أو ستيكر عشان أحولهولك!");
    }

    try {
        let dlType = mediaType === 'sticker' ? 'image' : mediaType;
        if (mediaType === 'video') dlType = 'video';
        
        const stream = await downloadContentFromMessage(mediaMsg, dlType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        if (!buffer.length) throw new Error('فشل تحميل الميديا');

        // [تحويل الستيكر العكسي لصورة عادية]
        if (mediaType === 'sticker') {
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: "✅ تم فك وتفكيك الستيكر لصورة بنجاح يسطا!"
            }, { quoted: m });
            return await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        }

        // [تثبيت حقوق الاستيكر الفخمة اللي طلبتها لميرو]
        const packName   = "—̳͟͞͞☁️ 𓆩𝑺𝑻𝑰𝑪𝑲𝑬𝑹𝑺𓆪 🕸️⃟🕷️";
        const authorName = "𓆩𝑴𝑬𝑹𝑶𓆪🕯️ ☁︎";

        let webp;
        
        // [معالجة الفيديوهات المتحركة]
        if (mediaType === 'video') {
            const videoDuration = mediaMsg.seconds || 0;
            if (videoDuration > 10.5) {
                await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } });
                return m.reply("⚠️ الفيديو طويل جداً! الحد الأقصى للستيكر المتحرك هو 10 ثواني بس.");
            }
            
            try {
                webp = await videoToStickerAlternative(buffer, packName, authorName);
            } catch (err1) {
                webp = await videoToAnimatedSticker(buffer, packName, authorName, videoDuration);
            }
            
        } else {
            // [معالجة الصور الثابتة]
            try {
                webp = await sticker(buffer, null, packName, authorName);
            } catch (err) {
                const { Sticker } = await import('wa-sticker-formatter');
                const stickerObj = new Sticker(buffer, {
                    pack: packName,
                    author: authorName,
                    type: 'full'
                });
                webp = await stickerObj.toBuffer();
            }
        }

        if (!Buffer.isBuffer(webp) || webp.length < 100) {
            throw new Error('الملف الناتج فارغ أو تالف');
        }

        // إرسال الستيكر بالحقوق
        await conn.sendMessage(m.chat, { sticker: webp }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply("❌ حصلت مشكلة أثناء تحويل الستيكر: " + e.message);
    }
};

handler.usage = ["s"];
handler.category = "sticker";
handler.command = /^(s|ستيكر)$/i;

export default handler;
                                                 
