require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Conexión a Mongo Atlas
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Base de datos conectada"))
  .catch((err) => console.error("Error al conectar:", err));
// Rutas de ejemplo
app.get("/", (req, res) => {
  res.send("Servidor corriendo!");
});
const Usuario = require('./Usuario'); // importar el modelo

// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find(); // obtiene todos los usuarios
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});
// Inicia el servidor
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
