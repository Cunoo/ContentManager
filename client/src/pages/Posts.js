import React, {useState, useRef, useContext} from 'react';
import { AuthContext } from '../context/AuthContext';




const defaultImage = '/images/uploadImage.png'
const FileUploader = () => {
    const [message, setMessage] = useState("Welcome");
    const [selectedFile, setSelectedFile] = useState(defaultImage);
    const [file, setFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(null);
    const [uploading, setUpLoading] = useState(null);
    const fileInputRef = useRef(null);

    const { currentUser, logout } = useContext(AuthContext);

    const handleFileSelect = (selectedFiles) => {
        const fileArray = Array.from(selectedFiles);
        const newFiles = fileArray.map(file => ({ // create object for every picture
            file,
            id: Date.now() + currentUser ,
            progress: 0,
            status: 'ready'
        }));
        setFiles(prev =>  [...prev, ...newFiles]);
    }

    //handlers
    const handleFileInputChange = (e) => {
        handleFileSelect(e.target.files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
    }

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    }

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    }

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
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