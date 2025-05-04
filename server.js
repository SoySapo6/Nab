import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear una aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(join(__dirname, 'public')));

// Ruta principal que sirve el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor web iniciado en el puerto ${PORT}`);
});

// Función para iniciar el bot
function startBot() {
  console.log('Iniciando YukiBot-MD...');
  const bot = spawn('node', ['index.js'], {
    stdio: 'inherit'
  });
  
  bot.on('close', (code) => {
    console.log(`Bot finalizado con código ${code}`);
    // Reiniciar el bot si se cierra con error
    if (code !== 0) {
      console.log('Reiniciando bot en 5 segundos...');
      setTimeout(startBot, 5000);
    }
  });
}

// Iniciar el bot junto con el servidor web
startBot();

// Manejar el cierre del proceso principal
process.on('SIGINT', () => {
  console.log('Cerrando servidor y bot...');
  server.close(() => {
    process.exit(0);
  });
});
