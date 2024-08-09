import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { setFile } from '@/features/Upload/UploadSlice';

interface UploadFileProps {
  buttonType: 'dnd' | 'btn';
}

const UploadFile: React.FC<UploadFileProps> = ({ buttonType }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const dispatch = useDispatch();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setPreview(URL.createObjectURL(file));
    dispatch(setFile(file));
    // onChange(file);
  }, [dispatch]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const handleButtonClick = () => {
    document.getElementById('fileInput')?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      dispatch(setFile(file));
    //   onChange(file);
    }
  };

  return (
    <div>
      {buttonType === 'dnd' ? (
        <div
          {...getRootProps()}
          className="border-dashed border-2 border-gray-300 p-4 text-center cursor-pointer"
        >
          <input {...getInputProps()} />
          {preview ? (
            <img src={preview} alt="Preview" className="h-[200px] w-auto" />
          ) : (
            <p>Drag and drop an image here, or click to select one</p>
          )}
        </div>
      ) : (
        <div className="text-center">
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleButtonClick}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            {preview ? 'Change Image' : 'Upload Image'}
          </button>
          {preview && (
            <img src={preview} alt="Preview" className="h-[200px] w-auto mt-4" />
          )}
        </div>
      )}
    </div>
  );
};

export default UploadFile;
