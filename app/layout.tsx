"use client"

import Link from 'next/link'
import './globals.css'
import { Inter } from 'next/font/google'
import {usePathname}  from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'Bolt Swap',
//   description: 'The premier DEX on Sparq Network',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
})
 {

const path = usePathname()
  return (
    <html lang="en">
      <body className={inter.className}>
      <div className="bg-[url('/background.svg')] bg-cover w-full h-screen">
        <div className="py-[2%] px-[4%]" id="main-container">
            <span className="flex flex-row justify-between items-center h-[5%]">
              <span className="flex flex-row text-white">
                <img className="h-[4vh]" src="./logo.svg"/>
                <span className="flex flex-row text-white pl-[4vw] space-x-[2vw] items-center">
                <Link className={path === "/swap" ? "font-bold" : ""} href={"/swap"}>Swap</Link>
                <Link  className={path === "/liquidity" ? "font-bold" : ""} href={"/liquidity"}>Liquidity</Link>
                </span>
                </span>
               
                <button className="rounded-full bg-[#00DAAC90] h-[4vh] px-3 py-2 text-[#00DAAC] font-bold">Connect</button>
            </span>
        {children}
        </div>
        </div>
        </body>
    </html>
  )
}
