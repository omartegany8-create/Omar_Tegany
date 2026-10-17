/* ════════════════════════════════════════════════════════════
   UltraDB — قاعدة بيانات JSON بسيطة وآمنة للبوت

   الاستخدام (نفس الطريقة القديمة بالظبط، متوافق مع كل الأوامر):
     global.db.users[m.sender].xp = (global.db.users[m.sender].xp || 0) + 10
     global.db.groups[m.chat].antiLink = true
     global.db.groups[m.chat].warnings ??= {}
     global.db.groups[m.chat].warnings[id] = 2      ← التعديل العميق بيتحفظ
     global.db.users[id].items.push("x")            ← الـ push كمان بيتحفظ

   الضمانات:
     ✔ أي تعديل (حتى جوه أوبجكت أو مصفوفة) بيتحفظ تلقائيًا
     ✔ القيم 0 و false و "" بتتخزن عادي
     ✔ الحفظ آمن: بيتكتب ملف مؤقت وبعدين بيتبدل (مفيش ملف نص مكتوب)
     ✔ لو الملف باظ: بيتنقل لملف .corrupt وبيرجع آخر نسخة احتياطية (.bak)
     ✔ بيتحفظ لوحده عند إغلاق البوت (Ctrl+C / إيقاف السيرفر)
     ✔ ids مش صالحة (@lid / @newsletter ...) مبتكسرش الأمر ومبتتخزنش

   ملحوظة: القيم لازم تكون JSON عادي (نص / رقم / true-false / مصفوفة / أوبجكت).
   ════════════════════════════════════════════════════════════ */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SAVE_DELAY = 250;          // مهلة تجميع التعديلات قبل الكتابة
const SAVE_MAX_WAIT = 3000;      // أقصى مدة ممكن الحفظ يتأجلها
const BACKUP_EVERY = 5 * 60_000; // نسخة احتياطية كل 5 دقايق على الأكثر
const EPHEMERAL_LIMIT = 500;     // عدد الكائنات المؤقتة للـ ids غير الصالحة

const isObj = (v) => v !== null && typeof v === 'object';
const isTrackable = (v) => {
    if (Array.isArray(v)) return true;
    if (!isObj(v)) return false;
    const proto = Object.getPrototypeOf(v);
    return proto === Object.prototype || proto === null;
};

let hooksInstalled = false;

class UltraDB {
    #file;
    #dir;
    #raw;                     // البيانات الحقيقية
    #proxyToRaw = new WeakMap();
    #rawToProxy = new WeakMap();
    #ephemeral = new Map();   // كائنات مؤقتة للـ ids غير الصالحة
    #dirty = false;
    #timer = null;
    #firstDirtyAt = 0;
    #lastBackup = 0;
    #lastErrorAt = 0;

    constructor(options = {}) {
        const envPath = process.env.DB_PATH;
        this.#file = path.resolve(options.path || envPath || path.join(ROOT, 'data', 'database.json'));
        this.#dir = path.dirname(this.#file);
        fs.mkdirSync(this.#dir, { recursive: true });

        this.#migrateLegacy();
        this.#raw = this.#load();

        const root = this.#wrap(this.#raw, 'root');
        if (options.autoFlush !== false) this.#installExitHooks();
        return root;
    }

    /* ───────────── تحميل / ترحيل ───────────── */

    // لو كان عندك database.json قديم جوه system/ بيتنقل مرة واحدة للمكان الجديد
    #migrateLegacy() {
        try {
            const legacy = path.join(__dirname, 'database.json');
            if (path.resolve(legacy) === this.#file) return;
            if (fs.existsSync(this.#file)) return;
            if (!fs.existsSync(legacy)) return;
            if (!fs.readFileSync(legacy, 'utf-8').trim()) return;
            fs.copyFileSync(legacy, this.#file);
            console.log('📦 UltraDB: تم نقل قاعدة البيانات القديمة إلى', this.#file);
        } catch (e) {
            console.error('⚠️ UltraDB: فشل ترحيل الملف القديم:', e.message);
        }
    }

    #normalize(data) {
        if (!isObj(data) || Array.isArray(data)) data = {};
        if (!isObj(data.groups) || Array.isArray(data.groups)) data.groups = {};
        if (!isObj(data.users) || Array.isArray(data.users)) data.users = {};
        if (typeof data.dev !== 'boolean') data.dev = false;
        return data;
    }

    #readJSON(file) {
        const text = fs.readFileSync(file, 'utf-8');
        if (!text.trim()) return null;           // ملف فاضي = قاعدة جديدة
        return JSON.parse(text);
    }

    #load() {
        const bak = this.#file + '.bak';

        if (fs.existsSync(this.#file)) {
            try {
                const parsed = this.#readJSON(this.#file);
                return this.#normalize(parsed);
            } catch (e) {
                // الملف باظ: نحفظه بدل ما نمسحه، وبعدين نجرب النسخة الاحتياطية
                const corrupt = `${this.#file}.corrupt-${Date.now()}`;
                try { fs.renameSync(this.#file, corrupt); } catch {}
                console.error(`❌ UltraDB: الملف تالف (${e.message}). اتحفظ في: ${corrupt}`);
            }
        }

        if (fs.existsSync(bak)) {
            try {
                const parsed = this.#readJSON(bak);
                if (parsed) {
                    console.warn('♻️ UltraDB: تم الرجوع لآخر نسخة احتياطية سليمة.');
                    this.#dirty = true;
                    this.#schedule();
                    return this.#normalize(parsed);
                }
            } catch (e) {
                console.error('❌ UltraDB: النسخة الاحتياطية تالفة كمان:', e.message);
            }
        }

        return this.#normalize({});
    }

    /* ───────────── الحفظ ───────────── */

    #schedule() {
        const now = Date.now();
        if (!this.#firstDirtyAt) this.#firstDirtyAt = now;
        if (this.#timer) clearTimeout(this.#timer);
        const wait = Math.max(0, Math.min(SAVE_DELAY, this.#firstDirtyAt + SAVE_MAX_WAIT - now));
        this.#timer = setTimeout(() => this.#flush(), wait);
        this.#timer.unref?.();
    }

    #touch() {
        this.#dirty = true;
        this.#schedule();
    }

    // بيشيل الكيانات الفاضية (اللي اتعملت بمجرد القراءة) قبل الحفظ
    #snapshot() {
        const out = { ...this.#raw, groups: {}, users: {} };
        for (const kind of ['groups', 'users']) {
            for (const [id, val] of Object.entries(this.#raw[kind])) {
                if (isObj(val) && Object.keys(val).length > 0) out[kind][id] = val;
            }
        }
        return JSON.stringify(out, null, 2);
    }

    #flush() {
        if (this.#timer) { clearTimeout(this.#timer); this.#timer = null; }
        this.#firstDirtyAt = 0;
        if (!this.#dirty) return true;

        try {
            const json = this.#snapshot();
            const tmp = this.#file + '.tmp';

            // نسخة احتياطية من آخر نسخة سليمة (مش كل مرة، عشان الأداء)
            const now = Date.now();
            if (fs.existsSync(this.#file) && now - this.#lastBackup > BACKUP_EVERY) {
                fs.copyFileSync(this.#file, this.#file + '.bak');
                this.#lastBackup = now;
            }

            fs.writeFileSync(tmp, json);
            fs.renameSync(tmp, this.#file);
            this.#dirty = false;
            return true;
        } catch (e) {
            // مبنبلعش الخطأ: بنطبعه (مرة كل 30 ثانية) وبنفضل نحاول تاني
            const now = Date.now();
            if (now - this.#lastErrorAt > 30_000) {
                console.error('❌ UltraDB: فشل الحفظ:', e.message);
                this.#lastErrorAt = now;
            }
            this.#schedule();
            return false;
        }
    }

    #installExitHooks() {
        if (hooksInstalled) return;
        hooksInstalled = true;
        const flush = () => { try { this.#flush(); } catch {} };
        process.on('exit', flush);
        process.on('beforeExit', flush);
        for (const sig of ['SIGINT', 'SIGTERM']) {
            process.once(sig, () => { flush(); process.exit(sig === 'SIGINT' ? 130 : 143); });
        }
    }

    /* ───────────── Proxy عميق ───────────── */

    #isValidId(id, kind) {
        if (typeof id !== 'string' || !id.includes('@')) return false;
        if (id.includes('@newsletter') || id.includes('@lid') || id.includes('@broadcast')) return false;
        if (kind === 'groups') return id.endsWith('@g.us');
        return true;
    }

    #unwrap(v) {
        return (isObj(v) && this.#proxyToRaw.get(v)) || v;
    }

    // بيلف أي أوبجكت/مصفوفة في Proxy بيراقب التعديل (ويرجع نفس الـ Proxy كل مرة)
    #wrap(target, mode = 'deep', kind = null) {
        const cacheKey = mode === 'deep' ? target : null;
        if (cacheKey && this.#rawToProxy.has(cacheKey)) return this.#rawToProxy.get(cacheKey);

        const self = this;
        const handler = {
            get(t, prop, receiver) {
                if (mode === 'root') {
                    if (prop === 'groups' || prop === 'group') return self.#container('groups');
                    if (prop === 'users' || prop === 'user') return self.#container('users');
                    if (prop === 'save') return () => self.#flush();
                }
                const v = Reflect.get(t, prop, receiver);
                return isTrackable(v) ? self.#wrap(v) : v;
            },
            set(t, prop, val, receiver) {
                if (mode === 'root' && (prop === 'groups' || prop === 'users')) {
                    t[prop] = isTrackable(val) && !Array.isArray(val) ? self.#unwrap(val) : {};
                    self.#touch();
                    return true;
                }
                Reflect.set(t, prop, self.#unwrap(val), t);
                self.#touch();
                return true;
            },
            deleteProperty(t, prop) {
                const had = prop in t;
                const ok = Reflect.deleteProperty(t, prop);
                if (had) self.#touch();
                return ok;
            }
        };

        const proxy = new Proxy(target, handler);
        this.#proxyToRaw.set(proxy, target);
        if (cacheKey) this.#rawToProxy.set(cacheKey, proxy);
        else if (mode === 'root') this.#rawToProxy.set(target, proxy);
        return proxy;
    }

    // db.groups / db.users: إنشاء تلقائي للكيان عند القراءة + حماية من الـ ids الغلط
    #container(kind) {
        const store = this.#raw[kind];
        if (this.#rawToProxy.has(store)) return this.#rawToProxy.get(store);

        const self = this;
        const proxy = new Proxy(store, {
            get(t, id, receiver) {
                if (typeof id === 'symbol') return Reflect.get(t, id, receiver);
                if (!self.#isValidId(id, kind)) {
                    // خصائص عادية زي length / hasOwnProperty / toJSON ...
                    if (id in t || id in Object.prototype) return Reflect.get(t, id, receiver);
                    return self.#ephemeralFor(kind, id);
                }
                if (!isObj(t[id])) t[id] = {};
                return self.#wrap(t[id]);
            },
            set(t, id, val) {
                if (!self.#isValidId(id, kind)) return true;   // نتجاهله بدل ما نرمي خطأ
                if (isTrackable(val) && !Array.isArray(val)) t[id] = self.#unwrap(val);
                else delete t[id];
                self.#touch();
                return true;
            },
            deleteProperty(t, id) {
                const had = id in t;
                delete t[id];
                if (had) self.#touch();
                return true;
            }
        });
        this.#rawToProxy.set(store, proxy);
        return proxy;
    }

    // كائن مؤقت (في الذاكرة بس) للـ ids غير الصالحة عشان الأمر ميقعش
    #ephemeralFor(kind, id) {
        const key = `${kind}:${id}`;
        let obj = this.#ephemeral.get(key);
        if (!obj) {
            if (this.#ephemeral.size >= EPHEMERAL_LIMIT) {
                this.#ephemeral.delete(this.#ephemeral.keys().next().value);
            }
            obj = {};
            this.#ephemeral.set(key, obj);
        }
        return obj;
    }
}

export default UltraDB;
