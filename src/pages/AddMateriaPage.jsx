import React from "react";
import { useNavigate } from "react-router-dom";
import { AddMateriaForm } from "../components/Forms";

export default function AddMateriaPage({ newName, setNewName, newColorIdx, setNewColorIdx, styles, addMateria }) {
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!newName.trim()) return;
    addMateria(newName, newColorIdx);
    setNewName("");
    navigate("/");
  };

  return (
    <AddMateriaForm
      newName={newName}
      setNewName={setNewName}
      newColorIdx={newColorIdx}
      setNewColorIdx={setNewColorIdx}
      styles={styles}
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
    />
  );
}
