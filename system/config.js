/* ════════════════════════════════════════════════════════════
   config.js — كل إعدادات البوت في مكان واحد

   - القيم السرية (مفاتيح API) مكانها ملف .env (مش بيترفع على GitHub)
   - باقي الإعدادات ليها قيم افتراضية هنا، وتقدر تغيرها من .env بدون ما تلمس الكود
   - شوف .env.example لقايمة المتغيرات
   ════════════════════════════════════════════════════════════ */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

/* ───────── قراءة .env (بدون مكتبات خارجية) ───────── */
function loadEnv(file) {
    try {
        if (!fs.existsSync(file)) return;
        for (const line of fs.readFileSync(file, 'utf-8').split(/\r?\n/)) {
            const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?\s*$/);
            if (!m) continue;
            let val = (m[2] ?? '').trim();
            if (/^(['"]).*\1$/.test(val)) val = val.slice(1, -1);
            if (process.env[m[1]] === undefined) process.env[m[1]] = val;
        }
    } catch (e) {
        console.error('⚠️ config: تعذر قراءة .env:', e.message);
    }
}
loadEnv(path.join(ROOT, '.env'));

const env = (key, fallback = '') => {
    const v = process.env[key];
    return v === undefined || v === '' ? fallback : v;
};
const list = (key, fallback = []) => {
    const v = env(key);
    return v ? v.split(',').map((s) => s.trim()).filter(Boolean) : fallback;
};
const digits = (s) => String(s ?? '').replace(/\D/g, '');

/* ───────── الإعدادات الأساسية ───────── */
const botNumber = digits(env('BOT_NUMBER', '201158601817'));

// المطورين: رقم البوت هو المطور الأساسي، وتقدر تضيف أرقام تانية في .env
// OWNER_NUMBERS=2010xxxxxxx,2011xxxxxxx
const ownerNumbers = [...new Set([botNumber, ...list('OWNER_NUMBERS').map(digits)])].filter(Boolean);
const owners = ownerNumbers.map((n, i) => ({
    name: i === 0 ? env('OWNER_NAME', 'Mero') : `Owner ${i + 1}`,
    lid: `${n}@lid`,
    jid: `${n}@s.whatsapp.net`
}));

const botName = env('BOT_NAME', '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️');

const config = {
    phoneNumber: botNumber,
    prefix: list('PREFIX', ['.', '/', '!']),
    fromMe: env('FROM_ME', 'true') !== 'false',   // البوت يرد على رسايل رقمه كمان
    owners,
    commandsPath: './plugins',
    pairCode: env('PAIR_CODE', 'AAAAAAAA'),       // كود ربط البوتات الفرعية (8 حروف/أرقام)

    info: {
        nameBot: botName,
        nameChannel: env('CHANNEL_NAME', botName),
        idChannel: env('CHANNEL_ID', '0029Vb8Q2Q56WaKx5Qk8QM2y@newsletter'),
        urls: {
            repo: env('REPO_URL', 'https://github.com/omartegany8-create/Omar_Tegany'),
            api: env('API_URL', ''),
            channel: env('CHANNEL_URL', 'https://whatsapp.com/channel/0029Vb8Q2Q56WaKx5Qk8QM2y')
        },
        copyright: {
            pack: env('STICKER_PACK', botName),
            author: env('STICKER_AUTHOR', botName)
        },
        images: [
            'https://i.pinimg.com/originals/11/26/97/11269786cdb625c60213212aa66273a9.png',
            'https://i.pinimg.com/originals/e2/21/20/e221203f319df949ee65585a657501a2.jpg',
            'https://i.pinimg.com/originals/bb/77/0f/bb770fad66a634a6b3bf93e9c00bf4e5.jpg'
        ]
    },

    // مفاتيح خارجية (من .env فقط — متتكتبش هنا)
    keys: {
        termai: env('TERMAI_KEY', '')
    }
};

/* ───────── دوال مساعدة عامة (متاحة لأي أمر) ───────── */

// تحويل أي JID/LID/رقم لرقم فقط
export const toNumber = (id) => digits(String(id ?? '').split('@')[0].split(':')[0]);

// هل الـ id ده مطور؟  استخدمها في أي أمر:  if (global.isBotOwner(m.sender)) ...
export const isBotOwner = (id) => {
    const n = toNumber(id);
    return !!n && owners.some((o) => toNumber(o.jid) === n || toNumber(o.lid) === n);
};

export default config;
