import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

// Variable global para el proceso del bot
let globalBot = null;

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

// Ruta para escribir el número manualmente si fuera necesario
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

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor web iniciado en el puerto ${PORT}`);
});

// Variable para controlar intentos de escribir el número
let numeroIntentos = 0;
const numeroMaximoIntentos = 5;

// Función para iniciar el bot usando 'npm run code' y escribir automáticamente el número
function startBot() {
  console.log('Iniciando YukiBot-MD usando npm run code...');
  
  // Usamos npm run code en lugar de node index.js
  const bot = spawn('npm', ['run', 'code'], {
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true
  });
  
  // Guardar referencia global al proceso del bot
  globalBot = bot;
  
  // Función para intentar escribir el número automáticamente
  function intentarEscribirNumero() {
    if (numeroIntentos < numeroMaximoIntentos) {
      console.log(`Intento ${numeroIntentos + 1}: Escribiendo número automáticamente: 51921826291`);
      if (bot.stdin) {
        bot.stdin.write('51921826291\n');
      }
      numeroIntentos++;
      
      // Programar otro intento después de 10 segundos
      if (numeroIntentos < numeroMaximoIntentos) {
        setTimeout(intentarEscribirNumero, 10000);
      }
    }
  }
  
  // Primer intento después de 5 segundos
  setTimeout(intentarEscribirNumero, 5000);
  
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
