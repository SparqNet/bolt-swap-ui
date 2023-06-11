"use client";

import React, { Fragment, useState } from "react";

import { Popover, Transition } from "@headlessui/react";
import {
  AdjustmentsHorizontalIcon,
  ArrowDownIcon,
  ArrowSmallLeftIcon,
  ChevronDownIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import SelectToken from "../components/SelectToken";
import Link from "next/link";

type token = {
  symbol: string;
  logoURI: string;
  address: string;
};

const Pool = () => {
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
    if (token.address.localeCompare(tokenOut.address) < 0) {
      setToken0(token);
      if (hasSelected === true) {
        setToken1(tokenOut);
      }
      return;
    }
    if (token.address.localeCompare(tokenOut.address) >= 0) {
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
    if (token.address.localeCompare(tokenIn.address) < 0) {
      setToken0(token);
      setToken1(tokenIn);
      return;
    }

    if (token.address.localeCompare(tokenIn.address) >= 0) {
      setToken0(tokenIn);
      setToken1(token);
      return;
    }
  };

  return (
    <div className="md:max-w-[35vw] mx-auto">
    <div className="pt-[10vh]">
      <div className="flex flex-col w-full px-6 pt-5 pb-7 bg-[#00AFE340] rounded-xl">
        <div className="flex flex-col leading-none text-white">
          <p className="font-bold p-0 m-0">Liquidity provider rewards</p> <br/> Liquidity providers earn a 0.25% fee on all
          trades proportional to their share of the pool. Fees are added to the
          pool, accrue in real time and can be claimed by withdrawing your
          liquidity.
        </div>
        
        </div>
      </div>

      <div className="flex flex-row items-center justify-between text-white pt-[3vh]">
            <span className="text-xl">Your liquidity</span>
        <span className="flex flex-row space-x-[.5vw]">
            <button className="rounded-lg border-[#00DAAC90] border-[1px]  h-[4vh] px-3 py-2 text-[#00DAAC]">Create a pair</button>
            <Link href={"liquidity/add_liquidity"} className="rounded-lg  bg-[#00DAAC90] h-[4vh] px-3 py-2 text-[#00DAAC] ">Add Liquidity</Link>
        </span>
        </div>
        <div className="flex border-[#00DAAC90] border-[1px] md:min-h-[5vh] mt-[2vh] rounded-lg">
        <span className="text-[#00DAAC] mx-auto place-self-center">No liquidity found.</span>
        </div>


        
    </div>





  );
};
export default Pool;
