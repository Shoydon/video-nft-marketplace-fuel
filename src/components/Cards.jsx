import React from 'react'
import Fluid from "../assets/Fluid.png"
import Flower from "../assets/Flower.png"
import Ethereum from "../assets/Ethereum.svg"
import { ethers } from 'ethers'
import { Link } from 'react-router-dom'
import '../App.css';
import fuelLogo from '../assets/fuel.network.jpg'
import fuelLogo1 from '../assets/fuel1.jpg'

function Cards({ item, buyMarketItem, player, handlePayClick }) {
  return (
    <div className='card-container'>
      <div className="card-div">
        <div className='card-inner p-2'>
        {item?.thumbnail ? (
            // {if }
            <img src={item.thumbnail} alt={item.name} className='object-cover w-[230px] h-[230px] rounded overflow-hidden' />
          ):(
            <img src={fuelLogo1} alt="" className="object-cover w-[270px] h-[230px] rounded overflow-hidden" />
          )}
          <div className='flex flex-col justify-center items-center'>
            {/* <h3 className='text-white text-2xl font-thin mt-3'>{item.name}</h3> */}
            <div className='card-content'>
              <h1 className='text-white text-3xl mt-3'><strong>{item.name}</strong></h1>
              <h4 className='text-white mx-2 mt-2'>{item.description}</h4>
            </div>
          </div>
          <div className='card-footer'>
            <h5 className='text-white'>Price: <span className='text-green-400'><strong>{item.price} </strong></span> ETH</h5>
            {!player && <button type="button" className="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded text-sm px-5 py-1.5 text-center me-2 mt-4" onClick={() => {handlePayClick(item.id, item.price)}}>Watch</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cards