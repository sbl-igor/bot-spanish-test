const TelegramBot = require('node-telegram-bot-api');
const { sendFirstDay } = require('./first-day');

const token = '7370115543:AAEoT4TxLw_q2RTp1mewLJUKSbeKQrJekZQ';

const bot = new TelegramBot(token, { polling: true });
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

bot.setMyCommands([
    { command: '/start', description: 'Приступим к работе?' },
    { command: '/info', description: 'Посмотреть версию проекта' },
    { command: '/navigation', description: 'Открыть содержание уроков' },
]).then(() => {
    console.log('Commands installed');
}).catch((err) => {
    console.log('Error installing commands', err);
});

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'Добро пожаловать! Нажмите кнопку ниже, чтобы начать обучение.', {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Начать обучение", callback_data: 'start-learning1' }]
            ]
        }
    });
});

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    try {
        await sendFirstDay(chatId, bot, callbackQuery, ms => new Promise(resolve => setTimeout(resolve, ms)));
    } catch (error) {
        console.error('Error handling callback query:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка, попробуйте снова.');
    }
});
