"use client"

import CoinListButton from "@/app/components/Buttons/CoinListButton";
import CoinListItem from "@/app/components/CoinListItem";
import { Dialog, Transition } from "@headlessui/react";
import {
    ArrowSmallLeftIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    QuestionMarkCircleIcon,
    XMarkIcon,
  } from "@heroicons/react/24/outline";
import Link from "next/link";
  import React, { Fragment, use, useState } from "react";



  interface Coin {
    name: string,
    symbol: string,
    address: string,
    image: string
  }
  
  export default function addLiquidity() {

    const [isSelected,setSelected] = useState(false)
    const [token0, setToken0] = useState({name:"Sparq", symbol:"SPRQ", address:"0x000000000000000001", image:'/logo.svg'} as Coin)
    const [token1, setToken1] = useState({name:"Sparq", symbol:"SPRQ", address:"0x000000000000000002", image:'/logo.svg'} as Coin)
    const [token0Input,setToken0Input] = useState(0)
    const [token1Input,setToken1Input] = useState(0)
    const [needsApproval,setNeedsApproval] = useState(false)
    const [coinsForListing, setCoinsForListing] = useState([{name:"Gold", symbol:"GLD", address:"0x000000000000000003", image:'/wrapped-avax.png'} as Coin, {name:"Silver", symbol:"SLV", address:"0x000000000000000004", image:'/wrapped-avax.png'} as Coin])
    const [inputVal, setInputVal] = useState("")
    const [isOpen, setIsOpen] = useState({show:false, tokenNum:-1})

    const chooseTokenFunction = (coin:Coin) => {
      if (token0.address === coin.address || token1.address === coin.address){
        return;
      }

      if (isOpen.tokenNum === 0) {
          setToken0(coin)
          setIsOpen({show:false, tokenNum:0})
      }

      else if (isOpen.tokenNum === 1) {
        setToken1(coin)
        setSelected(true)
        setIsOpen({show:false, tokenNum:1})
      }

    }


    return (
      <>
       <Transition appear show={isOpen.show === true} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-black border border-grey2 text-left align-middle shadow-xl transition-all">
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-white">Select Token</h1>
                      <XMarkIcon
                        onClick={() => setIsOpen({show:false, tokenNum:-1})}
                        className="w-6 text-white cursor-pointer"
                      />
                    </div>
                    <MagnifyingGlassIcon className="w-5 text-white absolute mt-[13px] ml-[14px] text-grey" />
                    <input
                      className="border border-grey2 outline-none py-2.5 pl-12 rounded-lg w-full placeholder:text-grey placeholder:font-regular text-white"
                      placeholder="Search name or paste address"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                    ></input>
                    <div className="flex justify-between flex-wrap mt-4 gap-y-2">
                      {coinsForListing?.map((coin: Coin, index:number) => {
                        return <CoinListButton coin={coin} chooseToken={chooseTokenFunction}  />;
                      })}
                    </div>
                  </div>
                  <div>
                    {coinsForListing?.map((coin: Coin) => {
                      return (
                        <CoinListItem coin={coin} chooseToken={chooseTokenFunction} />
                      );
                    })}
                    {/* {(coinsForListing === null || coinsForListing.length === 0) &&
                                <div>No coin</div>
                                } */}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <div className="flex flex-col md:max-w-[25vw] mx-auto bg-[#00AFE340] rounded-3xl mt-[3vh]">
        <div className="flex flex-row items-center justify-between p-[5%]">
        <Link href={"/liquidity"}>
        <ArrowSmallLeftIcon color="white" width="1vw" height="1vw" />
        </Link>
          <span className="text-white font-medium text-xl">Add Liquidity</span>
          <QuestionMarkCircleIcon color="white" width="1vw" height="1vw" />
        </div>
        <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] p-[3%] text-white ">
          <div className="flex flex-row justify-between">
            <span>Input</span>
            <span>Balance:0</span>
          </div>
  
          <div className="flex flex-row justify-between py-[.5vh]">
          <input onChange={(e) => setToken0Input(Number(e.target.value))} id="token0" type="number" className="text-3xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.0"/>
            <button onClick={() => setIsOpen({show:true, tokenNum:0})} className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]">
              <img className="w-[1vw]" src={token0.image} />
              <p className="text-2xl font-medium">{token0.name.toUpperCase()}</p>
              <ChevronDownIcon color="white" width="1vw" height="1vw" />
            </button>
          </div>
        </div>
        <span className="mx-auto text-white text-2xl my-[2vh]">+</span>
      
        <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] p-[3%] text-white ">
          <div className="flex flex-row justify-between">
            <span>Input</span>
            <span> {isSelected === true ? "Balance:0" : "-"}</span>
          </div>

          {isSelected === true ?
  
          <div className="flex flex-row justify-between items-end py-[.5vh]">
            <input  onChange={(e) => setToken1Input(Number(e.target.value))} id="token1" type="number" className="text-3xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.0"/>
            <button onClick={() => setIsOpen({show:true, tokenNum:1})} className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]">
              <img className="w-[1vw]" src={token1.image} />
              <p className="text-2xl font-medium">{token1.name.toUpperCase()}</p>
              <ChevronDownIcon color="white" width="1vw" height="1vw" />
            </button>
          </div>
          : <div className="flex flex-row justify-between items-end py-[.5vh]">
          <input disabled={true} id="token1" type="number" className="text-3xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.0"/>
          <button  onClick={() => setIsOpen({show:true, tokenNum:1})}  className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]">
            <p className="text-2xl font-normal">Select Token</p>
            <ChevronDownIcon color="white" width="1vw" height="1vw" />
          </button>
        </div>}
        </div>
        <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] text-white flex flex-col mt-[2vh] ">
          <span className="p-[3%]">Prices and pool share</span>
          <div className="border-[1px] border-[#86C7DB25] rounded-xl p-[3%] flex flex-row justify-between ">
            <span className="flex flex-col items-center w-1/3">
              <p>14.95</p>
              <p>agEUR per AVAX</p>
            </span>
            <span className="flex flex-col items-center w-1/3">
              <p>14.95</p>
              <p>agEUR per AVAX</p>
            </span>

            <span className="flex flex-col items-center w-1/3">
              <p>0%</p>
              <p>Share of Pool</p>
            </span>

          </div>
        </div>
        {isSelected === false ? 
        <button className="mt-[2vh] mx-[3%] rounded-xl bg-[#888D9B] py-[2vh] mb-[2vh] font-medium text-[#3E4148]"> Invalid pair</button>
        : token0Input === 0 || token1Input === 0 ?  <button className="mt-[2vh] mx-[3%] rounded-xl bg-[#888D9B] py-[2vh] mb-[2vh] font-medium text-[#3E4148]"> Enter an amount</button> :
        needsApproval === true ? <button className="mt-[2vh] mx-[3%] rounded-xl bg-[#00DAAC30] py-[2vh] mb-[2vh] font-medium text-[#00DAAC]"> Approve </button> :
        <button className="mt-[2vh] mx-[3%] rounded-xl  bg-[#00DAAC30] py-[2vh] mb-[2vh] font-medium text-[#00DAAC] shadow shadow-lg"> Supply liquidity</button>  }
      </div>
      </>
    );
  }
  