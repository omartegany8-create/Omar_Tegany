/*
code: game detective / premium anime categories edition (10 rounds)
by: 𝐓𝐨𝐣𝐢 & Gemini
*/

const MAX_ROUNDS = 10;

// قاعدة بيانات الشخصيات مقسمة حسب الأنمي بتلميحات ذكية وموزونة
const ANIME_DATABASE = {
    1: [ // دراجون بول
        { name: "غوكو", hints: ["بطل الأنمي من عرق السايان وأرسل للأرض وهو صغير", "بيحب الأكل والتدريب بجنون وعنده تحول الغريزة", "مات كذا مرة في الأنمي وضاعف قوته بسبب الكايوكن"] },
        { name: "فيجيتا", hints: ["أمير السايان صاحب الكبرياء الخارق والدم الحامي", "بدأ كعدو مرعب ودمر كواكب وبعيدن استقر في الأرض وعمل عيلة", "تحوله الأخير والأقوى هو الـ (ألترا إيغو) المعتمد على تدمير الذات"] },
        { name: "فريزا", hints: ["إمبراطور الكون وأشرس عدو لعرق السايان بالكامل", "هو السبب الأساسي في تدمير كوكب فيجيتا ومسح السايان من الوجود", "ظهر بتحول جديد مرعب ولونه أسود (بلاك فريزا) صدم بيه الجميع"] },
        { name: "غوهان", hints: ["ابن البطل الأكبر وعنده طاقة كامنة مرعبة تظهر وقت الغضب", "أول واحد فعل تحول السوبر سايان 2 في قتال سيل الشهير", "سحب على التدريب فترة وبقى مهتم بالدراسة بس رجع بتحول الوحش الجديد"] },
        { name: "بيروس", hints: ["إله الدمار للكون السابع وبيحب الأكل والنوم لقرون", "مساعده ومدربه هو ويس وبيقدر يمسح كواكب بلمسة إصبع (هاكاي)", "ظهر في البداية كتهديد مرعب للأرض بسبب حلم عن سوبر سايان غود"] },
        { name: "ترانكس", hints: ["مقاتل سايان هجين جه من المستقبل عشان يحذر الأبطال من الأندرويد", "قطع فريزا لنصفين بسيفه أول ما ظهر في الحاضر وسط صدمة الكل", "ابن أمير السايان وعاش في خط زمني مدمر ومأساوي بالكامل"] },
        { name: "برولي", hints: ["السايان الأسطوري اللي اتولد بطاقة مرعبة خلت الملك يخاف منه", "قوته بتزيد بشكل جنوني ومرعب كل ما يغضب أثناء القتال", "خاض معركة طحن في القطب الشمالي ضد غوكو وفيجيتا مع بعض"] }
    ],
    2: [ // جوجوتسو كايسين
        { name: "غوجو", hints: ["أقوى مستخدم لجوجوتسو في عصره ومن عائلة أسطورية متمكنة", "يمتلك تقنية اللانهائية اللي بتمنع أي هجوم أو شخص يلمسه", "تم ختمه داخل سجن في المترو وسط صدمة ورعب الشات والجميع"] },
        { name: "توجي", hints: ["معروف بقاتل السحرة وصاحب القيود السماوية اللي صفرت طاقته", "والد شخصية رئيسية في الأنمي وصاحب السلاح الشهير قاطع الأرواح", "استطاع إسقاط سحرة من الدرجة الخاصة في شبابه وكاد ينهي أقواهم"] },
        { name: "سوكونا", hints: ["ملك اللعنات اللي قسم شخص ما إلى نصفين في قتال تاريخي مرعب", "تجسد داخل جسد بشري غريب بعد ابتلاع أجزاء محنطة منه", "تقنيته المفضلة تعتمد على التفكيك والقطع، ومجاله هو الضريح الخبيث"] },
        { name: "ميجومي", hints: ["مستخدم تقنية سحرية وراثة تعتمد على استدعاءات وحوش الظلال", "استخدم الأشرار جسده كوعاء مثالي لاستدعاء أعتى وحش لا يقهر", "تربى على يد أقوى ساحر في الأنمي وصديقه المقرب غبي ومتهور"] },
        { name: "يوجي", hints: ["بطل القصة ويمتلك بنية جسدية وقوة بدنية مرعبة من صغره", "مات جده في الحلقة الأولى وترك له وصية غيرت مسار حياته", "تقنيته الشهيرة بتعتمد على اللكمات المتتالية المدعومة بالوميض الأسود"] },
        { name: "نانامي", hints: ["ساحر من الدرجة الأولى كان بيشتغل موظف في شركة وسابها مخنوق", "سلاحه مغطى بالقماش وبيعتمد على تقسيم الأهداف بنسبة 7 إلى 3", "مات بطريقة حزينة على يد لعنة الرقع والمطاط في حادثة شيبويا"] },
        { name: "ماهيتو", hints: ["لعنة ولدت من مشاعر الكراهية والخوف المتبادلة بين البشر", "تقنيته بتخليه يغير شكل الأرواح والأجساد بمجرد اللمس المباشر", "سبب كوابيس كتير لأبطال القصة ومات ميتة رخيصة بعد ما غدروا بيه"] }
    ],
    3: [ // هانتر x هانتر
        { name: "كيلوا", hints: ["سليل عائلة الزولاديك الشهيرة والمتخصصة في القتل المأجور", "تقنية النين بتاعته بتتحول لطاقة كهربائية خارقة (السرعة الإلهية)", "صديقه المقرب هو غون وعاش حياته بيحمي أخته الصغيرة ألوكا"] },
        { name: "غون", hints: ["صياد صغير بدأ رحلته للبحث عن والده جينغ اللي سابه وهو صغير", "تقنيته الشهيرة هي (جاجانكين) المبنية على لعبة حجر ورقة مقص", "ضحى بكل طاقته ومستقبله عشان يتحول لبالغ ويسحق النملة بيتو انتقاماً"] },
        { name: "كورابيكا", hints: ["الناجي الوحيد من قبيلة كورت ذات العيون القرمزية الشبيهة بالدم", "يستخدم سلاسل النين ووضع شرط الموت على نفسه لو استخدمها ضد غير العناكب", "أصبح صياد جوائز بهدف جمع عيون عائلته المسروقة وإبادة العصابة"] },
        { name: "هيسوكا", hints: ["صياد غامض وساحر مهووس بالقتال ويبحث عن ذوي المؤهلات العالية", "تقنية النين بتاعته اسمها (بانجي غام) وتمتلك صفات الصمغ والمطاط", "بيحب يلعب بأوراق اللعب كسلاح قاتل ومهتم جداً ب غون وكيلوا"] },
        { name: "ميرويم", hints: ["ملك نمل الكيميرا وصاحب القوة المطلقة التي ولدت لتتحكم في العالم", "تغيرت شخصيته ونظرته للبشر بعد ما لعب الغونغي مع بنت عمياء", "مات مسموماً بسبب القنبلة الوردية الخبيثة اللي فجرها رئيس الصيادين"] },
        { name: "نيتيرو", hints: ["رئيس جمعية الصيادين السابق وصاحب أقوى ضربات يدوية في العالم", "يستخدم تقنية بوداسف ذات الـ 100 نوع في القتال الغاشم", "فجر نفسه بقنبلة مزروعة في قلبه لإنهاء خطر ملك النمل"] }
    ],
    4: [ // هجوم العمالقة
        { name: "ليفاي", hints: ["أقوى جندي في البشرية وصاحب هوس جنوني بالنظافة والترتيب", "يمسك كوب الشاي من الأعلى بطريقة غريبة وينتمي لعائلة الأكرمان", "قطع العملاق القرد وحوله لأشلاء في معركة استعادة سور ماريا"] },
        { name: "ايرين", hints: ["بدأ القصة بهدف إبادة جميع العمالقة بعد ما شاف أمه بتتاكل قدامه", "امتلك قوة عمالقة ساعدته يشوف المستقبل ويتحكم في الماضي", "فعل دك الأرض وجلب آلاف العمالقة الضخمة لتدمير العالم برا السور"] },
        { name: "ميكاسا", hints: ["شخصية هادئة وقوية جداً من عائلة الأكرمان وترتدي وشاح أحمر دائماً", "هدفها الوحيد في الحياة هو حماية البطل وملازمته في كل مكان", "هي اللي أنهت قصة البطل في اللقطة الأخيرة بضربة سيف حزينة"] },
        { name: "ارمين", hints: ["صديق الطفولة الذكي وصاحب الأحلام برؤية البحر خلف الأسوار", "امتلك قوة العملاق الضخم بعد حادثة حرق واختيار صعبة جداً", "أصبح القائد رقم 15 لفيلق الاستطلاع بعد موت هانجي"] },
        { name: "اروين", hints: ["القائد الـ 13 لفيلق الاستطلاع وصاحب أعظم خطابات حماسية تزلزل القلوب", "ضحى بذراعه من أجل إنقاذ البطل ولم يتراجع خطوة واحدة للخلف", "قاد هجوم انتحاري مرعب ضد العملاق القرد ومات قبل ما يعرف سر القبو"] }
    ],
    5: [ // ون بيس
        { name: "لوفي", hints: ["قائد طاقم قرصاني مشهور بحبه للأكل وخاصة اللحوم بكميات ضخمة", "تناول فاكهة تبين لاحقاً إنها تخص إله الشمس الأسطوري نيكا (البايرت كينج)", "جده نائب أدميرال في البحرية وأبوه أخطر رجل مطلوب في العالم"] },
        { name: "زورو", hints: ["مستعمل أسلوب سيوف غريب وصاحب كبرياء وعزيمة لا تنكسر أبداً", "عنده مشكلة كارثية في الاتجاهات وبيقدر يضيع في خط مستقيم ممدود", "أخذ على نفسه عهد ألا يهزم حتى يواجه أقوى سياف في العالم"] },
        { name: "ايس", hints: ["ابن ملك القراصنة الحقيقي وأخو البطل بالتبني وقائد فرقة عند اللحية البيضاء", "يمتلك قدرة فاكهة النار وكان يلبس قبعة برتقالية بعلامات حزينة وضاحكة", "مات في حرب المارين فورد وهو بيحمي البطل من ضربة بركانية قاتلة"] },
        { name: "ميهوك", hints: ["صاحب العينين الصقريتين الحادتين ويجلس وحيداً في قلعته المهجورة", "يمتلك السيف الأسود الأعظم في العالم وكان يسافر بقارب صغير جداً", "هو اللي درب سياف طاقم قبعة القش خلال فترة السنتين"] },
        { name: "سانجي", hints: ["طباخ الطاقم الأسطوري اللي بيرفض يستخدم إيديه في القتال حماية لها", "تقنيته بتعتمد على الأرجل المشتعلة بالنار ويلبس بدلات رسمية دائماً", "من عائلة ملكية علمية متطورة (الفينسموك) ولكنه تبرأ منهم بالكامل"] },
        { name: "شانكس", hints: ["يونكو غامض وصاحب أقوى هاكي ملكي ضاع ذراعه لإنقاذ طفل صغير", "هو اللي أعطى قبعة القش للبطل وطلب منه يرجعها لما يكون قرصان عظيم", "يقدر يدخل المارين فورد ويوقف الحرب بكلمة واحدة من هيبته وطاقتها"] }
    ],
    6: [ // قتال الشياطين
        { name: "تانجيرو", hints: ["بائع فحم طيب القلب تحولت عائلته لمجزرة ونجت أخته الصغرى فقط كـ شيطانة", "يستخدم أسلوب تنفس الماء ورقصة إله النار في قتال الشياطين طحن", "يتميز بجبهة صلبة جداً بيستخدمها في النطح وحاسة شم خارقة تكشف النوايا"] },
        { name: "نيزوكو", hints: ["شيطانة لطيفة بتتحرك داخل صندوق خشبي بيشيله أخوها على ظهره", "تضع قطعة من الخيزران (القصب) في فمها دائماً منعاً لعض البشر", "قدرت تتحكم في نفسها وبقت تقاتل الشياطين لحماية البشر مع أخوها"] },
        { name: "زينيتسو", hints: ["مقاتل جبان وخواف جداً بيبكي دايماً بس بيتحول لوحش كاسر لما يغيب عن الوعي", "يستخدم أسلوب تنفس البرق وبيتقن الهيئة الأولى منه بسرعة الضوء", "يمتلك حاسة سمع خارقة وبيموت في أخت بطل القصة"] },
        { name: "اينوسكي", hints: ["مقاتل همجي اتربى وسط الخنازير في الغابة وويلبس رأس خنزير بري دايماً", "يستخدم سيفين مشرشرين ومكسرين وبيخترع أساليب قتال برية مرعبة", "عنده مرونة جسدية خيالية وبيقدر يحرك أماكن أعضائه الداخلية لو انصاب"] },
        { name: "رينغوكو", hints: ["هاشيرا اللهب صاحب الابتسامة الدائمة والعزيمة التي لا تنطفئ", "خاض معركة أسطورية لحماية ركاب القطار ضد قطب الشياطين الثالث أكازا", "مات ميتة الأبطال وهو واقف مكانه وترك أثر مرعب في قلوب الجميع"] },
        { name: "موزان", hints: ["ملك الشياطين الأول والأصل في وجودهم وعاش لقرون يغير شكله", "دمه بيحول البشر لشياطين وأي شيطان بينطق اسمه بيموت فوراً بلعنته", "بيخاف من أقراط الهانافودا ومن مستخدمي تنفس الشمس التاريخيين"] }
    ]
};

const animeNames = {
    1: "دراجون بول 🐉",
    2: "جوجتسو كايسن 🔮",
    3: "هانتر x هانتر 🎖️",
    4: "هجوم العمالقه 🧱",
    5: "ون بيس 🏴‍☠️",
    6: "قتال الشياطين ⚔️"
};

function cleanName(str) {
    return str.trim()
        .replace(/[أإآا]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/[ىي]/g, 'ي')
        .toLowerCase();
}

async function startDetectiveTimeout(chatId, conn) {
    const game = global.detectiveGame[chatId];
    if (!game) return;
    if (game.timer) clearTimeout(game.timer);

    game.timer = setTimeout(async () => {
        if (global.detectiveGame?.[chatId]) {
            const currentStage = global.detectiveGame[chatId].stage;
            
            if (currentStage === "choose") {
                delete global.detectiveGame[chatId];
                await conn.sendMessage(chatId, { text: `💤 *يا خسارة! انتهى وقت اختيار الأنمي ومحدش رد..* 🦦\n*تم إلغاء التحدي لعدم التفاعل مع القائمة.*` });
            } else {
                const correctAns = global.detectiveGame[chatId].currentQuestion?.name;
                global.detectiveGame[chatId].currentQuestion = null;
                
                await conn.sendMessage(chatId, { 
                    text: `⏰ *انتهى وقت الجولة ومحدش عرف المحقق!*\n\nالشخصية المطلوبة كانت: *${correctAns}*\n\nنجهز الجولة اللي بعدها حالا صحصحوا معايا..` 
                });

                if (global.detectiveGame[chatId].round < MAX_ROUNDS) {
                    setTimeout(() => nextRound(null, conn, chatId), 2500);
                } else {
                    finishDetectiveGame(null, conn, chatId);
                }
            }
        }
    }, 30000); // 30 ثانية حماية كاملة من النوم الخمول
}

async function nextRound(m, conn, chatId) {
    const game = global.detectiveGame[chatId];
    if (!game) return;

    game.round++;
    if (game.round > MAX_ROUNDS) {
        return finishDetectiveGame(m, conn, chatId);
    }

    game.currentQuestion = game.questionsPool[game.round - 1];
    const cur = game.currentQuestion;

    const msgText = `📌 *تحدي المحقق الأسطوري* 🕵🏻‍♂️🔍\n\n \n• الجولة الحالية: [ *${game.round} من ${MAX_ROUNDS}* ]\n• فئة التخمين: [ *${animeNames[game.category]}* ]\n\n💡 *إليك 3 تلميحات عن الشخصية:*\n\n1️⃣ ⎋ ${cur.hints[0]}\n2️⃣ ⎋ ${cur.hints[1]}\n3️⃣ ⎋ ${cur.hints[2]}\n\n_رد على الرسالة دي باسم الشخصية صح عشان تحسب نقطتك!_`;

    const sent = await conn.sendMessage(chatId, { text: msgText });
    game.lastMsgId = sent.key.id;

    startDetectiveTimeout(chatId, conn);
}

async function finishDetectiveGame(m, conn, chatId) {
    const game = global.detectiveGame[chatId];
    if (!game) return;

    if (game.timer) clearTimeout(game.timer);

    let finalScores = Object.entries(game.scores).sort((a, b) => b[1].correct - a[1].correct);

    if (finalScores.length === 0) {
        await conn.sendMessage(chatId, { text: `🏁 *انتهت الـ ${MAX_ROUNDS} جولات كاملة!*\n\nبس للأسف مفيش ولا محقق اشتغل انهارده.. الجروب كله نايم في العسل! 🦦😂` });
        delete global.detectiveGame[chatId];
        return;
    }

    let leaderboard = finalScores.map(([user, data], idx) => {
        let totalAttempts = data.correct + data.wrong;
        let winRatio = totalAttempts > 0 ? Math.round((data.correct / totalAttempts) * 100) : 0;
        let rankEmoji = idx === 0 ? "🏆" : idx === 1 ? "🥈" : "⭐";
        
        if (global.db?.users[user]) {
            global.db.users[user].xp = (global.db.users[user].xp || 0) + (data.correct * 80);
            global.db.users[user].cookies = (global.db.users[user].cookies || 0) + (data.correct * 2);
        }

        return `${rankEmoji} *المركز ${idx + 1}:* @${user.split('@')[0]}\n• تخمين صحيح: [ *${data.correct} جولات* ]\n• محاولات خاطئة: [ *${data.wrong} مرة* ]\n• دقة التخمين: [ *${winRatio}%* ]\n• المكافأة المضافة: [ *+${data.correct * 80} XP* | *🍪 +${data.correct * 2} كوكيز* ]`;
    }).join('\n\n');

    const winner = finalScores[0][0];

    await conn.sendMessage(chatId, {
        text: `🏁 *لوحة النتائج 👇 - نهاية تحدي التحقيق* 🏆\n\n${leaderboard}\n\n🏅 *عاش يا وحوش التحليل! الصدارة @${winner.split('@')[0]} تفكيرك عبقري وسرعة!* 🕵🏻‍♂️🔥`,
        mentions: finalScores.map(e => e[0])
    });

    delete global.detectiveGame[chatId];
}

async function handler(m, { conn, text, command }) {
    if (!global.detectiveGame) global.detectiveGame = {};
    const chatId = m.chat;
    const cmd = (text || '').trim().toLowerCase().split(' ')[0];

    if (cmd === 'حذف' || cmd === 'انهاء' || cmd === 'delete') {
        if (!global.detectiveGame[chatId]) return m.reply("❌ مفيش جولة تحقيق نشطة حالياً عشان أحذفها!");
        if (global.detectiveGame[chatId].timer) clearTimeout(global.detectiveGame[chatId].timer);
        delete global.detectiveGame[chatId];
        return m.reply("🗑 *تم إنهاء وإغلاق لعبة التخمين.*");
    }

    if (global.detectiveGame[chatId]) {
        return m.reply(`⚠️ في جولة تحقيق وتخمين شغالة حالياً في الشات!\n\nاكتب *.${command} حذف* لو حابب تقفلها وتبدأ جولة مروقة.`);
    }

    await conn.sendMessage(chatId, { react: { text: "🕵🏻‍♂️", key: m.key } });

    global.detectiveGame[chatId] = {
        stage: "choose",
        round: 0,
        category: null,
        questionsPool: [],
        currentQuestion: null,
        scores: {},
        timer: null,
        starter: m.sender,
        lastMsgId: null
    };

    const menuText = `🕵🏻‍♂️ *حلبة تحقيق المحقق الأسطوري* 🔍\n\n*الرجاء اختيار فئة الأنمي للتحدي انهارده:*\n\n1️⃣ ⇦ دراجون بول\n2️⃣ ⇦ جوجتسو كايسن\n3️⃣ ⇦ هانتر x هانتر\n4️⃣ ⇦ هجوم العمالقه\n5️⃣ ⇦ ون بيس\n6️⃣ ⇦ قتال الشياطين\n\n👉🏻 _رد على الرسالة دي برقم الأنمي [ من 1 إلى 6 ] عشان نبدأ الجولات فوراً!_`;
    
    const menuMsg = await conn.sendMessage(chatId, { text: menuText }, { quoted: m });
    global.detectiveGame[chatId].lastMsgId = menuMsg.key.id;
    startDetectiveTimeout(chatId, conn);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const game = global.detectiveGame?.[chatId];
    if (!game || !m.text) return false;

    // الشرط القاتل لمنع التداخل: التحقق من أن الرسالة عبارة عن رد (Reply) على رسالة البوت الأخيرة الخاصة باللعبة
    const isReplyToBot = m.message?.extendedTextMessage?.contextInfo?.stanzaId === game.lastMsgId;
    if (!isReplyToBot) return false;

    // المرحلة الأولى: اختيار فئة الأنمي بالرد
    if (game.stage === "choose") {
        const choice = parseInt(m.text.trim());
        if (isNaN(choice) || choice < 1 || choice > 6) return false;

        clearTimeout(game.timer);
        game.category = choice;
        game.stage = "playing";

        let selectedData = [...ANIME_DATABASE[choice]];
        game.questionsPool = selectedData.sort(() => Math.random() - 0.5);

        await conn.sendMessage(chatId, { react: { text: "🚀", key: m.key } });
        await conn.sendMessage(chatId, { 
            text: `🔥 *تم اختيار فئة: ${animeNames[choice]}*\n\nالتحدي مكون من *10 جولات متتالية* حماسية.. البوت هيعرض التلميحات وأسرع محقق هيكتب الاسم صح بالرد على السؤال هيقفل النقط!\n\nالجولة الأولى نازلة حالا في السكة... 🔎🔥`
        }, { quoted: m });

        setTimeout(() => nextRound(m, conn, chatId), 2000);
        return true;
    }

    // المرحلة الثانية: لعب الجولات واستقبال الأجوبة
    if (game.stage === "playing" && game.currentQuestion) {
        if (!game.scores[m.sender]) {
            game.scores[m.scores] = { correct: 0, wrong: 0 }; // تصحيح بسيط للتهيئة
            game.scores[m.sender] = { correct: 0, wrong: 0 };
        }

        const userInput = cleanName(m.text);
        const correctName = cleanName(game.currentQuestion.name);

        if (userInput === correctName) {
            clearTimeout(game.timer);
            const resolvedName = game.currentQuestion.name;
            game.currentQuestion = null; 
            game.scores[m.sender].correct += 1;

            await conn.sendMessage(chatId, { react: { text: "⚡", key: m.key } });
            
            let successMsg = `🎉 *سرعة وتحليل صح!* \n\nالشخصية المطلوبة هي بالفعل: [ *${resolvedName}* ] 🏆\nالمحقق الأسطوري: @${m.sender.split('@')[0]}\n🎯 نقاطك الحالية: [ *${game.scores[m.sender].correct} نقطة* ]\n\n`;
            
            if (game.round < MAX_ROUNDS) {
                successMsg += `⏳ *استعدوا.. الشخصية الجاية للجولة رقم (${game.round + 1} / 10) نازلة حالا...*`;
                await conn.sendMessage(chatId, { text: successMsg, mentions: [m.sender] }, { quoted: m });
                setTimeout(() => nextRound(m, conn, chatId), 3000);
            } else {
                successMsg += `🏁 *دي كانت الجولة الأخيرة في التحدي! النتائج 👇...*`;
                await conn.sendMessage(chatId, { text: successMsg, mentions: [m.sender] }, { quoted: m });
                setTimeout(() => finishDetectiveGame(m, conn, chatId), 2000);
            }
            return true;
        } 
        
        // فحص الإجابات الغلط 
        else if (m.text.trim().split(/\s+/).length <= 2 && !m.text.startsWith('.')) {
            game.scores[m.sender].wrong += 1;
            await conn.sendMessage(chatId, { react: { text: "🤦🏻", key: m.key } });
            
            const roasts = [
                "❌ *تخمين بعيد خالص!* ركز في التلميحات يسطا وجيبها صح الجولة الجاية! 😂🔥",
                "❌ *مش هو للاسف!* الشخصية دي صفاتها مختلفة، فكر تاني بسرع!",
                "❌ *غلط 🙂!* شغل دماغ المحقق اللي جواك وركز في التفاصيل الصغيره!"
            ];
            const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
            await m.reply(randomRoast);
            return true;
        }
    }

    return false;
};

handler.usage = ["تخمين"];
handler.category = "games";
handler.command = ['تخمين', 'تحقيق', 'المحقق'];
export default handler;
