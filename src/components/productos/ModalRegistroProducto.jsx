import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

export default function ModalRegistroProducto({
  mostrarModal,
  cerrarModal,
  registrarProducto,
  categorias
}) {

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagen, setImagen] = useState(null);

  const [loading, setLoading] = useState(false);

  const manejarRegistro = async () => {
    if (loading) return;

    setLoading(true);

    await registrarProducto({
      nombre,
      precio,
      categoria,
      imagen
    });

    setLoading(false);
  };

 return (
  <Modal show={mostrarModal} onHide={cerrarModal}>
    <Modal.Header closeButton>
      <Modal.Title>Registrar Producto</Modal.Title>
    </Modal.Header>

    <Modal.Body>
        <Form>
  <Form.Group className="mb-3">
    <Form.Label>Nombre</Form.Label>
    <Form.Control
      type="text"
      placeholder="Ingrese nombre"
      value={nombre}
      onChange={(e) => setNombre(e.target.value)}
    />
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>Precio</Form.Label>
    <Form.Control
      type="number"
      placeholder="Ingrese precio"
      value={precio}
      onChange={(e) => setPrecio(e.target.value)}
    />
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>Categoría</Form.Label>

    <Form.Select
      value={categoria}
      onChange={(e) => setCategoria(e.target.value)}
    >
      <option value="">Seleccione</option>

      {
        categorias.map((cat) => (
          <option key={cat.id_categoria} value={cat.id_categoria}>
            {cat.categoria_producto}
          </option>
        ))
      }
    </Form.Select>
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>Imagen</Form.Label>

    <Form.Control
      type="file"
      onChange={(e) => setImagen(e.target.files[0])}
    />
  </Form.Group>
</Form>
    </Modal.Body>

    <Modal.Footer>
      <Button variant="secondary" onClick={cerrarModal}>
        Cerrar
      </Button>

      <Button
        variant="primary"
        onClick={manejarRegistro}
        disabled={loading}
      >
        {
          loading
          ? <Spinner animation="border" size="sm" />
          : "Guardar"
        }
      </Button>
    </Modal.Footer>
  </Modal>





);

};

export default ModalRegistroProducto;