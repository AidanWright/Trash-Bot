// This event executes when a new guild (server) is joined.
//module.exports = (client, reaction, user) => {
const Discord = require("discord.js");
module.exports = async (client, reaction, user) => {
    const message = reaction.message;
    var settings = message.settings;
    if (!settings) {
        settings = await client.settings.get(reaction.message.guild.id);
        if (!(settings["starboardChannel"])) {
            client.settings.set(reaction.message.guild.id, client.config.defaultSettings.starboardChannel, "starboardChannel")
        }
    }

    if (reaction.emoji.name !== '⭐') return;
    if (message.author.id === user.id) return message.channel.send(`${user}, you cannot star your own messages.`);
    if (message.author.bot) return message.channel.send(`${user}, you cannot star bot messages.`);
    const starboardChannel = settings["starboardChannel"];
    const starChannel = message.guild.channels.find(channel => channel.name === starboardChannel)
    if (!starChannel) return message.channel.send(`It appears that you do not have a \`${starboardChannel}\` channel.`);
    const fetchedMessages = await starChannel.fetchMessages({
        limit: 100
    });
    const stars = await fetchedMessages.find(m => m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(message.id));
    //console.log(stars);
    if (stars) {
        const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
        const foundStar = stars.embeds[0];
        const image = message.attachments.size > 0 ? message.attachments.array()[0].url : '';
        const embed = new Discord.RichEmbed()
            .setColor(foundStar.color)
            .setDescription(foundStar.description)
            .setAuthor(message.author.tag, message.author.displayAvatarURL)
            .setTimestamp()
            .setFooter(`⭐ ${parseInt(star[1])+1} | ${message.id}`)
            .setImage(image);
        const starMsg = await starChannel.fetchMessage(stars.id);
        await starMsg.edit({
            embed
        });
    }
    if (!stars) {
        const image = message.attachments.size > 0 ? message.attachments.array()[0].url : '';
        if (image === '' && message.cleanContent.length < 1) return message.channel.send(`${user}, you cannot star an empty message.`);
        const embed = new Discord.RichEmbed()
            .setColor(15844367)
            .setDescription(message.cleanContent)
            .setAuthor(message.author.tag, message.author.displayAvatarURL)
            .setTimestamp(new Date())
            .setFooter(`⭐ 1 | ${message.id}`)
            .setImage(image);
        await starChannel.send({
            embed
        });
    }
};
