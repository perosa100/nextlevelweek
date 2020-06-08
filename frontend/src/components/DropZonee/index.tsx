import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import "./styles.css";
import { FiUpload } from "react-icons/fi";

interface Props {
  onFileUploaded: (file: File) => void;
}

const DropZonee: React.FC<Props> = ({ onFileUploaded }) => {
  const [seletecdFileUrl, setSeletecdFileUrl] = useState<string>("");
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];

    const fileUrl = URL.createObjectURL(file);

    setSeletecdFileUrl(fileUrl);

    onFileUploaded(file)

  }, [onFileUploaded]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
  });

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*" />

      {seletecdFileUrl ? (
        <img src={seletecdFileUrl} alt={seletecdFileUrl} />
      ) : (
        <p>
          <FiUpload />
          Imagem do estabelecimento{" "}
        </p>
      )}
    </div>
  );
};

export default DropZonee;
