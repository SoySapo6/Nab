import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

let globalBot = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Ruta para escribir el número manualmente
app.get('/auth/:numero', (req, res) => {
  const numero = req.params.numero;
  console.log(`Escribiendo número manualmente: ${numero}`);

  if (globalBot && globalBot.stdin) {
    globalBot.stdin.write(numero + '\n');
    res.send(`Número ${numero} enviado al bot correctamente`);
  } else {
    res.send('El bot no está iniciado o no acepta entrada estándar');
  }
});

const server = app.listen(PORT, () => {
  console.log(`Servidor web iniciado en el puerto ${PORT}`);
});

// Función para iniciar el bot sin escribir número automáticamente
function startBot() {
  console.log('Iniciando YukiBot-MD usando npm run code...');

  const bot = spawn('node', ['index.js'], {
    stdio: ['pipe', 'inherit', 'inherit']
  });

  globalBot = bot;

  bot.on('close', (code) => {
    console.log(`Bot finalizado con código ${code}`);
    if (code !== 0) {
      console.log('Reiniciando bot en 5 segundos...');
      setTimeout(startBot, 5000);
    }
  });
}

startBot();

process.on('SIGINT', () => {
  console.log('Cerrando servidor y bot...');
  server.close(() => {
    process.exit(0);
  });
});
