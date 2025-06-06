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
    
    //status bar colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'uploading': return 'text-blue-600';
            case 'success': return 'text-green-600';
            case 'error': return 'text-red-600';
            default: return 'text-gray-600';
        }
    }

    const getStatusText = (status) => {
    switch (status) {
        case 'uploading': return 'Nahráva sa...';
        case 'success': return 'Nahraný';
        case 'error': return 'Chyba';
        default: return 'Pripravený';
    }
};
    
    return (
        <div className="max-w-2xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">Upload a file</h2>
            {/* drop zone */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                   ${isDragOver 
                     ? 'border-blue-500 bg-blue-50' 
                     : 'border-gray-300 hover:border-gray-400'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="cursor-pointer">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                <p className="text-lg text-gray-600 mb-2">
                    Drag&Drop files or click for select a file
                </p>
                <p className="text-sm text-gray-500">
                    Supported formáty: PDF, JPG, PNG, DOC
                </p>
            </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />

            {/* Array of files*/}
            </div>
        </div>
    );
};




export default FileUploader;