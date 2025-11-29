require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ---------------- CONEXIÓN A MONGODB ATLAS ----------------
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
    res.status(201).json({ mensaje: 'Usuario agregado', usuario: nuevoUsuario });
  } catch (err) {
    console.error("Error al agregar usuario:", err);
    res.status(500).json({ mensaje: 'Error al agregar usuario', error: err.message });
  }
});

// ---------------- ENTRADAS Y SALIDAS ----------------
const movimientoSchema = new mongoose.Schema({
  Fecha: { type: String, required: true },
  Vendedor: { type: String, required: true },
  Tipo: { type: String, enum: ['entrada', 'salida'], required: true },
  Cantidad_bolsas: { type: Number, default: 0 },
  Cantidad_botes: { type: Number, default: 0 }
}, { collection: 'Salidas' }); // puedes renombrar la colección a "Movimientos" si quieres un solo lugar

const Salida = mongoose.model('Salida', movimientoSchema);

// GET todos los movimientos
app.get('/salidas', async (req, res) => {
  try {
    const movimientos = await Salida.find();
    res.json(movimientos);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener movimientos', error: err.message });
  }
});

// POST nuevo movimiento
app.post('/salidas', async (req, res) => {
  try {
    const nuevoMovimiento = new Salida(req.body);
    await nuevoMovimiento.save();
    res.status(201).json({ mensaje: 'Movimiento agregado', movimiento: nuevoMovimiento });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al agregar movimiento', error: err.message });
  }
});

// ---------------- INICIAR SERVIDOR ----------------
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
