const path = require('path');
const message = require('./first-day-text');
const { sendAlphabetInfo } = require('./alfabeto/alfabeto-main');

async function handleStartLearning(chatId, bot, sleep) {
    for (const benefit of message.learningBenefits) {
        await bot.sendMessage(chatId, benefit, { parse_mode: 'HTML' });
        await sleep(500); // 2 секунды задержки
    }

    await bot.sendMessage(chatId, message.textClassIntro);
    await bot.sendMessage(chatId, message.textButtonFirstSlide, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: "¡Вперед!", callback_data: 'alfabeto' }]
            ]
        }
    });
}

async function handleAlfabeto(chatId, bot, sleep) {
    for (const targetsForFirstDay of message.arrClassIntro) {
        await bot.sendMessage(chatId, targetsForFirstDay, { parse_mode: 'HTML' });
        await sleep(500);
    }
    await bot.sendMessage(chatId, message.buttonAlfabeto);

    const result = await sendAlphabetInfo(bot, chatId);
    console.log(result);
    if (result === 'taskInterrupted') {
        return; // Прерываем выполнение, если задача была прервана
    } else if (result === 'taskCompleted') {
        await bot.sendMessage(chatId, message.textButtonDigrafs, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Перейти к диграфам", callback_data: 'digrafs' }]
                ]
            }
        });
    }
}

module.exports.sendFirstDay = async (chatId, bot, callbackQuery, sleep) => {
    if (callbackQuery.data === 'start-learning1') {
        await handleStartLearning(chatId, bot, sleep);
    } else if (callbackQuery.data === 'alfabeto') {
        await handleAlfabeto(chatId, bot, sleep);
    }
};
