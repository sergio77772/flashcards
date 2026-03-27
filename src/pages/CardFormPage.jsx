import React from "react";
import { useNavigate } from "react-router-dom";
import { CardForm } from "../components/Forms";

export default function CardFormPage({
  isEdit,
  front, setFront,
  back, setBack,
  color,
  styles,
  onSave, // async function that does the actual DB write
}) {
  const navigate = useNavigate();

  const handleSubmit = async () => {
    await onSave();
    navigate(-1);
  };

  return (
    <CardForm
      isEdit={isEdit}
      front={front}
      setFront={setFront}
      back={back}
      setBack={setBack}
      color={color}
      styles={styles}
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
    />
  );
}
