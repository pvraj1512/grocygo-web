
const app = require('./src/app');

const PORT = process.env.PORT || 8081;

const server = app.listen(PORT, () => {
  console.log(`GrocyGo backend listening on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Set PORT to another free port in .env.`);
    process.exit(1);
  }

  throw error;
});
