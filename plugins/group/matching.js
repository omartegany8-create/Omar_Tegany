

const handler = async (m, { conn, command }) => {
    // 1. ريأكت البدء والتحضير
    await conn.sendMessage(m.chat, { react: { text: "😻", key: m.key } });

    try {
        let img1, img2, caption1, caption2;

        // الفحص الذكي بناءً على الأمر المكتوب
        if (command === 'تطقيم_شباب' || command === 'boys') {
            // جلب تطقيم للأولاد فقط (Boys Match)
            const res = await fetch("https://raw.githubusercontent.com/Omo9/anime-avatars-api/main/boys.json");
            const array = await res.json();
            const randomPair = array[Math.floor(Math.random() * array.length)];
            
            img1 = randomPair.avatar1;
            img2 = randomPair.avatar2;
            caption1 = `🚹 ⇦ *تـطـقـيـم شـبـاب - الـأول ( BOY 1 )* ⚔️`;
            caption2 = `🚹 ⇦ *تـطـقـيـم شـبـاب - الـثـانـي ( BOY 2 )* 🔥\n\n> 👑 _طقم مع شقيقك في السلاح يا وحش!_`;

        } else if (command === 'تطقيم_بنات' || command === 'girls') {
            // جلب تطقيم للبنات فقط (Girls Match)
            const res = await fetch("https://raw.githubusercontent.com/Omo9/anime-avatars-api/main/girls.json");
            const array = await res.json();
            const randomPair = array[Math.floor(Math.random() * array.length)];
            
            img1 = randomPair.avatar1;
            img2 = randomPair.avatar2;
            caption1 = `🚺 ⇦ *تـطـقـيـم بـنـات - الـأول ( GIRL 1 )* ✨`;
            caption2 = `🚺 ⇦ *تـطـقـيـم بـنـات - الـثـانـي ( GIRL 2 )* 🌸\n\n> 🎀 _طقمي مع البيست فريند فوراً!_`;

        } else {
            // التطقيم العادي (ولد وبنت) من meowsab
            const res = await (await import("meowsab")).Scrapy.Matching();
            const { data } = JSON.parse(res);
            
            img1 = data.boy;
            img2 = data.girl;
            caption1 = `🚹 ⇦ *تـطـقـيـم الـأولاد ( BOY )* 🕷️`;
            caption2 = `🚺 ⇦ *تـطـقـيـم الـبـنـات ( GIRL )* 🪞\n\n> 💡 _عايز تطقيم شباب أو بنات؟ جرب: *.تطقيم_شباب* أو *.تطقيم_بنات*_`;
        }

        // التأكد من أن الروابط صالحة ولم يحدث فشل في الجلب
        if (!img1 || !img2) throw new Error("فشل في جلب الصور");

        // 2. إرسال الصورة الأولى مع ريأكت خفيف
        const msg1 = await conn.sendMessage(m.chat, {
            image: { url: img1 },
            caption: `${caption1}\n\n\`\`\`───────────────────\`\`\``,
            mentions: [m.sender]
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: "⚡", key: msg1.key } });

        // 3. إرسال الصورة الثانية مباشرة وراها
        const msg2 = await conn.sendMessage(m.chat, {
            image: { url: img2 },
            caption: `${caption2}\n\n\`\`\`───────────────────\`\`\``,
            mentions: [m.sender]
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: "⭐", key: msg2.key } });

        // 4. ريأكت النجاح النهائي على رسالة العضو الأصلية
        await conn.sendMessage(m.chat, { react: { text: "🔮", key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply("❌ *حصلت مشكلة وسيرفر الصور علق، جرب تاني يسطا!*");
    }
};

handler.usage = ["تطقيم", "تطقيم_شباب", "تطقيم_بنات"];
handler.category = "group";
handler.command = ["تطقيم", "ماتشينج", "matching", "تطقيم_شباب", "boys", "تطقيم_بنات", "girls"];

export default handler;
