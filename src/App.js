import './App.css';
import Nav from './components/Nav';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import Home from './components/Home';
import NFTs from './components/NFTs';
import Create from './components/Create';
import { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';

import contractId from "../src/contracts/address.json";
import jws from "../src/contracts/key.json";
import { Contract } from 'fuels';
import {
  useIsConnected,
  useWallet,
  useConnect,
  useConnectors,
} from "@fuels/react";
import { toB256, isBech32 } from '@fuel-ts/address';
import { PinataSDK } from 'pinata-web3';
import { BN, bn } from 'fuels';
import { ethers } from 'ethers';


const pinata = new PinataSDK({
  pinataJwt: jws.jws,
  pinataGateway: "beige-sophisticated-baboon-74.mypinata.cloud",
})

const CONTRACT_ID = contractId.address;
const CONTRACT_ABI = contractId.abi

function App() {

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState("");

  const { connect } = useConnect();
  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();
  const { connectors } = useConnectors();
  const [nfts, setNfts] = useState([]);
  const [isInstalled, setIsInstalled] = useState(false);
  const [shouldFetchNfts, setShouldFetchNfts] = useState(false);
  const [contract, setContract] = useState(null);
  const [nftItem, setNftItem] = useState(null)
  const [player, setPlayer] = useState(false);

  useEffect(() => {
    try {
      const installed = connectors[0].installed;
      setIsInstalled(installed);
    } catch (e) {
      console.log(e)
    }
  }, [connectors]);

  useEffect(() => {
    if (wallet?.address) {
      const bech32 = wallet.address.toAddress();
      if (isBech32(bech32)) {
        const b256 = toB256(bech32);
        setAccount(b256)
      }
    }
  }, [wallet]);

  useEffect(() => {
    async function getContract() {
      if (isConnected && wallet) {
        // const nftContract = new NftContract(CONTRACT_ID, wallet);
        const nftContract = new Contract(CONTRACT_ID, CONTRACT_ABI, wallet);
        setContract(nftContract);
        setShouldFetchNfts(true);        
      }
    }
    getContract();
  }, [isConnected, wallet]);

  useEffect(() => {
    async function getAllNFTs() {
      if (contract !== null && shouldFetchNfts) {
        try {
          setLoading(true)
          const res = await contract.functions.get_total_count().txParams({ gasLimit: 100_000 }).get();
          const totalCount = new BN(res.value).toNumber();

          const nfts = [];

          for (let i = 1; i <= totalCount; i++) {
            const nftData = await contract.functions.get_nft_data(i).txParams({ gasLimit: 100_000 }).get();

            if (nftData.value.uri) {
              nftData.value.uri = nftData.value.uri.slice(0, -1);
            }
            // const unlocked = false;
            const data = await pinata.gateways.get(`https://beige-sophisticated-baboon-74.mypinata.cloud/ipfs/${nftData.value.uri}`);
            const mergedNFTData = {
              ...(typeof nftData.value === 'object' ? nftData.value : {}),
              ...(typeof data.data === 'object' ? data.data : {}),
            };
            nfts.push(mergedNFTData);

          }
          setNfts(nfts);
          setShouldFetchNfts(false);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching NFTs:', error);
          toast.error("Error fetching NFTs", {
            position: "top-center"
          })
        }
      }
    }
    getAllNFTs();
  }, [contract, shouldFetchNfts]);

  const mintNFT = async (uri, price) => {
    if (!contract) {
      return toast.info("Contract not loaded", {
        position: "top-center"
      });
    }

    try {
      const priceInput = bn.parseUnits(price);
      const subID = ethers.sha256(ethers.toUtf8Bytes(uri));
      if (uri.length < 60) {
        uri = uri.padEnd(60, '0');
      }

      const response = await contract.functions.mint(subID, uri, priceInput).call();
      const res = await response.waitForResult()
      if (res.transactionResult.isStatusSuccess
      ) {
        toast.success("NFT minted successfully", {
          position: "top-center"
        });
        setShouldFetchNfts(true);
      }

      window.location.href = "/"

    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Error minting NFT:', {
        position: "top-center"
      });
    }
  };

  const uploadToPinata = async (thumbnail, video, name, description, price) => {
    if (!thumbnail || !video) {
      toast.error("File is required", {
        position: "top-center"
      });
    }

    try {
      toast.info("Uploading video to IPFS", {
        position:"top-center"
      })
      const uploadVideo = await pinata.upload.file(video);
      toast.info("Uploading thumbnail to IPFS", {
        position:"top-center"
      })
      const uploadImage = await pinata.upload.file(thumbnail);
      toast.info("Pinning metadata to IPFS", {
        position:"top-center"
      })
      const metadata = await pinata.upload.json({
        name: name,
        description: description,
        price: price,
        thumbnail: `https://beige-sophisticated-baboon-74.mypinata.cloud/ipfs/${uploadImage.IpfsHash}`,
        video: `https://beige-sophisticated-baboon-74.mypinata.cloud/ipfs/${uploadVideo.IpfsHash}`,
      });
      return metadata.IpfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      toast.error("Minting NFT failed.", {
        position: "top-center"
      });
    }
  };
  const handlePayClick = async (id, price) => {
    let res;
    if (contract) {
      try {
        const priceInput = bn.parseUnits(price.toString());
        const baseAssetId = contract.provider.getBaseAssetId();
        const result = await contract.functions.buy_nft(id).txParams({ variableOutputs: 1 }).callParams({ forward: [priceInput, baseAssetId] }).call();
        const wait = await result.waitForResult();
        toast.info('Please wait and do not reload or change tab or pages', {
          position: "top-center"
        })
        res = wait.transactionResult.isStatusSuccess;
      } catch (e) {
        console.log("error", e);
        toast.error('Payment Failed', {
          position: "top-center"
        })
      }
    }
    if (res) {
      nfts.map(nft => {
        if (nft.id === id) {
          setNftItem(nft);
          nft.unlocked = true;
          setPlayer(true);
        }
      })
      return true;
    } else {
      toast.error("An error occured while playing the video", {
        position: "top-center"
      });
      return false;
    }
  }
  const onConnect = async () => {
    connect();
  };


  return (
    <BrowserRouter>
      <ToastContainer />
      <div className="App min-h-screen">
        <div className='gradient-bg-welcome h-screen w-screen'>
          <Nav account={account} connect={onConnect} isConnected={isConnected} isInstalled={isInstalled} />
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/all-nft" element={<NFTs nfts={nfts} isConnected={isConnected} handlePayClick={handlePayClick} player={player} setPlayer={setPlayer} currNft={nftItem} setCurrNft={setNftItem} loading={loading}/>}></Route>
            <Route path="/create" element={<Create uploadToPinata={uploadToPinata} mintNFT={mintNFT} />}></Route>
          </Routes>
        </div>
      </div>

    </BrowserRouter>
  );
}

export default App;
