// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🤖 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 — AI مع تحكم كامل في الواتساب
//  شات + صور + إدارة جروبات + معلومات ذكية
//  تطوير وإعداد: عـمـر المطور 👑
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch"
import { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync, statSync } from "fs"
import { join, dirname } from "path"

// تم دمج مفتاح السر الخاص بـ ميرو بنجاح ⚡
const GROQ_KEY     = "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"
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
const MODEL_TEXT   = "llama-3.3-70b-versatile"
const MODEL_VISION = "meta-llama/llama-4-scout-17b-16e-instruct"

const BOT_DIR = process.cwd()

// ── كابتشر الكونسل لمراقبة الأخطاء ──────────────────────────────────────────
const consoleLogs = []
const _log = console.log, _err = console.error, _warn = console.warn
const pushLog = (type, args) => {
    consoleLogs.push({ time: Date.now(), line: `[${type}] ${args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ")}` })
    if (consoleLogs.length > 200) consoleLogs.shift()
}
console.log   = (...a) => { _log(...a);  pushLog("LOG",   a) }
console.error = (...a) => { _err(...a);  pushLog("ERROR", a) }
console.warn  = (...a) => { _warn(...a); pushLog("WARN",  a) }

// ── أدوات التحكم في الملفات (للمطور ميرو فقط) ─────────────────────────────────
const fileTools = {
    list_files: ({ path: p = "." }) => {
        const dir = p.startsWith("/") ? p : join(BOT_DIR, p)
        try {
            return readdirSync(dir).map(f => {
                const full = join(dir, f)
                const stat = statSync(full)
                return stat.isDirectory() ? `📁 ${f}/` : `📄 ${f} (${(stat.size/1024).toFixed(1)}KB)`
            }).join("\n")
        } catch (e) { return `Error: ${e.message}` }
    },
    read_file: ({ path: p }) => {
        const full = p.startsWith("/") ? p : join(BOT_DIR, p)
        if (!existsSync(full)) return `Error: File not found: ${p}`
        try { return readFileSync(full, "utf-8").slice(0, 3000) } catch (e) { return `Error: ${e.message}` }
    },
    write_file: ({ path: p, content }) => {
        const full = p.startsWith("/") ? p : join(BOT_DIR, p)
        try {
            mkdirSync(dirname(full), { recursive: true })
            writeFileSync(full, content, "utf-8")
            return `✅ Saved: ${full}`
        } catch (e) { return `Error: ${e.message}` }
    },
    delete_file: ({ path: p }) => {
        const full = p.startsWith("/") ? p : join(BOT_DIR, p)
        if (!existsSync(full)) return `Error: Not found`
        try { unlinkSync(full); return `✅ Deleted: ${p}` } catch (e) { return `Error: ${e.message}` }
    },
    get_console: () => {
        return consoleLogs.slice(-20).map(l =>
            `[${new Date(l.time).toLocaleTimeString("en-US")}] ${l.line}`
        ).join("\n") || "الكونسل فارغ حالياً."
    },
    restart_bot: () => { setTimeout(() => process.exit(0), 1500); return "✅ يتم الآن إعادة تشغيل البوت طيران..." }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ⚡ دالات الفحص الذكي (LID + JID تظبيط نسخة الكمبيوتر)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function extractNum(jid) {
    if (!jid) return ""
    return jid.split("@")[0].split(":")[0]
}

function findMemberJid(metadata, number) {
    const cleanNum = number.replace(/[^0-9]/g, "")
    const member = metadata.participants.find(p => extractNum(p.id) === cleanNum)
    return member ? member.id : cleanNum + "@s.whatsapp.net"
}

function findMember(metadata, number) {
    const cleanNum = number.replace(/[^0-9]/g, "")
    return metadata.participants.find(p => extractNum(p.id) === cleanNum) || null
}

function getDisplayName(conn, jid) {
    try {
        const num = extractNum(jid)
        const name = conn.getName?.(jid)
            || conn.chats?.[jid]?.name
            || conn.chats?.[jid]?.notify
            || conn.chats?.[jid]?.vname
            || conn.chats?.[num + "@s.whatsapp.net"]?.name
            || conn.chats?.[num + "@s.whatsapp.net"]?.notify
            || conn.chats?.[num + "@s.whatsapp.net"]?.vname
            || null
        return name || num
    } catch {
        return extractNum(jid)
    }
}

function formatMember(conn, jid) {
    const num = extractNum(jid)
    const name = getDisplayName(conn, jid)
    return name !== num ? `${name} (${num})` : num
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ⚡ أدوات الجروبات والواتساب التلقائية لـ الـ AI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function buildWhatsAppTools(conn, m, isOwner, isAdmin, isBotAdmin) {
    const tools = {}

    tools.get_group_info = async () => {
        if (!m.isGroup) return "❌ هذا الشات خاص وليس مجموعة."
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const admins = metadata.participants.filter(p => p.admin).map(p => {
                const role = p.admin === "superadmin" ? "👑 صاحب الجروب" : "🛡️ مشرف"
                return `  ${role}: ${formatMember(conn, p.id)}`
            })

            const senderNum = extractNum(m.sender)
            const senderP = metadata.participants.find(p => extractNum(p.id) === senderNum)
            const senderRole = senderP?.admin === "superadmin" ? "👑 أنت صاحب المجموعه" :
                              senderP?.admin === "admin" ? "🛡️ أنت مشرف" : "👤 أنت عضو عادي"

            const botNum = extractNum(conn.user.id)
            const botLid = conn.user.lid ? extractNum(conn.user.lid) : ""
            const botP = metadata.participants.find(p => {
                const pNum = extractNum(p.id)
                return pNum === botNum || (botLid && pNum === botLid)
            })
            const botRole = botP?.admin ? "✅ البوت مشرف هنا" : "❌ البوت ليس مشرفاً"

            return [
                `📋 اسم الجروب: ${metadata.subject}`,
                `📝 الوصف: ${metadata.desc || "لا يوجد وصف"}`,
                `👥 عدد الأعضاء: ${metadata.participants.length}`,
                `🔒 الإعدادات: ${metadata.announce ? "المشرفين فقط يتحدثون" : "الجميع يتحدث"}`,
                ``,
                `${senderRole}`,
                `${botRole}`,
                ``,
                `👑 المشرفين والادارة:`,
                ...admins
            ].join("\n")
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.get_members = async () => {
        if (!m.isGroup) return "❌ لست في مجموعة."
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const members = metadata.participants.map(p => {
                const role = p.admin === "superadmin" ? "👑" : p.admin === "admin" ? "🛡️" : "👤"
                return `${role} ${formatMember(conn, p.id)}`
            })
            return `👥 قائمة الأعضاء (${members.length}):\n${members.join("\n")}`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.close_group = async () => {
        if (!m.isGroup) return "❌ لست في مجموعة."
        if (!isAdmin && !isOwner) return "❌ عذراً، يجب أن تكون مشرف أو مطور لتنفيذ هذا."
        if (!isBotAdmin) return "❌ البوت ليس مشرفاً هنا لتنفيذ الأمر."
        try {
            await conn.groupSettingUpdate(m.chat, "announcement")
            return "✅ تم غلق المجموعة — المشرفين فقط من يمكنهم إرسال الرسائل الآن."
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.open_group = async () => {
        if (!m.isGroup) return "❌ لست في مجموعة."
        if (!isAdmin && !isOwner) return "❌ عذراً، يجب أن تكون مشرف أو مطور لتنفيذ هذا."
        if (!isBotAdmin) return "❌ البوت ليس مشرفاً هنا لتنفيذ الأمر."
        try {
            await conn.groupSettingUpdate(m.chat, "not_announcement")
            return "✅ تم فتح المجموعة — الجميع يمكنهم إرسال الرسائل الآن."
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.change_group_name = async ({ name }) => {
        if (!m.isGroup) return "❌ لست في مجموعة."
        if (!isAdmin && !isOwner) return "❌ يجب أن تكون مشرف أو مطور."
        if (!isBotAdmin) return "❌ البوت ليس مشرفاً."
        if (!name) return "❌ لم يتم تقديم اسم جديد."
        try {
            await conn.groupUpdateSubject(m.chat, name)
            return `✅ تم تغيير اسم المجموعة إلى: ${name}`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.change_group_desc = async ({ description }) => {
        if (!m.isGroup) return "❌ لست في مجموعة."
        if (!isAdmin && !isOwner) return "❌ يجب أن تكون مشرف أو مطور."
        if (!isBotAdmin) return "❌ البوت ليس مشرفاً."
        try {
            await conn.groupUpdateDescription(m.chat, description || "")
            return `✅ تم تحديث وصف المجموعة بنجاح.`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.kick_member = async ({ number }) => {
        if (!m.isGroup) return "❌ لست في مجموعة."
        if (!isAdmin && !isOwner) return "❌ يجب أن تكون مشرف أو مطور."
        if (!isBotAdmin) return "❌ البوت ليس مشرفاً."
        if (!number) return "❌ لم يتم تقديم رقم العضو للطرد."
        const cleanNum = number.replace(/[^0-9]/g, "")
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const member = findMember(metadata, cleanNum)
            if (!member) return `❌ هذا الرقم ${cleanNum} غير موجود بالجروب.`
            const displayName = formatMember(conn, member.id)
            await conn.groupParticipantsUpdate(m.chat, [member.id], "remove")
            return `✅ Kicked: ${displayName}`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.promote_member = async ({ number }) => {
        if (!m.isGroup) return "❌ لست في مجموعة."
        if (!isAdmin && !isOwner) return "❌ يجب أن تكون مشرف أو مطور."
        if (!isBotAdmin) return "❌ البوت ليس مشرفاً."
        if (!number) return "❌ لم يتم تقديم رقم العضو."
        const cleanNum = number.replace(/[^0-9]/g, "")
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const member = findMember(metadata, cleanNum)
            if (!member) return `❌ العضو غير موجود.`
            const displayName = formatMember(conn, member.id)
            await conn.groupParticipantsUpdate(m.chat, [member.id], "promote")
            return `✅ Promoted: ${displayName}`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.demote_member = async ({ number }) => {
        if (!m.isGroup) return "❌ لست في مجموعة."
        if (!isAdmin && !isOwner) return "❌ يجب أن تكون مشرف أو مطور."
        if (!isBotAdmin) return "❌ البوت ليس مشرفاً."
        if (!number) return "❌ لم يتم تقديم رقم."
        const cleanNum = number.replace(/[^0-9]/g, "")
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const member = findMember(metadata, cleanNum)
            if (!member) return `❌ العضو غير موجود.`
            const displayName = formatMember(conn, member.id)
            await conn.groupParticipantsUpdate(m.chat, [member.id], "demote")
            return `✅ Demoted: ${displayName}`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.send_message = async ({ text, to }) => {
        if (!isOwner) return "❌ المطور ميرو فقط من يملك صلاحية الإرسال عبر الـ AI."
        const target = to ? (to.replace(/[^0-9]/g, "") + "@s.whatsapp.net") : m.chat
        try {
            await conn.sendMessage(target, { text })
            return `✅ Message sent.`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.tag_all = async ({ message }) => {
        if (!m.isGroup) return "❌ لست في مجموعة."
        if (!isAdmin && !isOwner) return "❌ يجب أن تكون مشرف أو مطور لإشارة الجميع."
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const mentions = metadata.participants.map(p => p.id)
            const text = message || "📢 تنبيه وهيبة للجميع من الذكاء الاصطناعي!"
            await conn.sendMessage(m.chat, { text, mentions })
            return `✅ Tagged ${mentions.length} members.`
        } catch (e) { return `Error: ${e.message}` }
    }

    tools.get_bot_info = async () => {
        const uptime = process.uptime()
        const days = Math.floor(uptime / 86400)
        const hours = Math.floor((uptime % 86400) / 3600)
        const mins = Math.floor((uptime % 3600) / 60)
        let pluginCount = 0
        for (const name in (global.plugins || {})) {
            if (global.plugins[name]?.command) pluginCount++
        }
        return [
            `🤖 البوت: ${bot.config?.info?.nameBot || "𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪"}`,
            `👤 الرقم المعرف: ${extractNum(conn.user?.id || "")}`,
            `📦 عدد الأوامر المفعلة: ${pluginCount || 10}`,
            `⏰ مدة التشغيل المستمر: ${days} يوم و ${hours} ساعة و ${mins} دقيقة`,
            `🧠 استهلاك الرام الحالي: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}MB`,
        ].join("\n")
    }

    tools.get_user_info = async ({ number }) => {
        const targetNum = number
            ? number.replace(/[^0-9]/g, "")
            : extractNum(m.sender)
        let role = "👤 عضو عادي"
        let displayName = targetNum
        if (m.isGroup) {
            try {
                const metadata = await conn.groupMetadata(m.chat)
                const p = metadata.participants.find(x => extractNum(x.id) === targetNum)
                if (p) {
                    displayName = getDisplayName(conn, p.id)
                    if (p.admin === "superadmin") role = "👑 منشئ المجموعة"
                    else if (p.admin === "admin") role = "🛡️ مشرف الجروب"
                }
            } catch {}
        }
        const isGlobalOwner = bot.config?.owners?.some(o => o.jid?.includes(targetNum) || o.lid?.includes(targetNum)) ? "✅ نعم (المطور الرسمي)" : "❌ لا"
        return [
            `👤 الاسم: ${displayName}`,
            `📱 الرقم: ${targetNum}`,
            `🏷️ الرتبة في الجروب: ${role}`,
            `👑 مطور في البوت: ${isGlobalOwner}`,
        ].join("\n")
    }

    return tools
}

// ── تعريف الأدوات لـ Groq ──────────────────────────────────────────────
const fileToolDefs = [
    { type: "function", function: { name: "list_files", description: "List files in a directory", parameters: { type: "object", properties: { path: { type: "string" } } } } },
    { type: "function", function: { name: "read_file",  description: "Read file content", parameters: { type: "object", required: ["path"], properties: { path: { type: "string" } } } } },
    { type: "function", function: { name: "write_file", description: "Write or create a file", parameters: { type: "object", required: ["path","content"], properties: { path: { type: "string" }, content: { type: "string" } } } } },
    { type: "function", function: { name: "delete_file", description: "Delete a file", parameters: { type: "object", required: ["path"], properties: { path: { type: "string" } } } } },
    { type: "function", function: { name: "get_console", description: "Get last 20 console log lines", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "restart_bot", description: "Restart the bot", parameters: { type: "object", properties: {} } } }
]

const waToolDefs = [
    { type: "function", function: { name: "get_group_info", description: "Get current group info, admins, members count, and check if user is admin", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "get_members", description: "Get full list of group members with roles and names", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "close_group", description: "Close group — only admins can send messages", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "open_group", description: "Open group — everyone can send messages", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "change_group_name", description: "Change group name", parameters: { type: "object", required: ["name"], properties: { name: { type: "string" } } } } },
    { type: "function", function: { name: "change_group_desc", description: "Change group description", parameters: { type: "object", required: ["description"], properties: { description: { type: "string" } } } } },
    { type: "function", function: { name: "kick_member", description: "Kick a member from the group by phone number. Returns success with name or error.", parameters: { type: "object", required: ["number"], properties: { number: { type: "string", description: "Phone number like 201234567890" } } } } },
    { type: "function", function: { name: "promote_member", description: "Promote a member to admin by phone number", parameters: { type: "object", required: ["number"], properties: { number: { type: "string" } } } } },
    { type: "function", function: { name: "demote_member", description: "Demote an admin to member by phone number", parameters: { type: "object", required: ["number"], properties: { number: { type: "string" } } } } },
    { type: "function", function: { name: "send_message", description: "Send a message to a chat (owner only)", parameters: { type: "object", required: ["text"], properties: { text: { type: "string" }, to: { type: "string", description: "Phone number (optional)" } } } } },
    { type: "function", function: { name: "tag_all", description: "Tag/mention all group members", parameters: { type: "object", properties: { message: { type: "string" } } } } },
    { type: "function", function: { name: "get_bot_info", description: "Get bot status, uptime, plugins count", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "get_user_info", description: "Get info about a user — name, role, admin status", parameters: { type: "object", properties: { number: { type: "string", description: "Phone number (optional, default is sender)" } } } } },
]

// ── موجهات النظام الذكي للـ AI ─────────────────────────────────────────────
const SYSTEM_USER = `أنت 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 — مساعد ذكاء اصطناعي فخم مدمج في بوت واتساب. صُنعت وطُوّرت بواسطة المطور والمهندس عـمـر (ميرو).

عندك أدوات تتحكم بيها في الجروب تلقائياً:
- get_group_info: تجيب معلومات الجروب والمشرفين بأسمائهم
- get_members: تجيب قائمة كل الأعضاء بأسمائهم
- close_group / open_group: تقفل أو تفتح الجروب
- change_group_name / change_group_desc: تغيّر اسم أو وصف الجروب
- kick_member / promote_member / demote_member: تطرد أو ترقّي أو تنزّل عضو
- tag_all: تعمل منشن لكل الأعضاء
- get_bot_info: معلومات البوت
- get_user_info: معلومات عضو معين بالاسم

قواعد مهمة جداً:
1. لو حد سألك عن الجروب أو المشرفين أو الأعضاء — استخدم الأدوات فوراً
2. لو حد قال "اقفل الجروب" أو "افتح الجروب" — استخدم الأدوات المناسبة
3. الأوامر اللي بتحتاج صلاحية — الأدوات بتتحقق تلقائي، لو رجعتلك رفض قول للشخص إن معندوش صلاحية
4. تجاوب بالعربي دايماً وبطريقة فخمة ومروقة تليق بهيبة ميرو بوت
5. لما أداة ترجع نتيجة تبدأ بـ "✅" — معناها نجحت، صغ النتيجة بالعربي بفخر وسعادة
6. لا تذكر اسم موديل الذكاء الاصطناعي أو الشركة (مثل Llama أو Meta) أبداً، أنت 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 وبس.`

const SYSTEM_OWNER = `أنت 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 — مساعد AI مع تحكم كامل ومطلق في ملفات البوت والسيرفر. صُنعت بواسطة المطور عـمـر (ميرو).
مجلد البوت الحالي: ${BOT_DIR}

عندك أدوات ملفات: list_files, read_file, write_file, delete_file, get_console, restart_bot
وعندك أدوات واتساب كاملة للتحكم في الجروب والدردشات.

قواعد التعامل مع المطور ميرو:
1. نفذ طلباته البرمجية فوراً باستخدام الأدوات المناسبة.
2. لما يطلب قراءة ملف أو تعديل كود، استخدم أداة الملفات واعرض النتيجة واضحة.
3. تجاوب باللغة العربية بأسلوب راقٍ وودّي.`

// ── تشغيل الاتصال والوظائف الذكية عبر الذكاء الاصطناعي ────────────────────────
async function askText(messages, allTools, allToolFns, isOwner = false) {
    const msgs = [...messages]
    const calledTools = new Set()

    for (let i = 0; i < 5; i++) {
        const body = { model: MODEL_TEXT, messages: msgs, max_tokens: 2048, temperature: 0.7 }

        const lastMsg = msgs[msgs.length - 1]?.content || ""
        const needsWaTools = /جروب|مجموع|مشرف|ادمن|اعضاء|اقفل|افتح|طرد|اطرد|ترقي|رقي|نزل|تنزيل|تاق|منشن|بوت|معلومات|admin|group|member|kick|promote|demote|close|open|tag|انا مشرف|هل انا|مين صاحب|owner/i.test(lastMsg)
        const needsFileTools = isOwner && /اقرا|قرا|اكتب|احذف|امسح|ls|ملفات|كونسل|ريستارت|read|write|delete|list|console|restart/i.test(lastMsg)

        if (needsWaTools || needsFileTools) {
            const activeDefs = []
            if (needsWaTools) activeDefs.push(...waToolDefs)
            if (needsFileTools) activeDefs.push(...fileToolDefs)
            body.tools = activeDefs
            body.tool_choice = "auto"
        }

        const res = await fetch(GROQ_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
            body: JSON.stringify(body)
        })
        if (!res.ok) throw new Error(`Groq Error ${res.status}: ${await res.text()}`)
        const data = await res.json()
        const msg = data.choices[0].message

        if (!msg.tool_calls?.length) return msg.content || ""

        msgs.push(msg)
        for (const tc of msg.tool_calls) {
            const toolKey = `${tc.function.name}:${tc.function.arguments}`
            if (calledTools.has(toolKey)) {
                msgs.push({ role: "tool", tool_call_id: tc.id, content: "Already called this tool with same arguments." })
                continue
            }
            calledTools.add(toolKey)

            const fn = allToolFns[tc.function.name]
            let result
            if (fn) {
                try {
                    const args = JSON.parse(tc.function.arguments || "{}")
                    result = await fn(args)
                } catch (e) {
                    result = `Error: ${e.message}`
                }
            } else {
                result = `Unknown tool: ${tc.function.name}`
            }
            msgs.push({ role: "tool", tool_call_id: tc.id, content: String(result) })
        }
    }
    return "تعذر على الـ AI جلب رد، حاول مجدداً يا حب."
}
async function askVision(imageBase64, mimeType, prompt) {
    const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({
            model: MODEL_VISION,
            messages: [{
                role: "user",
                content: [
                    { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
                    { type: "text", text: prompt || "صف هذه الصورة بالتفصيل بالعربي" }
                ]
            }],
            max_tokens: 1024
        })
    })
    if (!res.ok) throw new Error(`Vision ${res.status}`)
    return (await res.json()).choices[0].message.content
}

// ── ذاكرة التخزين المؤقت للمحادثات ──────────────────────────────────────────
const chats = new Map()
function getHistory(sender) {
    if (!chats.has(sender)) chats.set(sender, [])
    return chats.get(sender)
}

// ── تشغيل الهاندلر الأساسي للأمر ─────────────────────────────────────────────
let handler = async (m, { conn, args, text, usedPrefix, command, bot }) => {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }) } catch {}
    }
    const reply = async (txt) => {
        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    }

    const sub = args[0]?.toLowerCase()

    if (/^(مسح|clear|reset|جديد)$/.test(sub)) {
        chats.delete(m.sender)
        await react("🗑️")
        return reply("✅ تم مسح الذاكرة وبدء محادثة جديدة بنجاح يا حب!")
}
  if (!text?.trim()) {
        await react("🤖")
        return reply(
            `╔═══「 🤖 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 」═══╗\n│\n` +
            `│ 💬 ${usedPrefix}${command} <سؤالك للذكاء الاصطناعي>\n` +
            `│ 🖼️ ارسل صورة + اكتب ${usedPrefix}${command} لتحليلها\n` +
            `│ 🌐 ${usedPrefix}${command} ترجم <النص للترجمة فوراً>\n` +
            `│ 📝 ${usedPrefix}${command} لخص <النص لتلخيصه في نقاط>\n` +
            `│ 💻 ${usedPrefix}${command} كود <اكتب كود برمجى كامل>\n` +
            `│ 🗑️ ${usedPrefix}${command} مسح (لتصفير الذاكرة)\n` +
            `│\n` +
            `│ ⚡ *أمثلة أوامر تفاعلية ذكية للجروب:*\n` +
            `│ 💬 "مين المشرفين هنا؟"\n` +
            `│ 💬 "اقفل الجروب يا بوت"\n` +
            `│ 💬 "تاق للكل بسرعة"\n` +
            `│\n╚══════════════════════╝`
        )
    }

    await react("⏳")
  // فحص الصلاحيات الذكي المتوافق بالملي مع سورس ميرو
    let isAdmin = false
    let isBotAdmin = false
    if (m.isGroup) {
        try {
            const metadata = await conn.groupMetadata(m.chat)
            const botNum = extractNum(conn.user.id)
            const botLid = conn.user.lid ? extractNum(conn.user.lid) : ""
            const senderNum = extractNum(m.sender)

            isAdmin = metadata.participants.some(p => extractNum(p.id) === senderNum && p.admin)
            isBotAdmin = metadata.participants.some(p => {
                const pNum = extractNum(p.id)
                return (pNum === botNum || (botLid && pNum === botLid)) && p.admin
            })
        } catch {}
    }
    
    // ربط فحص المطور المعتمد على سورس ميرو (تعديل الأمان والـ JID)
    const isOwner = bot.config?.owners?.some(o => o.jid?.includes(extractNum(m.sender)) || o.lid?.includes(extractNum(m.sender)))

    const waTools = buildWhatsAppTools(conn, m, isOwner, isAdmin, isBotAdmin)
    const allToolFns = { ...waTools, ...(isOwner ? fileTools : {}) }

    try {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const imgMsg = m.message?.imageMessage || quoted?.imageMessage

        // معالجة رؤية وفحص الصور عبر الذكاء الاصطناعي
        if (imgMsg) {
            const { downloadMediaMessage } = await import("@whiskeysockets/baileys")
            const buffer = await downloadMediaMessage(imgMsg === m.message?.imageMessage ? m : { message: quoted }, "buffer", {})
            const base64 = buffer.toString("base64")
            const mimeType = imgMsg.mimetype || "image/jpeg"
            const prompt = text.replace(/^(ai|ذكاء|مساعد)/i, "").trim() || "اشرح هذه الصورة بالتفصيل"
            const answer = await askVision(base64, mimeType, prompt)
            await react("✅")
            return reply(answer)
        }

        // أمر الترجمة الفرعي السريع
        if (/^ترجم|translate/i.test(sub)) {
            const toTranslate = args.slice(1).join(" ")
            if (!toTranslate) return reply("❌ اكتب النص المراد ترجمته بعد كلمة ترجم")
            const answer = await askText([
                { role: "system", content: "أنت مترجم محترف من وإلى جميع لغات العالم. رجع الترجمة الصحيحة فقط بدون نصوص إضافية." },
                { role: "user", content: `ترجم النص التالي:\n${toTranslate}` }
            ], [], allToolFns)
            await react("✅")
            return reply(`🌐 *الترجمة المروقة:*\n${answer}`)
        }
      // أمر التلخيص الفرعي السريع
        if (/^لخص|summarize/i.test(sub)) {
            const toSum = args.slice(1).join(" ")
            if (!toSum) return reply("❌ اكتب النص بعد كلمة لخص")
            const answer = await askText([
                { role: "system", content: "لخص النص المكتوب في نقاط مختصرة جداً وباللغة العربية." },
                { role: "user", content: toSum }
            ], [], allToolFns)
            await react("✅")
            return reply(`📝 *الملخص الذكي:*\n${answer}`)
        }

        // أمر البرمجة وكتابة الأكواد
        if (/^كود|code/i.test(sub)) {
            const task = args.slice(1).join(" ")
            if (!task) return reply("❌ اكتب المهمة البرمجية بعد كلمة كود")
            const answer = await askText([
                { role: "system", content: "أنت مهندس برمجيات خبير. اكتب كوداً برمجياً نظيفاً، خالياً من الأخطاء، ومع تعليقات توضيحية." },
                { role: "user", content: task }
            ], [], allToolFns)
            await react("✅")
            return reply(`💻 *الكود البرمجي:*\n${answer}`)
        }

        const history = getHistory(m.sender)
        const system = isOwner ? SYSTEM_OWNER : SYSTEM_USER

        history.push({ role: "user", content: text.trim() })
        if (history.length > 16) history.splice(0, 2) // الحفاظ على حجم الذاكرة مستقر

        const messages = [{ role: "system", content: system }, ...history]
        const answer = await askText(messages, [...waToolDefs, ...(isOwner ? fileToolDefs : [])], allToolFns, isOwner)

        history.push({ role: "assistant", content: answer })

        await react("✅")
        return reply(answer)

    } catch (err) {
        console.error("AI Error:", err.message)
        await react("❌")
        let msg = "❌ حدث خطأ داخلي: " + err.message
        if (err.message.includes("401")) msg = "🔑 مفتاح الـ API Key الخاص بك غير صالح أو تم حظره من الموقع."
        if (err.message.includes("429")) msg = "⏳ تم الوصول للحد الأقصى للاستهلاك المجاني، انتظر دقيقة وأعد المحاولة."
        return reply(msg)
    }
}

handler.help    = ["ai <سؤال>"]
handler.tags    = ["ai"]
handler.command = /^(ai|ذكاء|مساعد|اسال|ask|gpt|مس|ميرو)$/i

export default handler
