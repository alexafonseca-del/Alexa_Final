import React from "react";
import { Table, Button, Image, Alert } from "react-bootstrap";

const TablaProductos = ({
    productos,
    onEditar,
    onEliminar,
    onPDF
}) => {

    if (!productos || productos.length === 0) {
        return (
            <Alert variant="info" className="mt-3">
                No hay productos registrados
            </Alert>
        );
    }

    return (
        <Table striped bordered hover responsive className="mt-3">
            <thead>
                <tr className="text-center">
                    <th>#</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                {productos.map((prod, index) => (
                    <tr key={prod.id_producto}>
                        <td className="text-center">{index + 1}</td>

                        <td className="text-center">
                            {prod.url_imagen ? (
                                <Image
                                    src={prod.url_imagen}
                                    alt="producto"
                                    width={60}
                                    height={60}
                                    rounded
                                />
                            ) : (
                                "Sin imagen"
                            )}
                        </td>

                        <td>{prod.nombre_producto}</td>

                        <td>
                            {prod.descripcion_producto || (
                                <span className="text-muted">Sin descripción</span>
                            )}
                        </td>

                        <td className="text-center">
                            {prod.categoria_producto}
                        </td>

                        <td className="text-end">
                            C$ {parseFloat(prod.precio_venta).toFixed(2)}
                        </td>

                        <td className="text-center">

                            <Button
                                variant="outline-warning"
                                size="sm"
                                className="me-2"
                                onClick={() => onEditar(prod)}
                            >
                                <i className="bi bi-pencil-square"></i>
                            </Button>

                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => onEliminar(prod)}
                            >
                                <i className="bi bi-trash"></i>
                            </Button>

                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default TablaProductos;