import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddBolillaForm } from "../components/Forms";

export default function AddBolillaPage({ newName, setNewName, color, styles, addBolilla }) {
  const navigate = useNavigate();
  const { materiaId } = useParams();

  const handleSubmit = () => {
    if (!newName.trim()) return;
    addBolilla(materiaId, newName);
    setNewName("");
    navigate(`/materia/${materiaId}`);
  };

  return (
    <AddBolillaForm
      newName={newName}
      setNewName={setNewName}
      color={color}
      styles={styles}
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
    />
  );
}
