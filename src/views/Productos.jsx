import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";

import TablaProductos from "../components/productos/TablaProductos";
import TarjetaProductos from "../components/productos/TarjetasProductos";

import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import NotificacionOperacion from "../components/NotificacionOperacion";

const Productos = () => {

    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [textoBusqueda, setTextoBusqueda] = useState("");

    // MODAL REGISTRO
    const [mostrarModal, setMostrarModal] = useState(false);

    // MODAL EDICION
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    const [productoEditar, setProductoEditar] = useState({});
    const [archivoEdicion, setArchivoEdicion] = useState(null);

    // MODAL ELIMINACION
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [productoAEliminar, setProductoAEliminar] = useState(null);

    // NUEVO PRODUCTO
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        archivo: null,
    });

    // TOAST
    const [toast, setToast] = useState({
        mostrar: false,
        mensaje: "",
        tipo: "",
    });

    // CARGAR PRODUCTOS
    const cargarProductos = async () => {

        try {

            const { data, error } = await supabase
                .from("productos")
                .select("*")
                .order("id_producto", { ascending: false });

            if (error) throw error;

            setProductos(data || []);

        } catch (err) {

            console.error("Error al cargar productos:", err);
        }
    };

    // CARGAR CATEGORIAS
    const cargarCategorias = async () => {

        try {

            const { data, error } = await supabase
                .from("categorias")
                .select("*")
                .order("id_categoria", { ascending: true });

            if (error) throw error;

            setCategorias(data || []);

        } catch (err) {

            console.error("Error al cargar categorías:", err);
        }
    };

    // FILTRO BUSQUEDA
    useEffect(() => {

        if (!textoBusqueda.trim()) {

            setProductosFiltrados(productos);

        } else {

            const textoLower = textoBusqueda.toLowerCase().trim();

            const filtrados = productos.filter((prod) => {

                const nombre = prod.nombre_producto?.toLowerCase() || "";
                const descripcion = prod.descripcion_producto?.toLowerCase() || "";
                const precio = prod.precio_venta?.toString() || "";

                return (
                    nombre.includes(textoLower) ||
                    descripcion.includes(textoLower) ||
                    precio.includes(textoLower)
                );
            });

            setProductosFiltrados(filtrados);
        }

    }, [textoBusqueda, productos]);

    // INICIALIZAR
    useEffect(() => {

        cargarProductos();
        cargarCategorias();

    }, []);

    // INPUT REGISTRO
    const manejoCambioInput = (e) => {

        const { name, value } = e.target;

        setNuevoProducto((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // IMAGEN REGISTRO
    const manejoCambioArchivo = (e) => {

        const archivo = e.target.files[0];

        if (archivo && archivo.type.startsWith("image/")) {

            setNuevoProducto((prev) => ({
                ...prev,
                archivo,
            }));

        } else {

            alert("Selecciona una imagen válida");
        }
    };

    // BUSQUEDA
    const manejarBusqueda = (e) => {

        setTextoBusqueda(e.target.value);
    };

    // REGISTRAR PRODUCTO
    const agregarProducto = async () => {

        try {

            if (
                !nuevoProducto.nombre_producto.trim() ||
                !nuevoProducto.categoria_producto ||
                !nuevoProducto.precio_venta ||
                !nuevoProducto.archivo
            ) {

                setToast({
                    mostrar: true,
                    mensaje: "Completa los campos obligatorios",
                    tipo: "advertencia",
                });

                return;
            }

            setMostrarModal(false);

            const nombreArchivo = `${Date.now()}-${nuevoProducto.archivo.name}`;

            const { error: uploadError } = await supabase.storage
                .from("imagenes_productos")
                .upload(nombreArchivo, nuevoProducto.archivo);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from("imagenes_productos")
                .getPublicUrl(nombreArchivo);

            const urlPublica = urlData.publicUrl;

            const { error } = await supabase
                .from("productos")
                .insert([
                    {
                        nombre_producto: nuevoProducto.nombre_producto,
                        descripcion_producto: nuevoProducto.descripcion_producto || null,
                        categoria_producto: nuevoProducto.categoria_producto,
                        precio_venta: parseFloat(nuevoProducto.precio_venta),
                        url_imagen: urlPublica,
                    },
                ]);

            if (error) throw error;

            setNuevoProducto({
                nombre_producto: "",
                descripcion_producto: "",
                categoria_producto: "",
                precio_venta: "",
                archivo: null,
            });

            setToast({
                mostrar: true,
                mensaje: "Producto registrado correctamente",
                tipo: "exito",
            });

            cargarProductos();

        } catch (err) {

            console.error(err);

            setToast({
                mostrar: true,
                mensaje: "Error al registrar producto",
                tipo: "error",
            });
        }
    };

    const eliminarProducto = async () => {
    try {

        if (!productoAEliminar) return;

        const { error } = await supabase
            .from("productos")
            .delete()
            .eq("id_producto", productoAEliminar.id_producto);

        if (error) throw error;

        setToast({
            mostrar: true,
            mensaje: "Producto eliminado correctamente",
            tipo: "exito",
        });

        setMostrarModalEliminacion(false);

        cargarProductos();

    } catch (err) {

        console.error(err);

        setToast({
            mostrar: true,
            mensaje: "Error al eliminar producto",
            tipo: "error",
        });
    }
};

    

    // INPUT EDICION
    const manejoCambioInputEdicion = (e) => {

        const { name, value } = e.target;

        setProductoEditar((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ARCHIVO EDICION
    const manejoCambioArchivoEdicion = (e) => {

        const archivo = e.target.files[0];

        if (archivo && archivo.type.startsWith("image/")) {

            setArchivoEdicion(archivo);

        } else {

            alert("Selecciona una imagen válida");
        }
    };

    // ACTUALIZAR PRODUCTO
    const actualizarProducto = async () => {

        try {

            let urlImagen = productoEditar.url_imagen;

            // NUEVA IMAGEN
            if (archivoEdicion) {

                const nombreArchivo = `${Date.now()}-${archivoEdicion.name}`;

                const { error: uploadError } = await supabase.storage
                    .from("imagenes_productos")
                    .upload(nombreArchivo, archivoEdicion);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from("imagenes_productos")
                    .getPublicUrl(nombreArchivo);

                urlImagen = data.publicUrl;
            }

            const { error } = await supabase
                .from("productos")
                .update({
                    nombre_producto: productoEditar.nombre_producto,
                    descripcion_producto: productoEditar.descripcion_producto,
                    categoria_producto: productoEditar.categoria_producto,
                    precio_venta: parseFloat(productoEditar.precio_venta),
                    url_imagen: urlImagen,
                })
                .eq("id_producto", productoEditar.id_producto);

            if (error) throw error;

            setToast({
                mostrar: true,
                mensaje: "Producto actualizado correctamente",
                tipo: "exito",
            });

            setMostrarModalEdicion(false);

            cargarProductos();

        } catch (err) {

            console.error(err);

            setToast({
                mostrar: true,
                mensaje: "Error al actualizar producto",
                tipo: "error",
            });
        }
    };

    return (
        <Container className="mt-3">

            <Row className="align-items-center mb-3">

                <Col>
                    <h3>
                        <i className="bi-bag-heart-fill me-2"></i>
                        Productos
                    </h3>
                </Col>

                <Col className="text-end">

                    <Button onClick={() => setMostrarModal(true)}>
                        <i className="bi-plus-lg me-2"></i>
                        Nuevo Producto
                    </Button>

                </Col>

            </Row>

            <hr />

            <Row className="mb-4">

                <Col md={6} lg={5}>

                    <CuadroBusquedas
                        textoBusqueda={textoBusqueda}
                        manejarCambioBusqueda={manejarBusqueda}
                        placeholder="Buscar producto..."
                    />

                </Col>

            </Row>

            {/* TABLA */}
            <div className="d-none d-md-block">

                <TablaProductos
    productos={productosFiltrados}
    categorias={categorias}
    abrirModalEdicion={(prod) => {
        setProductoEditar(prod);
        setMostrarModalEdicion(true);
    }}
    abrirModalEliminacion={(prod) => {
        setProductoAEliminar(prod);
        setMostrarModalEliminacion(true);
    }}
/>

            </div>

            {/* TARJETAS */}
            <div className="d-block d-md-none">

                <TarjetaProductos
                    productos={productosFiltrados}
                    abrirModalEdicion={(prod) => {
                        setProductoEditar(prod);
                        setMostrarModalEdicion(true);
                    }}
                    abrirModalEliminacion={(prod) => {
                        setProductoAEliminar(prod);
                        setMostrarModalEliminacion(true);
                    }}
                />

            </div>

            {/* MODAL REGISTRO */}
            <ModalRegistroProducto
                mostrarModal={mostrarModal}
                setMostrarModal={setMostrarModal}
                nuevoProducto={nuevoProducto}
                manejoCambioInput={manejoCambioInput}
                manejoCambioArchivo={manejoCambioArchivo}
                agregarProducto={agregarProducto}
                categorias={categorias}
            />

            {/* MODAL EDICION */}
            <ModalEdicionProducto
                mostrarModalEdicion={mostrarModalEdicion}
                setMostrarModalEdicion={setMostrarModalEdicion}
                productoEditar={productoEditar}
                manejoCambioInputEdicion={manejoCambioInputEdicion}
                manejoCambioArchivoEdicion={manejoCambioArchivoEdicion}
                actualizarProducto={actualizarProducto}
                categorias={categorias}
            />

            <ModalEliminacionProducto
    mostrarModalEliminacion={mostrarModalEliminacion}
    setMostrarModalEliminacion={setMostrarModalEliminacion}
    productoAEliminar={productoAEliminar}
    eliminarProducto={eliminarProducto}
/>

            {/* TOAST */}
            <NotificacionOperacion
                mostrar={toast.mostrar}
                mensaje={toast.mensaje}
                tipo={toast.tipo}
                onCerrar={() =>
                    setToast({
                        ...toast,
                        mostrar: false,
                    })
                }
            />

        </Container>
    );
};

export default Productos;