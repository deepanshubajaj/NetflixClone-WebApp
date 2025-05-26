import axios from 'axios';

// Your Cloudinary cloud name
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// Cloudinary upload preset (create this in your Cloudinary dashboard)
// Make sure to set it as "Unsigned" for client-side uploads
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const FOLDER_NAME = 'netflix-clone-app-profile-thumbnails';

export const uploadToCloudinary = async (file) => {
  try {
    // Check if file is valid
    if (!file) {
      throw new Error('Invalid file object');
    }
    
    // Create FormData object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    // Log upload attempt
    console.log('Attempting Cloudinary upload with preset:', UPLOAD_PRESET);
    
    // Make the request using fetch
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    // Check response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    // Parse response
    const data = await response.json();
    console.log('Upload successful:', data);
    
    // Return the URL
    return data.secure_url;
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw error;
  }
};
