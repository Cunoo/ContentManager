import React, {useState, useRef, useContext} from 'react';
import { AuthContext } from '../context/AuthContext';

const defaultImage = '/images/uploadImage.png'

const FileUploader = () => {

    const [files, setFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(null);
    const [uploading, setUpLoading] = useState(null);
    const fileInputRef = useRef(null);

    const [description, setDescription] = useState('');

    const { currentUser, logout } = useContext(AuthContext);

    const handleFileSelect = (selectedFiles) => {
        const fileArray = Array.from(selectedFiles);
        const newFiles = fileArray.map(file => ({ // create object for every picture
            file,
            id: Date.now() + currentUser,
            progress: 0,
            status: 'ready'
        }));
        setFiles(prev => [...prev, ...newFiles]);
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
            setFiles(prev => prev.map(f => 
                f.id === fileObj.id ? {...f, status: 'uploading'} : f
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
        
        setUpLoading(false); // PRIDANÉ: reset uploading state
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

    //br tags
    const MultipleBreaks = ({count=1}) =>{
        const breaks = [];
        for (let i = 0; i < count; i++){
            breaks.push(<br key={i} />);
        }
        return breaks
    }
    
    return (
        
        <div className="max-w-2xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg mt-6 md:mt-12">            
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
                        Supported formáty: PDF, JPG, PNG
                    </p>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
            />

            {/* Array of files*/}
            {files.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Vybrané súbory ({files.length})</h3>
                    <div className="space-y-3">
                        {files.map((fileObj) => (
                            <div key={fileObj.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-900">
                                            {fileObj.file.name}
                                        </span>
                                        <span className={`text-xs ${getStatusColor(fileObj.status)}`}>
                                            {getStatusText(fileObj.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{(fileObj.file.size / 1024).toFixed(1)} KB</span>
                                        {fileObj.status === 'uploading' && (
                                            <span>{fileObj.progress}%</span>
                                        )}
                                    </div>
                                    {fileObj.status === 'uploading' && (
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                            <div 
                                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                style={{ width: `${fileObj.progress}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeFile(fileObj.id)}
                                    disabled={fileObj.status === 'uploading'}
                                    className="ml-3 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Upload button */}
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={uploadFiles}
                            disabled={uploading || files.every(f => f.status === 'success')}
                            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded
                                       hover:bg-blue-700 disabled:bg-gray-400
                                       disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Nahráva sa...' : 'Nahrať všetky súbory'}
                        </button>
                        <button
                            onClick={() => setFiles([])}
                            disabled={uploading}
                            className="py-2 px-4 bg-gray-200 text-gray-700 rounded
                                       hover:bg-gray-300 disabled:bg-gray-100
                                       disabled:cursor-not-allowed"
                        >
                            Vymazať všetko
                        </button>
                    </div>
                    
                </div>
                
            )}
            <MultipleBreaks count={5}/>
            
            <div class="mb-6">
                <label for="large-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description of posts</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder='type a description of the photo' 
                    id="large-input"
                    class="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
            </div>

        </div>
    );
};

export default FileUploader;