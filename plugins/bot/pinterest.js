import fetch from 'node-fetch'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    try {
        if (!text) {
            return m.reply(`*Usage:* ${usedPrefix + command} <query>\n*Example:* ${usedPrefix + command} cat`)
        }

        const query = encodeURIComponent(text)
        const apiUrl = `https://api.siputzx.my.id/api/s/pinterest?query=${query}&type=image`

        await m.reply('Searching for images on Pinterest, please wait...')

        const response = await fetch(apiUrl)
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data || !data.status || !Array.isArray(data.data) || data.data.length === 0) {
            return m.reply('❌ No Pinterest images found for your query.')
        }

        // Filter for valid image_urls
        const validImages = data.data.filter(item => item && item.image_url)

        if (validImages.length === 0) {
            return m.reply('❌ No valid Pinterest images found for your query.')
        }

        // Pick a random image
        const randomIndex = Math.floor(Math.random() * validImages.length)
        const imageUrl = validImages[randomIndex].image_url
        const description = validImages[randomIndex].description || ''

        await conn.sendFile(m.chat, imageUrl, 'pinterest.jpg', `*Pinterest Search Result for:* "${text}"\n\n*Description:* ${description.trim() || 'N/A'}\n*Source:* ${validImages[randomIndex].pin}`, m)

    } catch (e) {
        console.error("Error in pinterest handler:", e)
        return m.reply("❌ An error occurred while searching Pinterest: " + e.message)
    }
}

handler.help = ['pinterestsearch <query>']
handler.tags = ['internet']
handler.command = ['pinterestsearch', 'pinterest']

export default handler