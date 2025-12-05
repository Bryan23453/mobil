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

///////////////////////////productos/inventarios////////////////////////////////////////////////////////////////////////////
// ------------------- Modelo -------------------
const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
});

const Producto = mongoose.model("Producto", productoSchema, "Inventario");

// ------------------- Endpoints -------------------

// Obtener todos los productos
app.get("/productos", async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un producto por ID
app.get("/productos/:id", async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo producto
app.post("/productos", async (req, res) => {
  try {
    const { nombre, cantidad, precio } = req.body;
    const nuevoProducto = new Producto({ nombre, cantidad, precio });
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar un producto por ID
app.put("/productos/:id", async (req, res) => {
  try {
    const { nombre, cantidad, precio } = req.body;
    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      { nombre, cantidad, precio },
      { new: true }
    );
    if (!productoActualizado) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(productoActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar un producto por ID
app.delete("/productos/:id", async (req, res) => {
  try {
    const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
    if (!productoEliminado) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/////////////////////////// contabilidad (ingresos y gastos) ///////////////////////////

// Schema para contabilidad
const contabilidadSchema = new mongoose.Schema({
  descripcion: { type: String, required: true },
  monto: { type: Number, required: true },
  tipo: { type: String, enum: ['Ingreso', 'Gasto'], required: true },
  fecha: { type: String, required: true }
}, { collection: 'Contabilidad' });

const Contabilidad = mongoose.model('Contabilidad', contabilidadSchema);

// ---------------- GET todos los registros contables ----------------
app.get('/contabilidad', async (req, res) => {
  try {
    const registros = await Contabilidad.find();
    res.json(registros);
  } catch (err) {
    console.error("Error al obtener registros contables:", err);
    res.status(500).json({ mensaje: 'Error al obtener registros contables', error: err.message });
  }
});

// ---------------- POST nuevo registro contable ----------------
app.post('/contabilidad', async (req, res) => {
  try {
    const { descripcion, monto, tipo, fecha } = req.body;
    const nuevoRegistro = new Contabilidad({ descripcion, monto, tipo, fecha });
    await nuevoRegistro.save();
    res.status(201).json({ mensaje: 'Registro contable agregado', registro: nuevoRegistro });
  } catch (err) {
    console.error("Error al agregar registro contable:", err);
    res.status(500).json({ mensaje: 'Error al agregar registro contable', error: err.message });
  }
});

// ---------------- PUT editar registro contable ----------------
app.put('/contabilidad/:id', async (req, res) => {
  try {
    const { descripcion, monto, tipo, fecha } = req.body;
    const registroActualizado = await Contabilidad.findByIdAndUpdate(
      req.params.id,
      { descripcion, monto, tipo, fecha },
      { new: true }
    );

    if (!registroActualizado) {
      return res.status(404).json({ mensaje: 'Registro contable no encontrado' });
    }

    res.json({ mensaje: 'Registro contable actualizado', registro: registroActualizado });
  } catch (err) {
    console.error("Error al actualizar registro contable:", err);
    res.status(500).json({ mensaje: 'Error al actualizar registro contable', error: err.message });
  }
});

// ---------------- DELETE eliminar registro contable ----------------
app.delete('/contabilidad/:id', async (req, res) => {
  try {
    const eliminado = await Contabilidad.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Registro contable no encontrado' });
    }
    res.json({ mensaje: 'Registro contable eliminado con éxito' });
  } catch (err) {
    console.error("Error al eliminar registro contable:", err);
    res.status(500).json({ mensaje: 'Error al eliminar registro contable', error: err.message });
  }
});
// GET total de ingresos
app.get('/contabilidad/ingresos', async (req, res) => {
  try {
    const totalIngresos = await Contabilidad.aggregate([
      { $match: { tipo: 'Ingreso' } },
      { $group: { _id: null, total: { $sum: '$monto' } } },
    ]);
    res.json({ total: totalIngresos[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET total de gastos
app.get('/contabilidad/gastos', async (req, res) => {
  try {
    const totalGastos = await Contabilidad.aggregate([
      { $match: { tipo: 'Gasto' } },
      { $group: { _id: null, total: { $sum: '$monto' } } },
    ]);
    res.json({ total: totalGastos[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/////////////////////////// Botes prestados ///////////////////////////

const botesPrestadosSchema = new mongoose.Schema({
  vendedorId: { type: String, required: true }, // guardamos el id como string
  nombre: { type: String, required: true },     // nombre del vendedor
  botesPendientes: { type: Number, required: true }, // cantidad de botes
  fecha: { type: Date, default: Date.now }      // fecha del registro
});


const BotesPrestados = mongoose.model("Botes_prestados", botesPrestadosSchema, "Botes_prestados");

// POST botes
app.post("/botes-prestados", async (req, res) => {
  try {
    const nuevo = new BotesPrestados({
      vendedorId: req.body.vendedorId,
      nombre: req.body.nombre,
      botesPendientes: req.body.botesPendientes,
      fecha: req.body.fecha,
    });

    await nuevo.save();
    res.json({ mensaje: "Registro agregado correctamente", data: nuevo });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el registro" });
  }
});



// GET todos los vendedores con botes pendientes
app.get("/botes-prestados", async (req, res) => {
  try {
    const resultado = await BotesPrestados.aggregate([
      {
        $group: {
          _id: { vendedorId: "$vendedorId", nombre: "$nombre" },
          botesPendientes: { $sum: "$botesPendientes" } // ya no usamos $toInt
        }
      },
      {
        $project: {
          _id: 0,
          vendedorId: "$_id.vendedorId",
          nombre: "$_id.nombre",
          botesPendientes: 1
        }
      }
    ]);

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los vendedores con botes pendientes" });
  }
});

////////////////////////// FACTURAAAAAAAA ///////////////////////////
const facturaSchema = new mongoose.Schema({
  vendedor: { type: String, required: true },
  tipo: { type: String, required: true }, // "Vendedor" o "Directa"
  fecha: { type: Date, required: true },
  productos: [
    {
      nombre: { type: String, required: true },
      cantidad: { type: Number, required: true },
      precio: { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true },  // <---- AGREGADO
  estado: { type: String, required: true } // "Pagada" o "Pendiente"
}, { collection: "Facturas" });

const Factura = mongoose.model("Factura", facturaSchema);


////////////////////////// GET FACTURAS ///////////////////////////
app.get("/facturas", async (req, res) => {
  try {
    const { tipo, estado, fecha } = req.query;
    let filtro = {};

    if (tipo && tipo !== "Todos") filtro.tipo = tipo;
    if (estado && estado !== "Todos") filtro.estado = estado;

    if (fecha) {
      const fechaObj = new Date(fecha);
      const inicio = new Date(fechaObj.setHours(0,0,0,0));
      const fin = new Date(fechaObj.setHours(23,59,59,999));

      filtro.fecha = { $gte: inicio, $lte: fin };
    }

    const facturas = await Factura.find(filtro).sort({ fecha: -1 });
    res.json(facturas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener facturas" });
  }
});


////////////////////////// FACTURAS NUEVOS ENDPOINTS ///////////////////////////
app.post("/facturas/generar", async (req, res) => {
  try {
    const { vendedor, tipo, fecha } = req.body;

    if (!vendedor || !tipo || !fecha) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }

    // Convertir fecha enviada a día, mes, año
    const [year, month, day] = fecha.split("-").map(Number);
    const fechaObj = new Date(year, month - 1, day);

    // Buscar movimientos por día, sin importar formato de hora
    const movimientos = await Movimiento.find({
      Vendedor: vendedor,
      Fecha: new RegExp(`^${day}/${month}/${year}$`) // Esto funciona para tu colección movimientos
    });

    if (movimientos.length === 0) {
      return res.status(404).json({ mensaje: "No hay movimientos para esta fecha" });
    }

    // ---------------------- CÁLCULO CORRECTO DE COBRO ----------------------
    let totalBotesCobrados = 0;
    let totalBolsasCobradas = 0;

    movimientos.forEach(m => {
      if (m.Tipo === "entrada") {
        totalBotesCobrados += m.Cantidad_botes_vacios || 0;
        totalBolsasCobradas -= m.Cantidad_bolsas || 0;
      }
      if (m.Tipo === "salida") {
        totalBolsasCobradas += m.Cantidad_bolsas || 0;
      }
    });

    totalBolsasCobradas = Math.max(0, totalBolsasCobradas);

    const productos = [];
    if (totalBotesCobrados > 0)
      productos.push({ nombre: "Botellón", cantidad: totalBotesCobrados, precio: 120 });
    if (totalBolsasCobradas > 0)
      productos.push({ nombre: "Bolsa", cantidad: totalBolsasCobradas, precio: 45 });

    const total = productos.reduce((acc, p) => acc + (p.cantidad * p.precio), 0);

    const nuevaFactura = new Factura({
      vendedor,
      tipo,
      fecha: fechaObj,
      productos,
      total,
      estado: "Pendiente"
    });

    await nuevaFactura.save();
    res.status(201).json({ mensaje: "Factura generada correctamente", factura: nuevaFactura });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al generar factura", error: error.message });
  }
});



////////////////////////// GET FACTURAS DEL DÍA ///////////////////////////
app.get("/facturas/dia", async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ mensaje: "Debe enviar la fecha" });

    const fechaObj = new Date(fecha);
    const inicio = new Date(fechaObj.setHours(0,0,0,0));
    const fin = new Date(fechaObj.setHours(23,59,59,999));

    const facturas = await Factura.find({
      fecha: { $gte: inicio, $lte: fin }
    });

    res.json(facturas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener facturas", error: error.message });
  }
});
app.get("/facturas/preview", async (req, res) => {
  try {
    const { vendedor, fecha } = req.query;
    if (!vendedor || !fecha) {
      return res.status(400).json({ mensaje: "Faltan parámetros" });
    }

    // Buscar movimientos del vendedor con la fecha exacta como string
    const movimientos = await Movimiento.find({
      Vendedor: vendedor,
      Fecha: fecha  // <-- comparar directamente con tu formato "d/m/yyyy"
    });

    let totalBotes = 0;
    let totalBolsas = 0;

    movimientos.forEach(m => {
      if (m.Tipo === "entrada") {
        totalBotes += m.Cantidad_botes_vacios || 0;
        totalBolsas -= m.Cantidad_bolsas || 0;
      }
      if (m.Tipo === "salida") {
        totalBolsas += m.Cantidad_bolsas || 0;
      }
    });

    totalBolsas = Math.max(0, totalBolsas);

    res.json({ botes: totalBotes, bolsas: totalBolsas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al generar preview", error: error.message });
  }
});
