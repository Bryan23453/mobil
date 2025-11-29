require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error(err));

// Modelo de Usuario (directamente aquí)
const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
}, { collection: 'Usuarios' });

const Usuario = mongoose.model('Usuario', usuarioSchema);

// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});

// Ruta para agregar un usuario
app.post('/usuarios', async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();
    res.json({ mensaje: 'Usuario agregado', usuario: nuevoUsuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al agregar usuario' });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
