const run = async (m, { args, conn, bot }) => {
  /*
  if (subBots.list().length >= 30) {
    return m.reply("خلاص العدد اكتمل");
  } // عدد البوتات المسموح بربطها فقط
  */

  if (global.db.noSub) return m.reply("🕷️ المطور أغلق ميزة التنصيب حالياً.");
  
  try {
    // 📱 تنظيف واستخراج رقم الهاتف للشخص اللي طلب التنصيب
    const num = m.sender.split("@")[0].replace(/[+\s-]/g, '');

    if (!/^\d+$/.test(num)) return m.reply("🕷️ رقم الهاتف غير صالح.");

    const sub = global.subBots;
    if (!sub) return m.reply("❌ نظام البوتات الفرعية غير متاح في السورس حالياً.");

    // ⏳ رسالة بدء التجهيز
    const init = await m.reply(`⏳ جاري بدء تنصيب نسخة *𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️* للرقم: *${num}*...`);

    const state = { uid: null, pairDone: false, resolved: false, pending: null };
    const { images: img } = bot.config.info;

    // 🧹 دالة تنظيف المستمعين (Listeners) بعد انتهاء العملية لتفادي ثقل السيرفر
    const cleanup = () => {
      sub.off('pair', handlers.pair);
      sub.off('ready', handlers.ready);
      sub.off('error', handlers.error);
    };

    const handlers = {
      // 🔑 التعامل مع كود الاقتران عند صدوره
      pair: (id, code) => {
        if (state.pairDone) return;
        if (!state.uid) { 
          state.pending = { id, code }; 
          return; 
        }
        if (id !== state.uid) return;
        state.pairDone = true;
        Func.pair(conn, code, num, m, init);
      },
      // ✅ التعامل مع نجاح الاتصال بالواتساب
      ready: (id) => {
        if (id !== state.uid || state.resolved) return;
        state.resolved = true;
        Func.ready(conn, num, m, img[Math.floor(Math.random() * img.length)]);
        cleanup();
      },
      // ❌ التعامل مع حدوث خطأ أثناء الربط
      error: (id, err) => {
        if (id !== state.uid || state.resolved) return;
        state.resolved = true;
        Func.error(conn, num, err, m);
        cleanup();
      },
    };

    // تفعيل مستمعين الأحداث للنظام الفرعي
    sub.on('pair', handlers.pair);
    sub.on('ready', handlers.ready);
    sub.on('error', handlers.error);

    // توليد المعرف الخاص برقم المستخدم لبدء جلسة الربط
    state.uid = await sub.add(num);

    if (state.pending?.id === state.uid && !state.pairDone) {
      state.pairDone = true;
      Func.pair(conn, state.pending.code, num, m, init);
    }

    // ⏰ مهلة إنهاء العملية التلقائية بعد 120 ثانية لو الحساب ماربطش
    setTimeout(() => {
      if (state.resolved) return;
      state.resolved = true;
      Func.timeout(conn, m, state.pairDone);
      cleanup();
    }, 120000);

  } catch (error) {
    await m.reply(`⚠️ حدث خطأ غير متوقع: ${error.message}`);
  }
};

// ⚙️ إعدادات تشغيل الأمر
run.command = ["تنصيب", "ربط"];
run.noSub = true; // منع استخدام الأمر من داخل بوت فرعي (يستخدم من الأساسي فقط)
run.usage = ["تنصيب"];
run.category = "sub";

export default run;

// 🛠️ دالات العرض والواجهات الرائعة للأمر
const Func = {
  // 🔐 واجهة إرسال كود الاقتران (أزرار تفاعلية فخمة)
  pair: async (conn, code, num, m, reply_status) => {
    await conn.sendButton(m.chat, {
      imageUrl: "https://i.pinimg.com/736x/20/c1/cd/20c1cd046c862caa5a42e07d00042357.jpg",
      bodyText: `🕸️⤿ *𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 - 𝐒𝐮𝐛-𝐁𝐨𝐭 𝐒𝐲𝐬𝐭𝐞𝐦* 🕷️\n\n⚡ _أهلاً بك في نظام التنصيب الفرعي  𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️._\n\n📱 *الرقم المُراد ربطه:* ${num}\n🔑 *كود الاقتران الخاص بك:* \`\`\`${code}\`\`\`\n\n📋 *طريقة التفعيل:*\n1️⃣ افتح تطبيق الواتساب الخاص بك.\n2️⃣ انتقل إلى *الأجهزة المرتبطة* -> *ربط جهاز*.\n3️⃣ اختر *الربط برقم الهاتف* ثم أدخل الكود الموضح أعلاه.`,
      footerText: "© 2026 𝑴𝑬𝑹𝑶 𝑨𝑰 - Powered by Shibuya Network",
      buttons: [
        { name: "cta_copy", params: { display_text: "📋 نسخ كود الربط", copy_code: code } },
        { name: "cta_url", params: { display_text: "📢 قناة البوت الرسمية", url: "https://whatsapp.com/channel/0029Vb8Q2Q56WaKx5Qk8QM2y" } },
      ],
      mentions: [m.sender],
      // ربط الكارت التفاعلي التلقائي بقناتك فوق الرسالة
      newsletter: {
        name: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 ☁︎',
        jid: '0029Vb8Q2Q56WaKx5Qk8QM2y@newsletter'
      },
      interactiveConfig: {
        buttons_limits: 10,
        list_title: "𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪",
        button_title: "خيارات الربط",
        canonical_url: `https://whatsapp.com/channel/0029Vb8Q2Q56WaKx5Qk8QM2y`
      }
    }, global.reply_status);
  },

  // ✅ واجهة الاتصال بنجاح والتفعيل
  ready: async (conn, num, m, img) => {
    await m.react("🕷️");
    await conn.sendMessage(m.chat, {
      text: `🎉 *تـم الـتـنـصـيـب بـنـجـاح!* ✨\n\n📱 *الرقم:* ${num}\n🚀 البوت يعمل الآن كنسخة فرعية ومستقر تماماً.\n\n> اكتب *.اوامر* من حسابك لاستكشاف الميزات!`,
      contextInfo: {
        externalAdReply: {
          title: "𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️ | Sub-Bot Live",
          body: "Your personal bot instance is ready and fully synchronized.",
          thumbnailUrl: img,
          sourceUrl: 'https://whatsapp.com/channel/0029Vb8Q2Q56WaKx5Qk8QM2y',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    });
  },

  // ❌ واجهة الفشل
  error: async (conn, num, err, m) => {
    await m.react("❌");
    await m.reply(`❌ *فشل عملية الاقتران!*\n\n📱 *الرقم:* ${num}\n⚠️ *السبب:* ${err?.message || 'انتهت الجلسة أو تم إلغاء الاتصال من الهاتف.'}`);
  },

  // ⏰ واجهة انتهاء المهلة
  timeout: async (conn, m, pairDone) => {
    await m.reply(pairDone
      ? `⏰ *انتهت المهلة:* تم إرسال الكود للواتساب ولكن لم يتم تأكيد الربط من داخل الهاتف. يرجى إعادة المحاولة.`
      : `⏰ *انتهت المهلة:* لم يقم السيرفر بتوليد كود اقتران خلال 120 ثانية. يرجى كتابة الأمر مجدداً.`
    );
  }
};
