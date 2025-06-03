import React, {useState} from 'react';

const defaultImage = '/images/uploadImage.png'
const ManagePost = () => {
    const [message, setMessage] = useState("Welcome");
    const [selectedFile, setSelectedFile] = useState(defaultImage)
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




export default ManagePost;