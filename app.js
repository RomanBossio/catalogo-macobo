import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuración oficial de Firebase (MACOBO)
const firebaseConfig = {
    apiKey: "AIzaSyCgVvLlxPU6SaqFCuPGOPdBpFeCXsZXv6o",
    authDomain: "macobo-catalogo.firebaseapp.com",
    projectId: "macobo-catalogo",
    storageBucket: "macobo-catalogo.firebasestorage.app",
    messagingSenderId: "348308239937",
    appId: "1:348308239937:web:53c7a95cd8d0927070b8c0"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productosCol = collection(db, "productos");

// Función para limpiar y convertir automáticamente los links de Google Drive
window.convertirLinkDrive = function(urlOriginal) {
    if (!urlOriginal) return '';
    
    // Si ya es un enlace directo de Google Photos/Drive, lo devuelve tal cual
    if (urlOriginal.includes('lh3.googleusercontent.com')) {
        return urlOriginal;
    }

    // Si pegaste el link completo de Google Drive, extrae el ID automáticamente
    const match = urlOriginal.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        const idArchivo = match[1];
        return `https://lh3.googleusercontent.com/d/${idArchivo}`;
    }

    // Si es cualquier otro link, lo deja como está
    return urlOriginal;
};

// Obtener productos guardados en la nube
window.obtenerProductos = async function() {
    const snapshot = await getDocs(productosCol);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Dar de alta un producto nuevo
window.agregarProducto = async function(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
        const nuevoProd = {
            nombre: document.getElementById('nombre').value.trim(),
            categoria: document.getElementById('categoria').value,
            descripcion: document.getElementById('descripcion').value.trim(),
            imagen: convertirLinkDrive(document.getElementById('imagen').value.trim()),
            creadoEn: Date.now()
        };

        await addDoc(productosCol, nuevoProd);
        alert('¡Producto agregado con éxito!');
        document.getElementById('form-producto').reset();
        if (typeof cargarTablaAdmin === 'function') await cargarTablaAdmin();
    } catch (error) {
        console.error(error);
        alert('Error al guardar el producto. Verificá las reglas de Firestore.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Dar de Alta';
    }
};

// Preparar edición cargando los datos del producto
window.prepararEdicion = async function(id) {
    const docRef = doc(db, "productos", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const p = docSnap.data();
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-nombre').value = p.nombre || '';
        document.getElementById('edit-categoria').value = p.categoria || '';
        document.getElementById('edit-descripcion').value = p.descripcion || '';
        document.getElementById('edit-imagen').value = p.imagen || '';
        
        document.getElementById('seccion-editar').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Actualizar un producto existente
window.actualizarProducto = async function(e) {
    e.preventDefault();
    const idEditando = document.getElementById('edit-id').value;
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
        const docRef = doc(db, "productos", idEditando);
        await updateDoc(docRef, {
            nombre: document.getElementById('edit-nombre').value.trim(),
            categoria: document.getElementById('edit-categoria').value,
            descripcion: document.getElementById('edit-descripcion').value.trim(),
            imagen: convertirLinkDrive(document.getElementById('edit-imagen').value.trim())
        });

        alert('¡Producto modificado con éxito!');
        document.getElementById('form-editar').reset();
        document.getElementById('seccion-editar').classList.add('hidden');
        if (typeof cargarTablaAdmin === 'function') await cargarTablaAdmin();
    } catch (error) {
        console.error(error);
        alert('No se pudo modificar el producto.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar Cambios';
    }
};

// Eliminar producto
window.eliminarProducto = async function(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
            await deleteDoc(doc(db, "productos", id));
            if (typeof cargarTablaAdmin === 'function') await cargarTablaAdmin();
        } catch (error) {
            console.error(error);
            alert('Error al eliminar el producto.');
        }
    }
};