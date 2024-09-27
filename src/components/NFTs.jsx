import React, { useEffect, useState } from 'react'
import Cards from './Cards'
import { toast } from 'react-toastify';
import PlayerCard from './PlayerCard';


function NFTs({ nfts, isConnected, handlePayClick, player, setPlayer, currNft, setCurrNft }) {
  useEffect(() => {
    document.title = "Video NFTs"
  }, []);

  return (
    <>
      {!nfts && (
        <h2 className='text-white font-bold pt-24 text-2xl text-center'>Loading...</h2>
      )}
      {nfts && (
        <div className='flex flex-wrap gradient-bg-welcome   gap-10 justify-center pt-24 pb-5 px-16'>
          {player && (
            // <div className='flex flex-wrap gradient-bg-welcome   gap-10 justify-center pt-24 pb-5 px-16'>

            // </div>
            <div style={{
              width: '650px',
              height: 'auto',
              // backgroundColor: "#ddd",
              margin: '0 auto',
              display: 'block',
              // justifyContent:'center'
            }}>
              {/* <PlayerCard item={currNft} player={player}/> */}
              <div className='audio-outer'>
                <div className='audio-inner'>
                  <PlayerCard item={currNft} player={player} setPlayer={setPlayer} setCurrNft={setCurrNft}/>
                </div>
              </div>
            </div>
          )}
          { nfts && 
            (nfts.length > 0 ?
              nfts.map((item, idx) => (
                <>
                {console.log(item)}
                <Cards item={item} owner={item.owner} setNftitem={setCurrNft} index={idx} player={player} setPlayer={setPlayer} handlePayClick={handlePayClick} />
                </>
              ))
              :(
                <main style={{ padding: "1rem 0" }}>
                  <h2 className='text-white'>No listed assets</h2>
                </main>
              ))}
        </div>
      )}
    </>
  )
}

export default NFTs