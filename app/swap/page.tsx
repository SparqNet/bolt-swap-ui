"use client"

import React, { Fragment, useState} from "react";

import { Popover, Transition } from "@headlessui/react";
import {
    AdjustmentsHorizontalIcon,
    ArrowSmallDownIcon,
  } from "@heroicons/react/24/outline";
import SelectToken from "../components/SelectToken";
import Link from "next/link";



type token = {
  symbol: string;
  logoURI: string;
  address: string;
};




const Swap = () => {

  const [hasSelected, setHasSelected] = useState(false);
  const [mktRate, setMktRate] = useState({});
  const [queryToken0, setQueryToken0] = useState("");
  const [queryToken1, setQueryToken1] = useState("");
  const [token0, setToken0] = useState({
    symbol: "WAVAX",
    logoURI: "./wrapped-avax.png",
    address: "",
  } as token);
  const [token1, setToken1] = useState({} as token);
  const [tokenIn, setTokenIn] = useState({
    symbol: "WAVAX",
    logoURI: "./wrapped-avax.png",
    address: "",
  });
  const [tokenOut, setTokenOut] = useState({
    symbol: "Select Token",
    logoURI: "",
    address: "",
  });

  function changeDefaultIn(token: token) {
    if (token.symbol === tokenOut.symbol) {
      return;
    }
    setTokenIn(token);
    if (
      token.address.localeCompare(tokenOut.address) < 0
    ) {
      setToken0(token);
      if (hasSelected === true) {
        setToken1(tokenOut);
      }
      return;
    }
    if (
      token.address.localeCompare(tokenOut.address) >= 0
    ) {
      if (hasSelected === true) {
        setToken0(tokenOut);
      }
      setToken1(token);
      return;
    }
  }

  const [tokenOrder, setTokenOrder] = useState(true);

  const changeDefaultOut = (token: token) => {
    if (token.symbol === tokenIn.symbol) {
      return;
    }
    setTokenOut(token);
    setHasSelected(true);
    if (
      token.address.localeCompare(tokenIn.address) < 0
    ) {
      setToken0(token);
      setToken1(tokenIn);
      return;
    }

    if (
      token.address.localeCompare(tokenIn.address) >= 0
    ) {
      setToken0(tokenIn);
      setToken1(token);
      return;
    }
  };


return (

    
    // <div className="bg-black w-full h-screen">
    //     <div className="py-[2%] px-[4%]" id="main-container">
    //         <span className="flex flex-row justify-between items-center h-[5%]">
    //           <span className="flex flex-row text-white">
    //             <img className="h-[4vh]" src="./logo.svg"/>
    //             <span className="flex flex-row text-white pl-[4vw] space-x-[2vw] items-center">
    //             <Link href={""}>Swap</Link>
    //             <Link href={""}>Liquidity</Link>
    //             </span>
    //             </span>
               
    //             <button className="rounded-full bg-[#00DAAC90] h-[4vh] px-3 py-2 text-[#00DAAC] font-bold">Connect</button>
    //         </span>
            <div className="pt-[10vh]">
      <div className="flex flex-col w-full md:max-w-md px-6 pt-5 pb-7 mx-auto bg-white border border-grey2 rounded-xl">
        <div className="flex items-center">
          <div className="flex gap-4 mb-1.5 text-sm">
            <div
              // onClick={() => setLimitActive(false)}
              // className={`${
              //   LimitActive
              //     ? "text-grey cursor-pointer"
              //     : "text-white cursor-pointer"
              // }`}
            >
              Swap
            </div>
          
          </div>
          <div className="ml-auto">
            <Popover className="relative">
              <Popover.Button className="outline-none">
                <AdjustmentsHorizontalIcon className="w-5 h-5 outline-none" />
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Popover.Panel className="absolute z-10 ml-14 -mt-[48px] bg-white border border-grey2 rounded-xl p-5">
                  <div className="w-full">
                    <h1>Slippage Tolerance</h1>
                    <div className="flex mt-3 gap-x-3">
                      <input
                        placeholder="0%"
                        className="bg-dark rounded-xl outline-none border border-grey1 pl-3 placeholder:text-grey1"
                      />
                      <button className=" w-full py-2.5 px-12 mx-auto text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#00DAAC90] to-[#00DAAC] hover:opacity-80">
                        Auto
                      </button>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>
          </div>
        </div>
        <div className="w-full mt-4 align-middle items-center flex bg-dark border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <div className="flex-col justify-center w-1/2 p-2 ">
            {/* {LimitInputBox("0")} */}
            0
            <div className="flex">
              <div className="flex text-xs text-[#4C4C4C]">
                {/* {mktRate["eth"]} */}
                0
              </div>
            </div>
          </div>
          <div className="flex w-1/2">
            <div className="flex justify-center ml-auto">
              <div className="flex-col">
                <div className="flex justify-end">
                  <SelectToken
                    index="0"
                    selected={hasSelected}
                    tokenChosen={changeDefaultIn}
                    displayToken={tokenIn}
                    balance={setQueryToken0}
                    key={queryToken0}
                  />
                </div>
                <div className="flex items-center justify-end gap-2 px-1 mt-2">
                  <div className="flex text-xs text-[#4C4C4C]">
                    {/* Balance: {balance0 === "NaN" ? 0 : balance0} */}
                    Balance: 0
                  </div>
                  {/* {isConnected && stateChainName === "arbitrumGoerli" ? (
                    <button
                      className="flex text-xs uppercase text-[#C9C9C9]"
                      onClick={() => maxBalance(balance0, "0")}
                    > */}
                    <button>
                      Max
                    </button>
                  {/* ) : null} */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="items-center -mb-2 -mt-2 p-2 m-auto border border-[#1E1E1E] z-30 bg-white rounded-lg cursor-pointer">
          <ArrowSmallDownIcon
            className="w-4 h-4"
            // onClick={() => {
            //   if (hasSelected) {
            //     switchDirection();
            //   }
            // }}
          />
        </div>

        <div className="w-full align-middle items-center flex bg-white border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <div className="flex-col justify-center w-1/2 p-2 ">
            <input
              className=" bg-white w-[100%] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
              placeholder="0"
            />
            <div className="flex">
              <div className="flex text-xs text-[#4C4C4C] ">
                {1000}
              </div>
            </div>
          </div>
          <div className="flex w-1/2">
            <div className="flex justify-center ml-auto">
              <div className="flex-col">
                <div className="flex justify-end">
                  {hasSelected ? (
                    <SelectToken
                      index="1"
                      selected={hasSelected}
                      tokenChosen={changeDefaultOut}
                      displayToken={tokenOut}
                      balance={setQueryToken1}
                      key={queryToken1}
                    />
                  ) : (
                    //@dev add skeletons on load when switching sides/ initial selection
                    <SelectToken
                      index="1"
                      selected={hasSelected}
                      tokenChosen={changeDefaultOut}
                      displayToken={tokenOut}
                      balance={setQueryToken1}
                    />
                  )}
                </div>
                {hasSelected ? (
                  <div className="flex items-center justify-end gap-2 px-1 mt-2">
                    <div className="flex text-xs text-[#4C4C4C]">
                      {/* Balance: {balance1 === "NaN" ? 0 : balance1} */}
                      Balance: 0
                    </div>
                  </div>
                ) : (
                  <></>
                )}


</div>
</div>
</div>
        </div>

    </div>
    </div>
    
)


}
export default Swap;