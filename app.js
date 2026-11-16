// Obtener productos guardados
function obtenerProductos() {
    let productos = localStorage.getItem('macobo_productos');
    return productos ? JSON.parse(productos) : [];
}

// Guardar lista de productos
function guardarProductos(productos) {
    localStorage.setItem('macobo_productos', JSON.stringify(productos));
}

// Dar de alta un producto nuevo
function agregarProducto(e) {
    e.preventDefault();
    let productos = obtenerProductos();

    let nuevoProd = {
        id: Date.now(),
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        descripcion: document.getElementById('descripcion').value,
        imagen: convertirLinkDrive(document.getElementById('imagen').value) // <-- Acá hace la magia solo
    };

    productos.push(nuevoProd);
    guardarProductos(productos);
    alert('¡Producto agregado con éxito!');
    document.getElementById('form-producto').reset();
    cargarTablaAdmin();
}

// Buscar producto por ID para modificar
function obtenerProductoPorId(id) {
    let productos = obtenerProductos();
    return productos.find(p => p.id === Number(id));
}

// Actualizar un producto existente
function actualizarProducto(e) {
    e.preventDefault();
    let productos = obtenerProductos();
    
    let idEditando = Number(document.getElementById('edit-id').value);
    let index = productos.findIndex(p => p.id === idEditando);

    if (index !== -1) {
        productos[index].nombre = document.getElementById('edit-nombre').value;
        productos[index].categoria = document.getElementById('edit-categoria').value;
        productos[index].descripcion = document.getElementById('edit-descripcion').value;
        productos[index].imagen = document.getElementById('edit-imagen').value;

        guardarProductos(productos);
        alert('¡Producto modificado con éxito!');
        document.getElementById('form-editar').reset();
        document.getElementById('seccion-editar').classList.add('hidden');
        cargarTablaAdmin();
    } else {
        alert('No se encontró el producto a modificar.');
    }
}

function prepararEdicion(id) {
    let p = obtenerProductoPorId(id);
    if (p) {
        document.getElementById('edit-id').value = p.id;
        document.getElementById('edit-nombre').value = p.nombre;
        document.getElementById('edit-categoria').value = p.categoria;
        document.getElementById('edit-descripcion').value = p.descripcion;
        document.getElementById('edit-imagen').value = p.imagen;
        
        document.getElementById('seccion-editar').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Eliminar producto
function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        let productos = obtenerProductos();
        let productosFiltrados = productos.filter(p => p.id !== id);
        guardarProductos(productosFiltrados);
        cargarTablaAdmin();
    }
}

// Función para limpiar y convertir automáticamente los links de Google Drive
function convertirLinkDrive(urlOriginal) {
    if (!urlOriginal) return '';
    
    // Si ya es un enlace directo de Google Photos/Drive, lo devuelve tal cual
    if (urlOriginal.includes('lh3.googleusercontent.com')) {
        return urlOriginal;
    }

    // Si pegaste el link completo de Google Drive, extrae el ID automáticamente
    let match = urlOriginal.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        let idArchivo = match[1];
        return `https://lh3.googleusercontent.com/d/${idArchivo}`;
    }

    // Si es cualquier otro link, lo deja como está
    return urlOriginal;
}