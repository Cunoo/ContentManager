import React, {useState, useRef, useContext} from 'react';
import { AuthContext } from '../context/AuthContext';




const defaultImage = '/images/uploadImage.png'
const FileUploader = () => {
    const [message, setMessage] = useState("Welcome");
    const [selectedFile, setSelectedFile] = useState(defaultImage);
    const [files, setFiles] = useState([]);
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
        setIsDragOver(false);
        handleFileSelect(e.dataTransfer.files);
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

    //upload a file
    const uploadFiles = async () => {
        setUpLoading(true);

        for (let fileObj of files) {
            if(fileObj.status !== 'ready') continue;
            // update status to uploading
            setFiles(prev => prev.map( f => f.id === fileObj.id ? {...f, status: 'uploading'} : f

            ));


            //progress
            for (let progress = 0; progress <= 100; progress += 10){
                setFiles(prev => prev.map(f =>
                    f.id === fileObj.id ? {...f, progress} : f
                ));
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            //success
            setFiles(prev => prev.map(f => f.id === fileObj.id ?
                {...f, status: 'success', progress: 100} : f
            ));
        }
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