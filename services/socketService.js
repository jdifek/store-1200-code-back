const chatService = require('./chatService');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`👤 Користувач підключився: ${socket.id}`);

    // Присоединение к чату
    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
      console.log(`💬 Користувач ${socket.id} приєднався до чату ${chatId}`);
    });

    // Отправка сообщения от клиента
    socket.on('client-message', async (data) => {
      try {
        const { chatId, content } = data;
        
        if (!chatId || !content) {
          socket.emit('error', { message: 'Чат ID та зміст повідомлення обов\'язкові' });
          return;
        }

        const message = await chatService.sendMessage(chatId, content, false);
        
        // Отправляем сообщение всем в чате
        io.to(chatId).emit('new-message', message);
        
        // Уведомляем админов о новом сообщении
        socket.broadcast.to('admins').emit('admin-notification', {
          type: 'new-message',
          chatId,
          message
        });

        console.log(`📝 Нове повідомлення від клієнта в чаті ${chatId}`);
      } catch (error) {
        console.error('Помилка відправки повідомлення від клієнта:', error);
        socket.emit('error', { message: 'Помилка відправки повідомлення' });
      }
    });

    // Отправка сообщения от админа
    socket.on('admin-message', async (data) => {
      try {
        const { chatId, content } = data;
        
        if (!chatId || !content) {
          socket.emit('error', { message: 'Чат ID та зміст повідомлення обов\'язкові' });
          return;
        }

        const message = await chatService.sendMessage(chatId, content, true);
        
        // Отправляем сообщение всем в чате
        io.to(chatId).emit('new-message', message);

        console.log(`👨‍💼 Нове повідомлення від адміна в чаті ${chatId}`);
      } catch (error) {
        console.error('Помилка відправки повідомлення від адміна:', error);
        socket.emit('error', { message: 'Помилка відправки повідомлення' });
      }
    });

    // Админ присоединяется к отслеживанию всех чатов
    socket.on('admin-connect', () => {
      socket.join('admins');
      console.log(`🛠️ Адмін підключився: ${socket.id}`);
      socket.emit('admin-connected', { message: 'Успішно підключено як адмін' });
    });

    // Отключение от чата
    socket.on('leave-chat', (chatId) => {
      socket.leave(chatId);
      console.log(`↩️ Користувач ${socket.id} покинув чат ${chatId}`);
    });

    // Обработка отключения
    socket.on('disconnect', () => {
      console.log(`👋 Користувач відключився: ${socket.id}`);
    });

    // Обработка ошибок сокета
    socket.on('error', (error) => {
      console.error('Socket помилка:', error);
    });
  });

  // Логирование событий сервера
  io.engine.on('connection_error', (err) => {
    console.error('Connection помилка:', err.req, err.code, err.message, err.context);
  });

  console.log('🔌 Socket.IO сервер ініціалізовано');
};
