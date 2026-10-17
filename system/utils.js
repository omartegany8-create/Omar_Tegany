/* ════════════════════════════════════════════════════════════
   utils.js — أدوات مشتركة تقدر تستخدمها في أي أمر
   import { getBuffer, fetchJson, uploadToCatbox, ... } from "../../system/utils.js"
   ════════════════════════════════════════════════════════════ */

import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import { Sticker } from 'wa-sticker-formatter';
import cheerio from 'cheerio';
import config, { ROOT } from './config.js';

const execFileAsync = promisify(execFile);

/* ========== مجلد مؤقت ========= */

const tmp = path.join(ROOT, 'tmp');
fs.mkdirSync(tmp, { recursive: true });

/** مسار ملف مؤقت جديد:  tmpPath('mp4') */
const tmpPath = (ext = 'tmp') =>
    path.join(tmp, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`);

/** بيمسح الملفات المؤقتة الأقدم من ساعة (بيتنادى تلقائيًا عند التشغيل) */
const cleanTmp = (maxAgeMs = 60 * 60 * 1000) => {
    try {
        const now = Date.now();
        for (const f of fs.readdirSync(tmp)) {
            const p = path.join(tmp, f);
            try {
                if (now - fs.statSync(p).mtimeMs > maxAgeMs) fs.rmSync(p, { force: true, recursive: true });
            } catch {}
        }
    } catch {}
};
cleanTmp();

/* ========== أدوات عامة ========= */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const UA = { 'User-Agent': 'Mozilla/5.0' };

/** تحميل أي رابط كـ Buffer */
async function getBuffer(url, options = {}) {
    const res = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: UA,
        ...options
    });
    return Buffer.from(res.data);
}

/** جلب JSON من رابط */
async function fetchJson(url, options = {}) {
    const res = await axios.get(url, { timeout: 30000, headers: UA, ...options });
    return res.data;
}

const detectType = async (buffer) =>
    (await fileTypeFromBuffer(buffer)) || { ext: 'bin', mime: 'application/octet-stream' };

/* ========== Create Sticker ======== */

const createSticker = async (buffer, options = {}) => {
    const sticker = new Sticker(buffer, {
        pack: options.pack || config.info.copyright.pack,
        author: options.author || config.info.copyright.author,
        type: 'full',
        quality: options.mime === 'image/jpg' ? 100 : 10
    });
    return sticker.build();
};

/* ========== GIF TO MP4 ========= */

async function gifToMp4(url) {
    const gifPath = tmpPath('gif');
    const mp4Path = tmpPath('mp4');

    try {
        const res = await axios({ url, responseType: 'stream', timeout: 30000, headers: UA });
        const writer = fs.createWriteStream(gifPath);
        await new Promise((resolve, reject) => {
            res.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
            res.data.on('error', reject);
        });

        // execFile (بدون shell) = مفيش حقن أوامر
        await execFileAsync('ffmpeg', [
            '-y', '-i', gifPath,
            '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
            '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
            mp4Path
        ]);

        return fs.readFileSync(mp4Path);
    } catch (e) {
        if (e.code === 'ENOENT') throw new Error('ffmpeg مش متسطب على السيرفر');
        throw e;
    } finally {
        // تنضيف الملفات حتى لو حصل خطأ
        fs.rmSync(gifPath, { force: true });
        fs.rmSync(mp4Path, { force: true });
    }
}

/* =========== CatBox =========== */

async function uploadToCatbox(buffer) {
    const { ext, mime } = await detectType(buffer);
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: `${Date.now()}.${ext}`, contentType: mime });

    const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        timeout: 60000,
        maxBodyLength: Infinity
    });
    if (typeof data !== 'string' || !data.includes('catbox')) throw new Error('upload failed');
    return data.trim();
}

/* =========== AI =========== */

async function AiChat(options = {}) {
    const text = String(options.text ?? '').trim();
    if (!text) throw new Error('AiChat: النص فاضي');

    const model = encodeURIComponent(options.model || 'openai');
    const url = `https://text.pollinations.ai/${encodeURIComponent(text)}?model=${model}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(options.timeout || 60000) });
    if (!res.ok) throw new Error(`AiChat: الخدمة رجعت ${res.status}`);
    return res.text();
}

/* =========== Qu.ax Upload =========== */

const extractFromHtml = (html, baseUrl) => {
    const $ = cheerio.load(html);
    const selectors = [
        'meta[property="og:image"]', 'meta[property="og:video"]', 'meta[property="og:audio"]',
        'meta[name="twitter:image"]', 'meta[name="twitter:player"]', 'meta[name="twitter:video"]',
        'link[rel="image_src"]', 'link[rel="video_src"]', 'video source', 'audio source', 'img'
    ];

    for (const selector of selectors) {
        let url = $(selector).attr('content') || $(selector).attr('src') || $(selector).attr('href');
        if (url && !url.includes('base64') && !url.startsWith('data:')) {
            if (!url.startsWith('http')) {
                try { url = new URL(url, baseUrl).href; } catch (e) { continue; }
            }
            if (url.match(/\.(jpg|jpeg|png|gif|webp|mp4|mkv|webm|mov|mp3|wav|ogg|m4a|flac)(\?|$)/i)) return url;
        }
    }
    return null;
};

const uploadToQuax = async (buffer) => {
    const { ext, mime } = await detectType(buffer);
    const form = new FormData();
    form.append('files[]', buffer, { filename: `tmp.${ext}`, contentType: mime });
    const { data } = await axios.post('https://qu.ax/upload.php', form, {
        headers: form.getHeaders(),
        timeout: 60000,
        maxBodyLength: Infinity
    });

    let mediaUrl = typeof data === 'string' ? extractFromHtml(data, 'https://qu.ax') : data.files?.[0]?.url;
    if (!mediaUrl) throw new Error('Upload failed');
    if (mediaUrl.includes('/x/')) return mediaUrl;

    const { data: pageHtml } = await axios.get(mediaUrl, { headers: UA, timeout: 30000 });
    return extractFromHtml(pageHtml, mediaUrl) || mediaUrl;
};

/* =========== Termai.cc Upload =========== */
// المفتاح بيجي من .env  (TERMAI_KEY) — مش متكتب في الكود
// لو الملف صوت مثلًا: uploadTmpfiles(buf, { filename: 'a.mp3', contentType: 'audio/mpeg' })

async function uploadTmpfiles(buffer, options = {}) {
    const key = config.keys.termai;
    if (!key) throw new Error('TERMAI_KEY مش متضاف في ملف .env');

    const detected = options.filename && options.contentType ? null : await detectType(buffer);
    const form = new FormData();
    form.append('file', buffer, {
        filename: options.filename || `file.${detected.ext}`,
        contentType: options.contentType || detected.mime
    });

    const res = await axios.post(
        `https://c.termai.cc/api/upload?key=${encodeURIComponent(key)}`,
        form,
        { headers: form.getHeaders(), timeout: 30000, maxBodyLength: Infinity }
    );

    if (!res.data?.status || !res.data?.path) throw new Error('Upload failed: ' + JSON.stringify(res.data));
    return res.data.path;
}

export {
    uploadToCatbox,
    uploadToQuax,
    uploadTmpfiles,
    createSticker,
    AiChat,
    gifToMp4,
    getBuffer,
    fetchJson,
    sleep,
    tmpPath,
    cleanTmp
};
