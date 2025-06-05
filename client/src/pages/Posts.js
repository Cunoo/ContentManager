import React, {useState, useRef} from 'react';

const defaultImage = '/images/uploadImage.png'
const FileUploader = () => {
    const [message, setMessage] = useState("Welcome");
    const [selectedFile, setSelectedFile] = useState(defaultImage);
    const [file, setFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(null);
    const [uploading, setUpLoading] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (selectedFiles) => {
        const fileArray = Array.from(selectedFiles);
        const newFiles = fileArray.map(file => ({
            file,
            id: Date.now() + Math.random() , // should be instead of math.random ID of person
            progress: 0,
            status: 'ready'
        }));
        setFiles(prev =>  [...prev, ...newFiles]);
    }
    return (
        <div>
            <h2> Current message: {message}</h2>
            <button 
                onClick={() => setMessage("klikol si button")}> test
            </button>
            <img src={selectedFile}
                alt="Default image" style={{ display: 'block', margin: '0 auto' }}>
            </img>
            <h2>Upload your file</h2>
        </div>
    );
};




export default FileUploader;