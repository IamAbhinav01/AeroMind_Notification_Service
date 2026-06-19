const express = require('express');
const { ServerConfig, LoggerConfig } = require('./config');
const apiRoutes = require('./routes');
const { connectRabitMQ } = require('./config/RabbitMQ.config');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRoutes);
app.listen(ServerConfig.PORT, async () => {
  console.log(`server started at port: ${ServerConfig.PORT}`);
  LoggerConfig.info(`server started at port: ${ServerConfig.PORT}`);
  const rabbitStarted = await connectRabitMQ();
  if (rabbitStarted) {
    LoggerConfig.info('RabbitMQ started ..');
  } else {
    LoggerConfig.warn('RabbitMQ connection failed or was skipped. Server is still running.');
  }
});
