import React from 'react'

const Footer = () => {
  return (
    <div className='bg-black/80 flex flex-row justify-around text-purple-400 h-10 gap-80 bottom-0 fixed w-full'>
        <div className="logo font-bold text-white text-xl">
            <span className="text-purple-400 text-2xl">&lt;</span>
            <span className="text-white">Pass</span>
            <span className="text-purple-400 text-2xl">Vault&gt;</span>
        </div>
        <div className='flex justify-center items-center'>
             Created with <img className='w-5 m-2' src="src\assets\icons\heart.png" alt="" /> by Geetanjali
        </div>
       
    </div>
  )
}

export default Footer