const spamMap = new Map()

// ── ضد لينك ───────────────────────────────────────────────────────────────
let antilink = async (m, { conn, isAdmin, isBotAdmin, isROwner }) => {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }) } catch {}
    }

    if (!m.isGroup) return m.reply("❌ للمجموعات فقط")
    if (!isAdmin && !isROwner) return m.reply("❌ للأدمن فقط")

    const db    = global.db.data.chats[m.chat] ||= {}
    const state = db.antiLink

    if (state) {
        db.antiLink = false
        await react("🔴")
        m.reply(
          `*╔═━═━═━ ◦ • ⊰🔗⊱ • ◦ ━═━═━═╗*\n` +
          `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
          `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
          `*🔴 تم إيقاف الحماية من اللينكات بنجاح*\n\n` +
          `*╔═━═━═━ ◦ • ⊰🕷️⊱ • ◦ ━═━═━═╗*\n` +
          `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
          `*╚═━═━═━ ◦ • ⊰🔗⊱ • ◦ ━═━═━═╝*`
        )
    } else {
        db.antiLink = true
        await react("🟢")
        m.reply(
          `*╔═━═━═━ ◦ • ⊰🔗⊱ • ◦ ━═━═━═╗*\n` +
          `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
          `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
          `*🟢 تم تفعيل الحماية من اللينكات*\n` +
          `*⚠️ أي عضو سيرسل رابطاً سيتم طرده تلقائياً*\n\n` +
          `*╔═━═━═━ ◦ • ⊰🕷️⊱ • ◦ ━═━═━═╗*\n` +
          `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
          `*╚═━═━═━ ◦ • ⊰🔗⊱ • ◦ ━═━═━═╝*`
        )
    }
}
antilink.help    = ["ضد_لينك"]
antilink.tags    = ["protection"]
antilink.command = /^(ضد_لينك|ضدلينك|antilink)$/i
antilink.group   = true
antilink.admin   = true

// ── ضد بوت ────────────────────────────────────────────────────────────────
let antibot = async (m, { conn, isAdmin, isROwner }) => {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }) } catch {}
    }

    if (!m.isGroup) return m.reply("❌ للمجموعات فقط")
    if (!isAdmin && !isROwner) return m.reply("❌ للأدمن فقط")

    const db    = global.db.data.chats[m.chat] ||= {}
    const state = db.antiBot

    if (state) {
        db.antiBot = false
        await react("🔴")
        m.reply(
          `*╔═━═━═━ ◦ • ⊰🤖⊱ • ◦ ━═━═━═╗*\n` +
          `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
          `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
          `*🔴 تم إيقاف الحماية من البوتات بنجاح*\n\n` +
          `*╔═━═━═━ ◦ • ⊰🕷️⊱ • ◦ ━═━═━═╗*\n` +
          `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
          `*╚═━═━═━ ◦ • ⊰🤖⊱ • ◦ ━═━═━═╝*`
        )
    } else {
        db.antiBot = true
        await react("🟢")
        m.reply(
          `*╔═━═━═━ ◦ • ⊰🤖⊱ • ◦ ━═━═━═╗*\n` +
          `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
          `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
          `*🟢 تم تفعيل الحماية من البوتات*\n` +
          `*⚠️ أي بوت جديد ينضم سيتم طرده تلقائياً*\n\n` +
          `*╔═━═━═━ ◦ • ⊰🕷️⊱ • ◦ ━═━═━═╗*\n` +
          `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
          `*╚═━═━═━ ◦ • ⊰🤖⊱ • ◦ ━═━═━═╝*`
        )
    }
}
antibot.help    = ["ضد_بوت"]
antibot.tags    = ["protection"]
antibot.command = /^(ضد_بوت|ضدبوت|antibot)$/i
antibot.group   = true
antibot.admin   = true

// ── ضد سبام ───────────────────────────────────────────────────────────────
let antispam = async (m, { conn, isAdmin, isROwner }) => {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }) } catch {}
    }

    if (!m.isGroup) return m.reply("❌ للمجموعات فقط")
    if (!isAdmin && !isROwner) return m.reply("❌ للأدمن فقط")

    const db    = global.db.data.chats[m.chat] ||= {}
    const state = db.antiSpam

    if (state) {
        db.antiSpam = false
        await react("🔴")
        m.reply(
          `*╔═━═━═━ ◦ • ⊰💬⊱ • ◦ ━═━═━═╗*\n` +
          `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
          `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
          `*🔴 تم إيقاف الحماية من السبام بنجاح*\n\n` +
          `*╔═━═━═━ ◦ • ⊰🕷️⊱ • ◦ ━═━═━═╗*\n` +
          `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
          `*╚═━═━═━ ◦ • ⊰💬⊱ • ◦ ━═━═━═╝*`
        )
    } else {
        db.antiSpam = true
        await react("🟢")
        m.reply(
          `*╔═━═━═━ ◦ • ⊰💬⊱ • ◦ ━═━═━═╗*\n` +
          `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
          `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
          `*🟢 تم تفعيل الحماية من السبام*\n` +
          `*⚠️ من يرسل أكثر من 5 رسائل في 5 ثوانٍ سيتم طرده*\n\n` +
          `*╔═━═━═━ ◦ • ⊰🕷️⊱ • ◦ ━═━═━═╗*\n` +
          `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
          `*╚═━═━═━ ◦ • ⊰💬⊱ • ◦ ━═━═━═╝*`
        )
    }
}
antispam.help    = ["ضد_سبام"]
antispam.tags    = ["protection"]
antispam.command = /^(ضد_سبام|ضدسبام|antispam)$/i
antispam.group   = true
antispam.admin   = true

// ── all.js — تطبيق الحماية الزخرفية ─────────────────────
antispam.all = async function (m) {
    if (!m.isGroup || !m.sender) return

    const db = global.db.data.chats?.[m.chat] || {}

    // ── تطبيق ضد السبام ────────────────────────────────────────────────
    if (db.antiSpam) {
        const key  = `${m.chat}:${m.sender}`
        const now  = Date.now()
        const data = spamMap.get(key) || { count: 0, first: now }

        if (now - data.first < 5000) {
            data.count++
            if (data.count >= 5) {
                try {
                    await this.sendMessage(m.chat, {
                        text: `*╔═━═━═━ ◦ • ⊰⚠️⊱ • ◦ ━═━═━═╗*\n` +
                              `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
                              `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
                              `*⚠️ تم طرد العضو @${m.sender.split("@")[0]} بسبب إرسال سبام مفرط!*`,
                        mentions: [m.sender]
                    })
                    await this.groupParticipantsUpdate(m.chat, [m.sender], "remove")
                } catch {}
                spamMap.delete(key)
                return
            }
        } else {
            data.count = 1
            data.first = now
        }
        spamMap.set(key, data)
    }

    // ── تطبيق ضد اللينك ─────────────────────────────────────────────────
    if (db.antiLink) {
        const linkRegex = /https?:\/\/|wa\.me\/|chat\.whatsapp\.com\//i
        if (linkRegex.test(m.text || "")) {
            try {
                await this.sendMessage(m.chat, {
                    text: `*╔═━═━═━ ◦ • ⊰⚠️⊱ • ◦ ━═━═━═╗*\n` +
                          `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
                          `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
                          `*⚠️ تم طرد العضو @${m.sender.split("@")[0]} بسبب إرسال روابط غير مسموحة!*`,
                    mentions: [m.sender]
                })
                await this.groupParticipantsUpdate(m.chat, [m.sender], "remove")
            } catch {}
        }
    }
}

export { antilink as default, antibot, antispam }
          
