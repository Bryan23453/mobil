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

///////////////////////////salidas////////////////////////////////////////////////////////////////////////////
// Schema para movimientos (entradas y salidas)
const movimientoSchema = new mongoose.Schema({
  Fecha: { type: String, required: true },
  Vendedor: { type: String, required: true },
  Tipo: { type: String, enum: ['entrada', 'salida'], required: true },
  Cantidad_bolsas: { type: Number, default: 0 },
  Cantidad_botes_llenos: { type: Number, default: 0 },
  Cantidad_botes_vacios: { type: Number, default: 0 } // <-- nuevo campo
}, { collection: 'Movimientos' });

const Movimiento = mongoose.model('Movimiento', movimientoSchema);

// ---------------- GET todos los movimientos ----------------
app.get('/movimientos', async (req, res) => {
  try {
    const movimientos = await Movimiento.find();
    res.json(movimientos);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener movimientos', error: err.message });
  }
});

// ---------------- POST nuevo movimiento ----------------
app.post('/movimientos', async (req, res) => {
  try {
    const { Tipo, Cantidad_botes_llenos, Cantidad_botes_vacios } = req.body;

    // Si es salida, los botes vacíos siempre serán 0
    if (Tipo === 'salida') req.body.Cantidad_botes_vacios = 0;

    const nuevoMovimiento = new Movimiento(req.body);
    await nuevoMovimiento.save();
    res.status(201).json({ mensaje: 'Movimiento agregado', movimiento: nuevoMovimiento });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al agregar movimiento', error: err.message });
  }
});

// ---------------- PUT editar movimiento ----------------
app.put('/movimientos/:id', async (req, res) => {
  try {
    const { Tipo } = req.body;

    // Si es salida, los botes vacíos siempre serán 0
    if (Tipo === 'salida') req.body.Cantidad_botes_vacios = 0;

    const movimientoActualizado = await Movimiento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!movimientoActualizado) {
      return res.status(404).json({ mensaje: 'Movimiento no encontrado' });
    }

    res.json({ mensaje: 'Movimiento actualizado', movimiento: movimientoActualizado });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar movimiento', error: err.message });
  }
});

// ---------------- DELETE eliminar movimiento ----------------
app.delete('/movimientos/:id', async (req, res) => {
  try {
    const eliminado = await Movimiento.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Movimiento no encontrado' });
    }
    res.json({ mensaje: 'Movimiento eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar movimiento', error: err.message });
  }
});


// ver si toy
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
