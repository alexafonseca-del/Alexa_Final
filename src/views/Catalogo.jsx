import React, { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Spinner, Alert, Form } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import TarjetaCatalogo from "../components/catalogo/TarjetaCatalogo";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";

const Catalogo = () => {

  // 🔹 Estados
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Cargar datos
  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [resProductos, resCategorias] = await Promise.all([
        supabase
          .from("productos")
          .select("*")
          .order("nombre_producto", { ascending: true }),

        supabase
          .from("categorias")
          .select("id_categoria, nombre_categoria")
          .order("nombre_categoria", { ascending: true }),
      ]);

      if (resProductos.error) throw resProductos.error;
      if (resCategorias.error) throw resCategorias.error;

      setProductos(resProductos.data || []);
      setCategorias(resCategorias.data || []);

    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los productos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // 🔹 Eventos
  const manejarCambioCategoria = (e) => {
    setCategoriaSeleccionada(e.target.value);
  };

  const manejarCambioBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  // 🔹 Obtener nombre categoría
  const obtenerNombreCategoria = (idCategoria) => {
    const cat = categorias.find((c) => c.id_categoria === idCategoria);
    return cat ? cat.nombre_categoria : "Sin categoría";
  };

  // 🔹 Filtrado
  const productosFiltrados = useMemo(() => {
    let filtrados = [...productos];

    // filtro por categoría
    if (categoriaSeleccionada !== "todas") {
      filtrados = filtrados.filter(
        (p) => p.categoria_producto === parseInt(categoriaSeleccionada)
      );
    }

    // filtro por texto
    if (textoBusqueda.trim()) {
      const texto = textoBusqueda.toLowerCase();

      filtrados = filtrados.filter((p) => {
        const nombre = p.nombre_producto?.toLowerCase() || "";
        const descripcion = p.descripcion_producto?.toLowerCase() || "";
        const precio = p.precio_venta?.toString() || "";

        return (
          nombre.includes(texto) ||
          descripcion.includes(texto) ||
          precio.includes(texto)
        );
      });
    }

    return filtrados;
  }, [productos, categoriaSeleccionada, textoBusqueda]);

  return (
    <Container className="mt-3">

      {/* TÍTULO */}
      <Row className="text-center mb-3">
        <Col>
          <h2>Catálogo</h2>
          <p className="text-muted">Explora nuestros productos</p>
        </Col>
      </Row>

      {/* FILTROS */}
      <Row className="mb-3 align-items-end">

        {/* Categoría */}
        <Col md={4}>
          <Form.Select
            value={categoriaSeleccionada}
            onChange={manejarCambioCategoria}
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre_categoria}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Busqueda */}
        <Col md={6}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarCambioBusqueda}
          />
        </Col>

      </Row>

      {/* LOADING */}
      {cargando && (
        <Row className="text-center mt-5">
          <Col>
            <Spinner animation="border" />
            <p className="mt-2">Cargando productos...</p>
          </Col>
        </Row>
      )}

      {/* ERROR */}
      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

      {/* SIN RESULTADOS */}
      {!cargando && productosFiltrados.length === 0 && (
        <Alert variant="info" className="text-center">
          No se encontraron productos
        </Alert>
      )}

      {/* PRODUCTOS */}
      <Row className="g-3">
        {productosFiltrados.map((producto) => (
          <Col key={producto.id_producto} xs={6} md={4} lg={3}>
            <TarjetaCatalogo
              producto={producto}
              categoriaNombre={obtenerNombreCategoria(
                producto.categoria_producto
              )}
            />
          </Col>
        ))}
      </Row>

    </Container>
  );
};

export default Catalogo;