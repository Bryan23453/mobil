require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

//pa entrar a mongo atlas
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("toy siiii"))
  .catch(err => console.error("no toy soy mongolo ", err));

// usuarios
const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },  
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

// PUT editar usuario por ID
app.put('/usuarios/:id', async (req, res) => {
  try {
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({
      mensaje: 'Usuario actualizado correctamente',
      usuario: usuarioActualizado
    });

  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: err.message });
  }
});
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const eliminado = await Usuario.findByIdAndDelete(req.params.id);

    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario eliminado con éxito' });

  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: err.message });
  }
});


// entradas y salidas
const movimientoSchema = new mongoose.Schema({
  Fecha: { type: String, required: true },
  Vendedor: { type: String, required: true },
  Tipo: { type: String, enum: ['entrada', 'salida'], required: true },
  Cantidad_bolsas: { type: Number, default: 0 },
  Cantidad_botes: { type: Number, default: 0 }
}, { collection: 'Salidas' });
const Salida = mongoose.model('Salida', movimientoSchema);

// GET todos las salidas
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

// ver si toy
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
