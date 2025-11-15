const multer = require('multer');
//const path = require('path');

// Configuración de almacenamiento
const storage = multer.memoryStorage();

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('El archivo debe ser una imagen'), false);
    }
};

// Configuración de multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
        files: 10 // máximo 10 archivos
    }
});

// Middleware para subir una sola imagen
const uploadSingle = upload.single('image');

// Middleware para subir múltiples imágenes
const uploadMultiple = upload.array('images', 10);

// Middleware de manejo de errores de multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'El archivo es demasiado grande. Máximo 5MB permitido.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Demasiados archivos. Máximo 10 imágenes permitidas.'
            });
        }
        return res.status(400).json({
            message: 'Error al subir el archivo',
            error: err.message
        });
    }
    next(err);
};

module.exports = {
    uploadSingle,
    uploadMultiple,
    handleMulterError
}; 