require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Atlas conectado"))
  .catch(err => console.error("Error al conectar:", err));

// Modelo de Usuario
const usuarioSchema = new mongoose.Schema({
  usuario: { type: String, required: true },
  contrasena: { type: String, required: true },
  rol: { type: String, required: true }
}, { collection: 'Usuarios' }); // coincide con la colección en Atlas

const Usuario = mongoose.model('Usuario', usuarioSchema);

// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
