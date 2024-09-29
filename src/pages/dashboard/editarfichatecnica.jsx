import {
  DialogBody,
  DialogFooter,
  Typography,
  Input,
  Textarea,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "../../utils/axiosConfig";

export function EditarFichaTecnica({ handleClose, fetchFichas, ficha, productos, insumos }) {
  const [selectedFicha, setSelectedFicha] = useState(ficha);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setSelectedFicha(ficha);
  }, [ficha]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedFicha({ ...selectedFicha, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };


  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  const handleDetalleChange = (index, e) => {
    const { name, value } = e.target;
    const detalles = [...selectedFicha.detallesFichaTecnicat];
    detalles[index][name] = value;
    setSelectedFicha({ ...selectedFicha, detallesFichaTecnicat: detalles });
    setErrors({ ...errors, [`${name}_${index}`]: "" });
  };

  const hasDuplicateInsumos = () => {
    const insumosIds = selectedFicha.detallesFichaTecnicat.map(detalle => detalle.id_insumo);
    return insumosIds.some((id, index) => insumosIds.indexOf(id) !== index);
  };

  const handleAddDetalle = () => {
    if (hasDuplicateInsumos()) {
      Toast.fire({
        icon: 'error',
        title: 'No se pueden agregar insumos duplicados.'
      });
      return;
    }
  
    setSelectedFicha({
      ...selectedFicha,
      detallesFichaTecnicat: [...selectedFicha.detallesFichaTecnicat, { id_insumo: "", cantidad: "" }]
    });
  };
  

  const handleRemoveDetalle = (index) => {
    const detalles = [...selectedFicha.detallesFichaTecnicat];
    detalles.splice(index, 1);
    setSelectedFicha({ ...selectedFicha, detallesFichaTecnicat: detalles });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedFicha.id_producto) newErrors.id_producto = "El producto es requerido";
    if (!selectedFicha.descripcion) newErrors.descripcion = "La descripción es requerida";
    if (!selectedFicha.insumos) newErrors.insumos = "Los insumos son requeridos";
    
    selectedFicha.detallesFichaTecnicat.forEach((detalle, index) => {
      if (!detalle.id_insumo) newErrors[`id_insumo_${index}`] = "El insumo es requerido";
      if (!detalle.cantidad) newErrors[`cantidad_${index}`] = "La cantidad es requerida";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const fichaToSave = {
      ...selectedFicha,
      detallesFichaTecnica: selectedFicha.detallesFichaTecnicat,
    };

    try {
      await axios.put(`http://localhost:3000/api/fichastecnicas/${selectedFicha.id_ficha}`, fichaToSave);
      Toast.fire({
        icon: 'success',
        title: 'La ficha técnica ha sido actualizada correctamente.'
      });
      fetchFichas();
      handleClose();
    } catch (error) {
      console.error("Error saving ficha:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: "Hubo un problema al guardar la ficha técnica." });
      }
    }
  };    

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 rounded-lg shadow-lg">
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#000000',
          marginBottom: '0.5rem',
        }}
      >
        Editar Ficha Técnica
      </div>

      <DialogBody divider className="flex flex-col max-h-[100vh] overflow-hidden">
        {/* Sección Izquierda */}
        <div className="flex flex-col gap-4 w-full p-4 bg-white rounded-lg shadow-sm">
          <div className="flex gap-4">
          <div className="flex flex-col gap-2 w-1/2">
            <label className="block text-sm font-medium text-black">Producto:</label>
            <select
               className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-0"
              name="id_producto"
              required
              value={selectedFicha.id_producto}
              onChange={handleChange}
            >
              <option value="">Seleccione un producto</option>
              {productos.filter(producto => producto.estado).map(producto => (
                <option key={producto.id_producto} value={producto.id_producto}>
                  {producto.nombre}
                </option>
              ))}
            </select>
            {errors.id_producto && <p className="text-red-500 text-xs mt-1">{errors.id_producto}</p>}
          </div>
          </div>

      <div className="flex gap-4">    
    <div className="flex flex-col gap-2 w-1/2">
            <label className="block text-sm font-medium text-black">Descripción de la ficha técnica:</label>
            <Textarea
              name="descripcion"
              required
              value={selectedFicha.descripcion}
              onChange={handleChange}
              rows={2}
              className="text-sm w-full max-w-[400px] resize-none border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0"
              
            />
            {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
          </div>
          
          <div className="flex flex-col gap-2 w-1/2">
          <label className="block text-sm font-medium text-black">Descripción detallada de los insumos:</label>
            <Textarea
              name="insumos"
              required
              value={selectedFicha.insumos}
              onChange={handleChange}
              rows={3}
               className="text-sm w-full max-w-[400px] resize-none border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0"
            />
            {errors.insumos && <p className="text-red-500 text-xs mt-1">{errors.insumos}</p>}
          </div>
          </div>
          </div>

        {/* Tabla de Detalles de Insumos con barra de desplazamiento y diseño estético */}
        <div className="w-full p-4 bg-white rounded-lg shadow-lg">
  <Typography variant="h6" color="black" className="text-lg font-semibold mb-4">
    Detalles de Insumos
  </Typography>

  <div className="overflow-x-auto max-h-64">
    <table className="min-w-full table-auto border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-40 py-2 text-left text-sm font-medium text-black border-b">Insumo</th>
          <th className="px-6 py-2 text-left text-sm font-medium text-black border-b">Cantidad</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-black border-b">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
            {selectedFicha.detallesFichaTecnicat.map((detalle, index) => (
               <tr key={index} className="bg-white hover:bg-gray-100 transition-colors">
                  <td className="px-4 py-2">
                 
                  <select
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-0"
                    name="id_insumo"
                    value={detalle.id_insumo}
                    required
                    onChange={(e) => handleDetalleChange(index, e)}
                  >
                    <option value="">Seleccione un insumo</option>
                    {insumos.filter(insumo => insumo.estado).map(insumo => (
                      <option key={insumo.id_insumo} value={insumo.id_insumo}>
                        {insumo.nombre}
                      </option>
                    ))}
                  </select>
                  {errors[`id_insumo_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`id_insumo_${index}`]}</p>}
                  </td>

                  <td className="px-4 py-2">
                 
                  <input
                    name="cantidad"
                    required
                    type="number"
                    value={detalle.cantidad}
                    onChange={(e) => {
                      // Validar que el valor no sea negativo
                      const value = e.target.value;
                      if (value >= 0) {
                        handleDetalleChange(index, e); // Solo se actualiza si el valor es >= 0
                      }}}
                     className="text-sm w-24 p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0"
                  />
                  {errors[`cantidad_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`cantidad_${index}`]}</p>}
                  </td>

                  <td className="px-4 py-2 text-righ">
                <IconButton
                color="red"
                  onClick={() => handleRemoveDetalle(index)}                 
                  size="sm"
                >
                  <TrashIcon className="w-5 h-5" />
                </IconButton>
                </td>
          </tr>
            ))}
           </tbody>
    </table>
  </div>

  <div className="flex justify-end mt-4">
          <Button
            onClick={handleAddDetalle}
            size="sm"
            className="flex items-center gap-2 bg-black text-white hover:bg-pink-800 px-4 py-2 rounded-md"
          
         >
          <PlusIcon className="h-5 w-5" />
      Agregar Insumo
    </Button>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className=" p-4 flex justify-end gap-4 border-t border-gray-200">
        <Button
          variant="text"
          size="sm"
          onClick={handleClose}
          className="btncancelarm text-white"
        >
          Cancelar
        </Button>
        <Button
          variant="gradient"
          size="sm"
          onClick={handleSave}
          className="btnagregarm text-white"
        >
          Guardar Cambios
        </Button>
      </DialogFooter>
    </div>
  );
}