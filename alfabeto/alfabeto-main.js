const path = require('path');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const chatStates = {}; // Состояния чатов
const userState = {};

const sendAlphabetInfo = async (bot, chatId) => {
    return new Promise(async (resolve, reject) => {
        if (!chatStates[chatId]) {
            chatStates[chatId] = { interrupted: false, userState: { index: 0 } }; // Инициализация состояния чата
        }

        const messageHandler = async (msg) => {
            try {
                if (msg.chat.id === chatId && (msg.text === '/navigation' || msg.text === '/start' || msg.text === '/info')) {
                    bot.removeListener('message', messageHandler);
                    chatStates[chatId].interrupted = true; // Устанавливаем состояние прерывания
                    resolve('taskInterrupted');
                    return;
                }
            } catch (error) {
                console.error('Ошибка в обработчике сообщений:', error);
                reject(error);
            }
        };

        bot.on('message', messageHandler); // Начинаем слушать сообщения для прерывания

            const alphabetInfo = [
            {
                image: path.resolve(__dirname, '../img/spanish-alfabet/aa.png'),
                letter: 'A',
                pronunciation: 'а',
                description: 'Произносится как "а" в слове "мама".',
                examples: ['Amor (любовь)', 'Árbol (дерево)', 'Amarillo (жёлтый)'],
                audio: path.resolve(__dirname, '../audio/first-day/audio-alpabeto/letra-a.mp3'), // Путь к голосовому сообщению
                audioPalabras: path.resolve(__dirname, '../audio/first-day/audio-alfa-palabras/Palabras-a.mp3'),
            },
            {
                image: path.resolve(__dirname, '../img/spanish-alfabet/bb.png'),
                letter: 'B',
                pronunciation: 'бэ',
                description: 'Произносится как мягкий "б", прижимая верхние и нижние губы.',
                examples: ['Barco (корабль)', 'Bueno (хороший)', 'Bicicleta (велосипед)'],
                audio: path.resolve(__dirname, '../audio/first-day/audio-alpabeto/letra-b.mp3'), // Путь к голосовому сообщению
                audioPalabras: path.resolve(__dirname, '../audio/first-day/audio-alfa-palabras/palabras-b.mp3'),
            },
            {
                image: path.resolve(__dirname, '../img/spanish-alfabet/cc.png'),
                letter: 'C',
                pronunciation: 'сэ',
                description: 'Буква "c" произносится как [k], аналогично русской букве "к" в слове "кот". Перед "e" и "i" буква "c" произносится, как "cэ" в слове "солнце".',
                examples: ['Casa (дом)', 'Coche (машина)', 'Comida (еда)'],
                audio: path.resolve(__dirname, '../audio/first-day/audio-alpabeto/letra-c.mp3'), // Путь к голосовому сообщению
                audioPalabras: path.resolve(__dirname, '../audio/first-day/audio-alfa-palabras/palabras-c.mp3'),
            },
        ];

        const sendLetterInfo = async (index) => {
            const info = alphabetInfo[index];

            try {
                await bot.sendSticker(chatId, info.image);
                await bot.sendMessage(chatId, `- <b>${info.letter}</b> (${info.pronunciation})\n\n${info.description}\n\nПримеры:\n${info.examples.map(example => `- <i>${example}</i>`).join('\n')}`, { parse_mode: 'HTML' });
                await bot.sendAudio(chatId, info.audio);
                await bot.sendAudio(chatId, info.audioPalabras);

                if (index < alphabetInfo.length - 1) {
                    await bot.sendMessage(chatId, 'К следующей букве ➡️', {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "¡Вперед!", callback_data: 'next-letter' }]
                            ]
                        }
                    });
                } else {
                    resolve('taskCompleted');
                }
            } catch (error) {
                console.error('Ошибка при отправке сообщения:', error);
                reject(error);
            }
        };

        bot.on('callback_query', async (callbackQuery) => {
            if (callbackQuery.message.chat.id === chatId && callbackQuery.data === 'next-letter') {
                const index = chatStates[chatId].userState.index;

                if (chatStates[chatId] && chatStates[chatId].interrupted) {
                    resolve('taskInterrupted');
                    return;
                }

                if (index < alphabetInfo.length - 1) {
                    chatStates[chatId].userState.index = index + 1;
                    await sendLetterInfo(chatStates[chatId].userState.index);
                }

                await bot.answerCallbackQuery(callbackQuery.id);
            }
        });

        chatStates[chatId].userState.index = 0;
        await sendLetterInfo(chatStates[chatId].userState.index);

        // Удаляем обработчик сообщений после завершения задачи или прерывания
        bot.removeListener('message', messageHandler);
    });
};

module.exports = {
    sendAlphabetInfo
};
