require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Atlas conectado"))
  .catch(err => console.error("❌ Error al conectar:", err));

// ---------------- USUARIOS ----------------
const usuarioSchema = new mongoose.Schema({
  usuario: { type: String, required: true },
  contrasena: { type: String, required: true },
  rol: { type: String, required: true }
}, { collection: 'Usuarios' });

const Usuario = mongoose.model('Usuario', usuarioSchema);

// GET todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: err.message });
  }
});

// POST nuevo usuario
app.post('/usuarios', async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();
    res.json({ mensaje: 'Usuario agregado', usuario: nuevoUsuario });
  } catch (err) {
    console.error("Error al agregar usuario:", err);
    res.status(500).json({ mensaje: 'Error al agregar usuario', error: err.message });
  }
});

// ---------------- ENTRADAS Y SALIDAS ----------------
const movimientoSchema = new mongoose.Schema({
  Fecha: { type: String, required: true },
  Vendedor: { type: String, required: true },
  Tipo: { type: String, required: true },
  Cantidad: { type: Number, required: true }
});

// Modelos separados
const Entrada = mongoose.model('Entrada', movimientoSchema, 'Entradas');
const Salida = mongoose.model('Salida', movimientoSchema, 'Salidas');

// GET Entradas
app.get('/entradas', async (req, res) => {
  try {
    const entradas = await Entrada.find();
    res.json(entradas);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener entradas', error: err.message });
  }
});

// POST Entrada
app.post('/entradas', async (req, res) => {
  try {
    const nuevaEntrada = new Entrada(req.body);
    await nuevaEntrada.save();
    res.json({ mensaje: 'Entrada agregada', entrada: nuevaEntrada });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al agregar entrada', error: err.message });
  }
});

// GET Salidas
app.get('/salidas', async (req, res) => {
  try {
    const salidas = await Salida.find();
    res.json(salidas);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener salidas', error: err.message });
  }
});

// POST Salida
app.post('/salidas', async (req, res) => {
  try {
    const nuevaSalida = new Salida(req.body);
    await nuevaSalida.save();
    res.json({ mensaje: 'Salida agregada', salida: nuevaSalida });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al agregar salida', error: err.message });
  }
});

// ---------------- INICIAR SERVIDOR ----------------
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
