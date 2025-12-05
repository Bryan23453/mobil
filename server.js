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
  total: { type: Number, required: true },
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
      // Buscar por string exacto
      filtro.fecha = { $eq: new Date(fecha) };
    }

    const facturas = await Factura.find(filtro).sort({ fecha: -1 });
    res.json(facturas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener facturas" });
  }
});

////////////////////////// GENERAR FACTURA ///////////////////////////
app.post("/facturas/generar", async (req, res) => {
  try {
    const { vendedor, tipo, fecha, estado } = req.body;

    if (!vendedor || !tipo || !fecha) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }

    // Buscar vendedor por "usuario" o por "nombre" (ambos)
    let vendedorData = await Usuario.findOne({ usuario: vendedor, rol: "Vendedor" });
    if (!vendedorData) {
      vendedorData = await Usuario.findOne({ nombre: vendedor, rol: "Vendedor" });
    }

    if (!vendedorData) {
      return res.status(404).json({ mensaje: "El vendedor no existe" });
    }

    const vendedorIdReal = vendedorData._id;
    const nombreReal = vendedorData.nombre;

    const fechaStr = fecha.toString(); // "5/12/2025" por ejemplo

    // 1) Intentar buscar movimientos por string tal cual
    let movimientos = await Movimiento.find({ Vendedor: vendedor, Fecha: fechaStr });

    // 2) Si no encuentra, intentar con ceros: "05/12/2025"
    if (!movimientos || movimientos.length === 0) {
      const parts = fechaStr.split("/").map(s => s.padStart(2, "0"));
      const fechaPad = parts.join("/");
      movimientos = await Movimiento.find({ Vendedor: vendedor, Fecha: fechaPad });
    }

    // 3) Si sigue sin encontrar, intentar buscar por rango si los movimientos tienen fecha Date
    if (!movimientos || movimientos.length === 0) {
      const [d, m, y] = fechaStr.split("/").map(Number);
      if (d && m && y) {
        const inicio = new Date(y, m - 1, d);
        const fin = new Date(y, m - 1, d + 1);
        movimientos = await Movimiento.find({
          Vendedor: vendedor,
          $or: [
            { Fecha: fechaStr },
            { Fecha: fechaStr.split("/").map(s => s.padStart(2, '0')).join("/") },
            { Fecha: { $gte: inicio.toISOString(), $lt: fin.toISOString() } }
          ]
        });
      }
    }

    if (!movimientos || movimientos.length === 0) {
      return res.status(404).json({ mensaje: "No hay movimientos para esta fecha" });
    }

    // — Cálculo de cantidades —
    let totalBotesCobrados = 0;
    let totalBolsasCobradas = 0;
    let botesLlenosEntregados = 0;
    let botesVaciosRegresados = 0;
    let botesLlenosRegresados = 0;

    movimientos.forEach(m => {
      if (m.Tipo === "entrada") {
        totalBotesCobrados += m.Cantidad_botes_vacios || 0;
        totalBolsasCobradas -= m.Cantidad_bolsas || 0;

        botesVaciosRegresados += m.Cantidad_botes_vacios || 0;
        botesLlenosRegresados += m.Cantidad_botes_llenos || 0;
      }
      if (m.Tipo === "salida") {
        totalBolsasCobradas += m.Cantidad_bolsas || 0;
        botesLlenosEntregados += m.Cantidad_botes_llenos || 0;
      }
    });

    totalBolsasCobradas = Math.max(0, totalBolsasCobradas);

    // --- TRAER PRECIOS REALES DE LA DB ---
    const productosDB = await Producto.find(); // Asegúrate de que tu modelo se llame "Producto"
    const productos = [];

    if (totalBotesCobrados > 0) {
      const precioBotellon = productosDB.find(p => p.nombre.toLowerCase() === "botellón")?.precio || 120;
      productos.push({ nombre: "Botellón", cantidad: totalBotesCobrados, precio: precioBotellon });
    }

    if (totalBolsasCobradas > 0) {
      const precioBolsa = productosDB.find(p => p.nombre.toLowerCase() === "bolsa")?.precio || 45;
      productos.push({ nombre: "Bolsa", cantidad: totalBolsasCobradas, precio: precioBolsa });
    }

    const total = productos.reduce((acc, p) => acc + (p.cantidad * p.precio), 0);

    const [day, month, year] = fechaStr.split("/").map(Number);
    const fechaObj = new Date(year, month - 1, day);

    const nuevaFactura = new Factura({
      vendedor,
      tipo,
      fecha: fechaObj,
      productos,
      total,
      estado: estado || "Pendiente"
    });

    await nuevaFactura.save();

    // --- BOTES PRESTADOS ---
    const totalRegresado = botesVaciosRegresados + botesLlenosRegresados;
    const botesPendientes = botesLlenosEntregados - totalRegresado;

    if (botesPendientes > 0) {
      await new BotesPrestados({
        vendedorId: vendedorIdReal.toString(),
        nombre: nombreReal,
        botesPendientes,
        fecha: new Date()
      }).save();
    }

    res.status(201).json({
      mensaje: "Factura generada correctamente",
      factura: nuevaFactura,
      detalleBotes: {
        entregados: botesLlenosEntregados,
        regresados: totalRegresado,
        pendientes: botesPendientes
      }
    });

  } catch (error) {
    console.error("ERROR /facturas/generar:", error);
    res.status(500).json({ mensaje: "Error al generar factura", error: error.message });
  }
});





////////////////////////// FACTURAS DEL DÍA ///////////////////////////
app.get("/facturas/dia", async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ mensaje: "Debe enviar la fecha" });

    // fecha viene en formato "D/M/YYYY" o "DD/MM/YYYY"
    const [day, month, year] = fecha.split("/").map(Number);
    const inicio = new Date(year, month - 1, day);         // 00:00 local
    const fin = new Date(year, month - 1, day + 1);       // siguiente día 00:00 local

    const facturas = await Factura.find({
      fecha: { $gte: inicio, $lt: fin }
    }).sort({ fecha: -1 });

    res.json(facturas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener facturas", error: error.message });
  }
});


////////////////////////// PREVIEW FACTURA ///////////////////////////
app.get("/facturas/preview", async (req, res) => {
  try {
    const { vendedor, fecha } = req.query;
    if (!vendedor || !fecha) {
      return res.status(400).json({ mensaje: "Faltan parámetros" });
    }

    // Primero intenta buscar movimientos por string exacto (tu actual formato)
    let movimientos = await Movimiento.find({ Vendedor: vendedor, Fecha: fecha });

    // Si no encuentra, intenta normalizar: si fecha es "D/M/YYYY" probar "DD/MM/YYYY" o ISO
    if (!movimientos || movimientos.length === 0) {
      // intentar con ceros delante
      const parts = fecha.split("/").map(s => s.padLeft ? s.padLeft(2,'0') : s);
      const fechaPad = parts.join("/"); // "05/12/2025" si venía "5/12/2025"
      movimientos = await Movimiento.find({ Vendedor: vendedor, Fecha: fechaPad });
    }

    if (!movimientos || movimientos.length === 0) {
      return res.status(404).json({ mensaje: "No hay movimientos para esta fecha" });
    }

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

app.put("/facturas/pagar", async (req, res) => {
  const { vendedor, fecha } = req.body;

  try {
    const result = await Factura.updateMany(
      { vendedor, fecha, estado: "Pendiente" },
      { $set: { estado: "Pagada" } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Factura(s) pagada(s)" });
    } else {
      res.status(404).json({ message: "No se encontraron facturas pendientes" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar factura", error });
  }
});
////////////////////////////precios/////////////////////////////////////
const PreciosSchema = new mongoose.Schema({
  botellon: { type: Number, required: true },
  bolsa: { type: Number, required: true },
  fechaActualizacion: { type: Date, default: Date.now }
});


const Precios = mongoose.model("Precios", PreciosSchema);

// Obtener precios
app.get("/precios", async (req, res) => {
  try {
    const precios = await Precios.findOne({});
    if (!precios) {
      return res.status(404).json({ mensaje: "No hay tabla de precios configurada" });
    }
    res.json(precios);
  } catch (err) {
    res.status(500).json({ mensaje: "Error al obtener precios", error: err.message });
  }
});

// Actualizar precios
app.put("/precios", async (req, res) => {
  try {
    const { botellon, bolsa } = req.body;

    if (botellon == null || bolsa == null) {
      return res.status(400).json({ mensaje: "Debe enviar botellon y bolsa" });
    }

    const precios = await Precios.findOneAndUpdate(
      {},
      {
        botellon,
        bolsa,
        fechaActualizacion: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({ mensaje: "Precios actualizados correctamente", precios });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al actualizar precios", error: err.message });
  }
});
