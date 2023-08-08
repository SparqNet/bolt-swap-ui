"use client";

import React, { Fragment, use, useEffect, useState } from "react";
import { ethers } from "ethers";
import { WrapperAddress } from "@/utils/constants";
import NativeWrapper from "@/abis/NativeWrapper.json";

export default function Wrap() {
  const [WrapperInput, setWrapperInput] = useState("0");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [wrappedBalance, setWrappedBalance] = useState("0");


  const wrap = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const wrapperContract = new ethers.Contract(
      WrapperAddress,
      NativeWrapper,
      signer
    );

    await wrapperContract
      .deposit({ value: ethers.parseUnits(String(WrapperInput), "ether") })
      .catch((err) => {
        console.log(err);
      })
      .finally(async () => await balance());
  };

  const balance = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const wrapperContract = new ethers.Contract(
      WrapperAddress,
      NativeWrapper,
      signer
    );

    const ret = await wrapperContract
      .balanceOf(signer.address)
      .catch((err) => {
        console.log(err);
      })
  setWrappedBalance(String(ethers.formatEther(await ret)));
  };

  useEffect(() => {
    balance();
  }, []);
  return (
    <div className="flex flex-col box-border md:max-w-[20vw] mx-auto bg-[#00AFE340] rounded-3xl mt-[10vh] p-6">
      <span className="flex flex-col text-white mt-[2vh]">
        <span className="flex flex-row items-center text-white">
          <img className="w-[2vw] mr-[1vw]" src="/logo.svg" />
          <span className="flex flex-col text-white">
            <span>Balance: {wrappedBalance}</span>
            <span className="text-xl mr-[1vw]">Wrapped Sparq</span>
          </span>
        </span>

        <input
          id="wrappedInput"
          type="number"
          className="text-2xl mt-[2vh] text-white bg-transparent outline outline-white outline-[.5px] rounded-md p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="0.0"
          onChange={(e) => setWrapperInput(e.target.value)}
        />
      </span>
      {Number(ethers.parseUnits(WrapperInput, "ether")) === 0 ? (
        <button className="mt-[4vh] rounded-xl bg-[#888D9B] py-[2vh] mb-[2vh] font-medium text-lg text-[#3E4148]">
          {" "}
          Enter an amount to wrap
        </button>
      ) : (
        <button
          onClick={() => wrap()}
          className="mt-[2vh] rounded-xl  bg-[#00DAAC30] py-[2vh] mb-[2vh] font-medium text-[#00DAAC] shadow shadow-lg"
        >
          {" "}
          Wrap
        </button>
      )}
    </div>
  );
}
