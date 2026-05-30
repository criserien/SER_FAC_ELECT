const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 
const app = express();

// Middlewares
// 💡 OPTIMIZACIÓN: Restringe el CORS en producción para que solo tu frontend pueda hacer peticiones
const allowedOrigins = [
    'http://localhost:4200', // Reemplaza por el puerto local de tu frontend (ej. Angular)
    process.env.FRONTEND_URL // URL de tu frontend en Render/Vercel (se configura en las variables de entorno)
];

app.use(cors({
    origin: function (origin, callback) {
        // Permite peticiones sin origen (como Postman o apps móviles nativas si es el caso)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por políticas de CORS (Render)'));
        }
    }
})); 

app.use(express.json());

// 1. CONFIGURACIÓN DEL POOL DE CONEXIONES (Hacia TiDB Cloud)
// 🚨 CRÍTICO: Se eliminaron las credenciales en texto plano por seguridad. 
// Las leeremos desde variables de entorno en Render.
const db = mysql.createPool({
    host: process.env.DB_HOST || 'gateway01.us-east-1.prod.aws.tidbcloud.com', 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'test',
    port: parseInt(process.env.DB_PORT) || 4000, 
    multipleStatements: true,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true 
    },
    waitForConnections: true,
    connectionLimit: 10,       
    queueLimit: 0,
    enableKeepAlive: true,     
    keepAliveInitialDelay: 10000 
});

console.log('🚀 Pool de conexiones a TiDB Cloud inicializado correctamente');

// ========================================
// RUTAS Y ENDPOINTS
// ========================================

// Guardar el bloque de las 9 facturas
app.post('/factura', (req, res) => {
    const { 
        producto, cantidad, total, numero, dia, mes, anio, cliente, direc_tel, total_mayor, 
        producto2, cantidad2, total2, total_mayor2,
        producto3, cantidad3, total3, total_mayor3,
        producto4, cantidad4, total4, total_mayor4,
        producto5, cantidad5, total5, total_mayor5,
        producto6, cantidad6, total6, total_mayor6,
        producto7, cantidad7, total7, total_mayor7,
        producto8, cantidad8, total8, total_mayor8,
        producto9, cantidad9, total9, total_mayor9
    } = req.body;

    const sql = `
        INSERT INTO facturas (producto, cantidad, total, numero, dia, mes, anio, cliente, direc_tel, total_mayor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        INSERT INTO facturas2 (producto, cantidad, total, total_mayor) VALUES (?, ?, ?, ?);
        INSERT INTO facturas3 (producto, cantidad, total, total_mayor) VALUES (?, ?, ?, ?);
        INSERT INTO facturas4 (producto, cantidad, total, total_mayor) VALUES (?, ?, ?, ?);
        INSERT INTO facturas5 (producto, cantidad, total, total_mayor) VALUES (?, ?, ?, ?);
        INSERT INTO facturas6 (producto, cantidad, total, total_mayor) VALUES (?, ?, ?, ?);
        INSERT INTO facturas7 (producto, cantidad, total, total_mayor) VALUES (?, ?, ?, ?);
        INSERT INTO facturas8 (producto, cantidad, total, total_mayor) VALUES (?, ?, ?, ?);
        INSERT INTO facturas9 (producto, cantidad, total, total_mayor) VALUES (?, ?, ?, ?);
    `;

    const values = [
        producto, cantidad, total, numero, dia, mes, anio, cliente, direc_tel, total_mayor,
        producto2, cantidad2, total2, total_mayor2,
        producto3, cantidad3, total3, total_mayor3,
        producto4, cantidad4, total4, total_mayor4,
        producto5, cantidad5, total5, total_mayor5,
        producto6, cantidad6, total6, total_mayor6,
        producto7, cantidad7, total7, total_mayor7,
        producto8, cantidad8, total8, total_mayor8,
        producto9, cantidad9, total9, total_mayor9
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al insertar facturas:', err);
            return res.status(500).send({ message: 'Error al guardar', error: err.message });
        }
        res.status(201).send({ message: 'Las 9 facturas han sido guardadas correctamente' });
    });
});

// Obtener el total de registros en la tabla facturas
app.get('/api/facturas-count', (req, res) => {
    const query = 'SELECT COUNT(*) AS total FROM facturas';

    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error al contar las facturas:', err);
            return res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
        }
        const totalRegistros = rows[0].total;
        res.json({ total: totalRegistros });
    });
});

// Obtener un registro por ID
app.get('/api/facturas/:id', (req, res) => {
    const { id } = req.params; 
    const query = 'SELECT * FROM facturas WHERE id = ?';

    db.query(query, [id], (err, rows) => {
        if (err) {
            console.error('Error al obtener el registro:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }
        res.json(rows[0]); 
    });
});

// Obtener el total de registros de fechas en la tabla facturas
app.get('/api/facturas-count-fechas/:dia/:mes/:anio', (req, res) => {
    const { dia, mes, anio } = req.params;
    const query = 'SELECT COUNT(*) AS total FROM facturas WHERE dia = ? AND mes = ? AND anio = ?';

    db.query(query, [dia, mes, anio], (err, rows) => {
        if (err) {
            console.error('Error al contar las facturas por fecha:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        const totalRegistros = rows[0].total;
        res.json({ total: totalRegistros });
    });
});

// FACTURA 1 // Obtener registros por fecha
app.get('/api/facturas-fecha/:dia/:mes/:anio', (req, res) => {
    const { dia, mes, anio } = req.params; 
    const query = 'SELECT * FROM facturas WHERE dia = ? AND mes = ? AND anio = ?';

    db.query(query, [dia, mes, anio], (err, rows) => {
        if (err) {
            console.error('Error al obtener los registros:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron facturas' });
        }
        res.json(rows); 
    });
});

// Obtener el total de clientes por coincidencia de nombre
app.get('/api/facturas-premio/:cliente', (req, res) => {
    const { cliente } = req.params;
    const query = 'SELECT COUNT(*) AS total_clientes FROM facturas WHERE cliente LIKE ?;';

    db.query(query, [`%${cliente}%`], (err, rows) => {
        if (err) {
            console.error('Error al contar los clientes:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        const totalClientes = rows[0].total_clientes;
        res.json({ total_clientes: totalClientes });
    });
});

// FACTURAS 2 AL 9 (Bucle optimizado)
for (let i = 2; i <= 9; i++) {
    app.get(`/api/facturas${i}/:id`, (req, res) => {
        const { id } = req.params;
        const query = `SELECT * FROM facturas${i} WHERE id = ?`;

        db.query(query, [id], (err, rows) => {
            if (err) {
                console.error(`Error al obtener factura ${i}:`, err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Registro no encontrado' });
            }
            res.json(rows[0]);
        });
    });
}

// 2. LEVANTAR EL SERVIDOR WEB
const PORT = process.env.PORT || 3000; 

app.listen(PORT, () => {
    console.log(`✅ Servidor Express corriendo en el puerto ${PORT}`);
});