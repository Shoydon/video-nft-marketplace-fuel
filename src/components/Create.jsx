import React, { useEffect, useState } from 'react'
import { ethers } from "ethers"
import axios from 'axios'
import { toast } from 'react-toastify'

function Create({ uploadToPinata, mintNFT }) {

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [thumbnail, setThumbnail] = useState(null);
  const [video, setVideo] = useState(null);
  const [uri, setUri] = useState("");
  const [isMinting, setIsMinting] = useState(false);

  const [forminfo, setFormInfo] = useState({
    title: "",
    thumbnail: "",
    video: "",
    description: "",
    price: 0
  });

  useEffect(() => {
    document.title = "Mint NFT "
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    console.log(file);
    
    const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (allowedTypes.includes(file.type)) {
      setVideo(file);
      // Create a video element
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';

      // Load the video file into the video element
      const url = URL.createObjectURL(file);
      videoElement.src = url;

      videoElement.addEventListener('loadeddata', () => {
        // Once video data is loaded, capture the first frame
        videoElement.currentTime = 0; // Go to the start of the video

        videoElement.addEventListener('seeked', async () => {
          // Create a canvas element to draw the frame
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) return;

          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;

          // Draw the first frame of the video onto the canvas
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          // Convert canvas to data URL
          const dataURL = canvas.toDataURL('image/jpeg');
          const blob = await (await fetch(dataURL)).blob();
          setThumbnail(blob); // Set the thumbnail state
          console.log(blob);
          console.log(thumbnail);
          console.log(typeof (blob));

          // Clean up
          URL.revokeObjectURL(url);
        });
      });

    } else {
      toast.info(
        <div>
          <p>Please select a valid video file. </p>
          <p>(Accepted types: 'video/mp4', 'video/webm', 'video/ogg')</p>
        </div>,
        {
          position: "top-center",
        }
      );
      event.target.value = ""; // Reset the file input
    }
  }

  const handleMint = async (e) => {
    e.preventDefault();
    if (!thumbnail || !video || !name || !description || !price) {
      toast.info('Please complete all fields', {
        position: "top-center"
      });
      return;
    }
    setIsMinting(true);

    try {
      const IpfsHash = await uploadToPinata(thumbnail, video, name, description, price);
      // const IpfsHash = `bafkreifw25xdtob666hxqytrgmkffqajdhgann5rfw75le6a57djsrso24`

      await mintNFT(IpfsHash, price);
    } catch (e) {
      console.log(e);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-h-screen pt-24">
      <div className="container-fluid mt-5 text-left">
        <div className="content mx-auto">
          <form className="max-w-sm mx-auto">
            <div className="max-w-lg mx-auto">
              <label
                className="block mb-2 text-sm font-medium text-white"
                htmlFor="user_avatar"
              >
                Upload Video
              </label>
              <input
                onChange={(e) => {
                  handleFileChange(e);
                }}
                name="file"
                className="block w-full mb-4 h-8 text-m  text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                type="file"
                accept="video/*"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="title"
                className="block mb-2 text-sm font-medium text-white"
              >
                Name
              </label>
              <input
                onChange={(e) => setName(e.target.value)}
                type="text"
                id="title"
                name="title"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder="Enter Name"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-white"
              >
                Description
              </label>
              <input
                onChange={(e) => setDescription(e.target.value)}
                type="text"
                id="description"
                name="description"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder="Describe the NFT (max limit: 20 characters)"
                required
                maxLength={20}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="price"
                className="block mb-2 text-sm font-medium text-white"
              >
                Price
              </label>
              <input
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                id="price"
                name="price"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder="Enter Price in Fuel ETH"
              />
            </div>

            <div className="text-center">
              <button
                onClick={handleMint}
                className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" disabled={isMinting}
              >
                {isMinting ? "Minting..." : "Mint NFT"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* {thumbnail && <img src={thumbnail} alt="Video Thumbnail" />} */}
    </div>
  )
}

export default Create