"use client"

import Link from 'next/link'
import './globals.css'
import { Inter } from 'next/font/google'
import {usePathname}  from 'next/navigation'
import { useEffect, useState } from 'react'
import { ethers, formatEther } from 'ethers'
import { WalletIcon } from '@heroicons/react/24/outline'

declare global {
  interface Window{
    ethereum?:any
  }
}

const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'Bolt Swap',
//   description: 'The premier DEX on Sparq Network',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
  wallet: {address:string, nativeBalance:string}
})
 {

const path = usePathname()
const [wallet, setWallet] = useState<undefined | {address:string, nativeBalance:string}>(undefined)

const connectWallet = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    setWallet({address: signer.address, nativeBalance: ethers.formatEther(await signer.provider.getBalance(signer.address))})
    
      
  } catch (error) {
    console.log(error)
  }
}

useEffect(() => {
 connectWallet()
},[])
  return (
    <html lang="en">
      <body className={inter.className}>
      <div className="bg-[url('/background.svg')] bg-cover w-full h-screen">
        <div className="py-[2%] px-[4%]" id="main-container">
            <span className="flex flex-row justify-between items-center h-[5%]">
              <span className="flex flex-row text-white">
                <img className="h-[4vh]" src="/logo.svg"/>
                <span className="flex flex-row text-white pl-[4vw] space-x-[2vw] items-center">
                <Link className={path.includes("/swap") ? "font-bold" : ""} href={"/swap"}>Swap</Link>
                <Link  className={path.includes("/liquidity") ? "font-bold" : ""} href={"/liquidity"}>Liquidity</Link>
                </span>
                </span>
                <span className='flex flex-row space-x-[1vw]'>
               <p className="rounded-lg bg-[#00DAAC40] h-[4vh] px-3 py-2 text-[#00DAAC] font-bold">{ wallet === undefined ? "Loading...": Number(wallet?.nativeBalance).toFixed(2)} AVAX</p>
                <button onClick={() => connectWallet()} className="rounded-lg bg-[#00DAAC40] h-[4vh] px-3 py-2 text-[#00DAAC] font-bold">{ wallet === undefined ? "Loading...": wallet.address === ""? "Connect" : <span className='flex flex-row items-center'><WalletIcon height={"2vh"}/> <p className='pl-[.5vw]'>{wallet.address.substring(0,5) + "..." + wallet.address.slice(-4)}</p></span>}</button>
                </span>
            </span>
        {children}
        </div>
        </div>
        </body>
    </html>
  )
}
