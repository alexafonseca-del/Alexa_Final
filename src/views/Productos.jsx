import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";


const Productos = () => {
const [mostrarModal, setMostrarModal] = useState(false);

const [productos, setProductos] = useState([]);

const [categorias, setCategorias] = useState([]);

const [busqueda, setBusqueda] = useState("");


const abrirModal = () => {
  setMostrarModal(true);
};

const cerrarModal = () => {
  setMostrarModal(false);
};
useEffect(() => {
  cargarCategorias();
}, []);

const cargarCategorias = async () => {

  const { data, error } = await supabase
    .from("categorias")
    .select("*");

  if (!error) {
    setCategorias(data);
  }
};
const registrarProducto = async ({
  nombre,
  precio,
  categoria,
  imagen
}) => {

  try {

    const nombreImagen =
      Date.now() + "_" + imagen.name;

    const { error: uploadError } = await supabase
      .storage
      .from("imagenes_productos")
      .upload(nombreImagen, imagen);

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase
      .storage
      .from("imagenes_productos")
      .getPublicUrl(nombreImagen);

    const urlPublica = urlData.publicUrl;

    const { error } = await supabase
      .from("productos")
      .insert([
        {
          nombre_producto: nombre,
          precio_producto: precio,
          id_categoria: categoria,
          imagen_producto: urlPublica
        }
      ]);

    if (!error) {

      alert("Producto registrado");

      cerrarModal();
    }

  } catch (error) {
    console.log(error);
  }
};


 return (
  <Container>

    <Row className="mt-4 mb-4">
      <Col>
        <h2>Productos</h2>
      </Col>

      <Col className="text-end">
        <Button onClick={abrirModal}>
          Nuevo Producto
        </Button>
      </Col>
    </Row>

    <ModalRegistroProducto
      mostrarModal={mostrarModal}
      cerrarModal={cerrarModal}
      registrarProducto={registrarProducto}
      categorias={categorias}
    />

  </Container>
);
};

export default Productos;
