"use client";

import CoinListButton from "@/app/components/Buttons/CoinListButton";
import CoinListItem from "@/app/components/CoinListItem";
import ERC20 from "@/abis/ERC20.json";
import RouterAbi from "@/abis/Router.json";
import PairAbi from "@/abis/Pair.json";
import FactoryAbi from "@/abis/Factory.json"
import {
  Gold,
  RouterAddress,
  Silver,
  WSPARQ,
  PAIR_LP,
  factory_address,
} from "@/utils/constants";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowSmallDownIcon,
  ArrowSmallLeftIcon,
  ArrowSmallUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ethers } from "ethers";
import Link from "next/link";
import React, { Fragment, use, useEffect, useState } from "react";
import { useStore } from "../useStore";

interface Coin {
  name: string;
  symbol: string;
  address: string;
  image: string;
}

export default function Swap() {
  const [
    Slippage,
    Network,
    Connection,
    Deadline,
    updateNetwork,
    updateSlippage,
    updateConnection,
    updateDeadline,
  ] = useStore((state: any) => [
    state.Slippage,
    state.Network,
    state.Connection,
    state.Deadline,
    state.updateNetwork,
    state.updateSlippage,
    state.updateConnection,
    state.updateDeadline,
  ]);
  const [isSelected, setSelected] = useState(false);
  const [token0, setToken0] = useState({
    name: "Sparq",
    symbol: "SPRQ",
    address: "0x000000000000000001",
    image: "/logo.svg",
  } as Coin);
  const [token1, setToken1] = useState({
    name: "Sparq",
    symbol: "SPRQ",
    address: "0x000000000000000002",
    image: "/logo.svg",
  } as Coin);
  const [token0Input, setToken0Input] = useState(0);
  const [token0Balance, setToken0Balance] = useState(0);
  const [token1Balance, setToken1Balance] = useState(0);
  const [token1Input, setToken1Input] = useState(0);
  const [direction, setDirection] = useState("down");
  const [needsApproval, setNeedsApproval] = useState(true);
  const [coinsForListing, setCoinsForListing] = useState([
    { name: "Gold", symbol: "GLD", address: Gold, image: "/gold.png" } as Coin,
    {
      name: "Silver",
      symbol: "SLV",
      address: Silver,
      image: "/silver.png",
    } as Coin,
    {
      name: "Wrapped Sparq",
      symbol: "WSPRQ",
      address: WSPARQ,
      image: "/logo.svg",
    } as Coin,
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isOpen, setIsOpen] = useState({ show: false, tokenNum: -1 });

  const checkApproval = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const token0Contract = new ethers.Contract(
        token0.address,
        ERC20.abi,
        signer
      );
      const token1Contract = new ethers.Contract(
        token1.address,
        ERC20.abi,
        signer
      );

      const token0Allowance = await token0Contract.allowance(
        signerAddress,
        RouterAddress
      );
      const token1Allowance = await token1Contract.allowance(
        signerAddress,
        RouterAddress
      );

      if (
        Number(token0Allowance) < token0Input &&
        Number(token1Allowance) < token1Input
      ) {
        setNeedsApproval(true);
        return;
      }

      if (
        Number(token0Allowance) >= token0Input &&
        Number(token1Allowance) >= token1Input
      ) {
        setNeedsApproval(false);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const swap = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    const FactoryContract = new ethers.Contract(
      factory_address,
      FactoryAbi.abi,
      signer
    )


    const RouterContract = new ethers.Contract(
      RouterAddress,
      RouterAbi.abi,
      signer
    );

    const block = await provider.getBlock("latest");
    let deadline;

    if (block) {
      deadline = block.timestamp + Deadline * 60;
      // Further processing using the deadline
    } else {
      // Handle the case when the block is null
      console.error("Error: Block is null");
    }

    const doesLPTokenExist = await FactoryContract.getPair(
      token0.address,
      token1.address
    );
    const PairContract = new ethers.Contract(
      await doesLPTokenExist,
      PairAbi.abi,
      signer
    )
    console.log(ethers.formatEther((await PairContract.getReserves())[0].toString()))
    const AmountOut = await RouterContract.getAmountOut(
      token0Input,
      (await PairContract.getReserves())[0],
      (await PairContract.getReserves())[1]
    );

   console.log(await RouterContract.getAmountOut(
      token0Input,
      (await PairContract.getReserves())[0],
      (await PairContract.getReserves())[1]
    ));

    

    const swapT2T = await RouterContract.swapExactTokensForTokens(
      ethers.toBigInt(token0Input),
      AmountOut,
      [token1.address, token0.address],
      signerAddress,
      deadline
    ).then(null, (error) => console.log(error));
    console.log(swapT2T);
  };

  const approveTokens = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const token0Contract = new ethers.Contract(
        token0.address,
        ERC20.abi,
        signer
      );
      const token1Contract = new ethers.Contract(
        token1.address,
        ERC20.abi,
        signer
      );

      const token0Allowance = await token0Contract.allowance(
        signerAddress,
        RouterAddress
      );
      const token1Allowance = await token1Contract.allowance(
        signerAddress,
        RouterAddress
      );
      let caughtError = false;
      if (
        Number(token0Allowance) < token0Input &&
        Number(token1Allowance) < token1Input
      ) {
        await token0Contract
          .approve(RouterAddress, token0Input)
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        await token1Contract
          .approve(RouterAddress, token1Input)
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        if (caughtError === false) {
          setNeedsApproval(false);
        }
      }

      if (
        Number(token0Allowance) < token0Input &&
        Number(token1Allowance) > token1Input
      ) {
        await token0Contract
          .approve(RouterAddress, token0Input)
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        if (caughtError === false) {
          setNeedsApproval(false);
        }
      }

      if (
        Number(token0Allowance) > token0Input &&
        Number(token1Allowance) < token1Input
      ) {
        await token1Contract
          .approve(RouterAddress, token1Input)
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        if (caughtError === false) {
          setNeedsApproval(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const chooseTokenFunction = async (coin: Coin) => {
    if (token0.address === coin.address || token1.address === coin.address) {
      return;
    }

    if (isOpen.tokenNum === 0) {
      setToken0(coin);
      setIsOpen({ show: false, tokenNum: 0 });
    }

    if (isOpen.tokenNum === 1) {
      setToken1(coin);
      setSelected(true);
      setIsOpen({ show: false, tokenNum: 1 });
    }
  };

  const getBalance = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      if (isOpen.tokenNum === 0) {
        const token0Contract = new ethers.Contract(
          token0.address,
          ERC20.abi,
          signer
        );
        const balance = await token0Contract
          .balanceOf(signerAddress)
          .then(null, (error) => console.log(error));
        setToken0Balance(Number(ethers.formatEther(balance)));
      }

      if (isOpen.tokenNum === 1) {
        const token1Contract = new ethers.Contract(
          token1.address,
          ERC20.abi,
          signer
        );
        const balance = await token1Contract
          .balanceOf(signerAddress)
          .then(null, (error) => console.log(error));
        setToken1Balance(Number(ethers.formatEther(balance)));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isSelected && token0Input > 0 && token1Input > 0) {
      checkApproval();
    }
  }, [isSelected, token0Input, token1Input]);

  useEffect(() => {
    getBalance();
  }, [token0, token1]);

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
                        onClick={() => setIsOpen({ show: false, tokenNum: -1 })}
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
                      {coinsForListing?.map((coin: Coin, index: number) => {
                        return (
                          <CoinListButton
                            coin={coin}
                            chooseToken={chooseTokenFunction}
                            key={index}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    {coinsForListing?.map((coin: Coin, index: number) => {
                      return (
                        <CoinListItem
                          coin={coin}
                          chooseToken={chooseTokenFunction}
                          key={index}
                        />
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

      <div className="flex flex-col box-border md:max-w-[27vw] mx-auto bg-[#00AFE340] rounded-3xl mt-[10vh]">
        <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] mt-[5%] p-[3%] text-white">
          <div className="flex flex-row justify-between">
            <span className="select-none text-sm">From</span>
            <span key={token0Balance}>Balance:{token0Balance}</span>
          </div>

          <div className="flex flex-row justify-between py-[.5vh]">
            <input
              onChange={(e) => setToken0Input(Number(e.target.value))}
              id="token0"
              type="number"
              className="text-2xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.0"
            />
            <button
              onClick={() => setIsOpen({ show: true, tokenNum: 0 })}
              className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]"
            >
              <img className="w-[1vw]" src={token0.image} />
              <p className="text-xl font-medium">{token0.name.toUpperCase()}</p>
              <ChevronDownIcon color="white" width="1vw" height="1vw" />
            </button>
          </div>
        </div>
        <span
          className="mx-auto text-white text-xl my-[1vh] p-2 border border-[1px] border-[#86C7DB25] bg-[#00DAAC30] rounded-lg cursor-pointer box-border"
          onClick={() => {
            if (isSelected) {
              const temp = token0;
              setToken0(token1);
              setToken1(temp);
              if (direction === "down") {
                setDirection("up");
              } else {
                setDirection("down");
              }
            }
          }}
        >
          <ArrowSmallDownIcon color="white" className="w-4 h-4" />
        </span>

        <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] p-[3%] text-white ">
          <div className="flex flex-row justify-between">
            <span className="select-none text-sm">To</span>
            <span className="select-none">
              {" "}
              {isSelected === true ? `Balance:${token1Balance}` : "-"}
            </span>
          </div>

          {isSelected === true ? (
            <div className="flex flex-row justify-between items-end py-[.5vh]">
              <input
                onChange={(e) => setToken1Input(Number(e.target.value))}
                id="token1"
                type="number"
                className="text-2xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.0"
              />
              <button
                onClick={() => setIsOpen({ show: true, tokenNum: 1 })}
                className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]"
              >
                <img className="w-[1vw]" src={token1.image} />
                <p className="text-xl font-medium">
                  {token1.name.toUpperCase()}
                </p>
                <ChevronDownIcon color="white" width="1vw" height="1vw" />
              </button>
            </div>
          ) : (
            <div className="flex flex-row justify-between items-end py-[.5vh]">
              <input
                disabled={true}
                id="token1"
                type="number"
                className="text-2xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.0"
              />
              <button
                onClick={() => setIsOpen({ show: true, tokenNum: 1 })}
                className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]"
              >
                <p className="text-xl font-normal">Select Token</p>
                <ChevronDownIcon color="white" width="1vw" height="1vw" />
              </button>
            </div>
          )}
        </div>
        {isSelected ? (
          <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] text-white flex flex-col mt-[2vh] ">
            <span className="p-[3%]">Prices and pool share</span>
            <div className="border-[1px] border-[#86C7DB25] rounded-xl p-[3%] flex flex-row justify-between ">
              <span className="flex flex-col items-center w-1/3">
                <p>14.95</p>
                <p>
                  {token0.symbol} per {token1.symbol}
                </p>
              </span>
              <span className="flex flex-col items-center w-1/3">
                <p>14.95</p>
                <p>
                  {token1.symbol} per {token0.symbol}
                </p>
              </span>

              <span className="flex flex-col items-center w-1/3">
                <p>0%</p>
                <p>Share of Pool</p>
              </span>
            </div>
          </div>
        ) : null}
        <span className="flex flex-row justify-between mx-[3%] pt-[1vh] px-[3%] text-white">
          <span>Slippage Tolerance</span>
          <span>{Slippage}%</span>
        </span>
        {isSelected === false ? (
          <button className="mt-[2vh] mx-[3%] rounded-xl bg-[#888D9B] py-[2vh] mb-[2vh] font-medium text-lg text-[#3E4148]">
            {" "}
            Invalid pair
          </button>
        ) : token0Input === 0 || token1Input === 0 ? (
          <button className="mt-[2vh] mx-[3%] rounded-xl bg-[#888D9B] py-[2vh] mb-[2vh] font-medium text-lg text-[#3E4148]">
            {" "}
            Enter an amount
          </button>
        ) : needsApproval === true ? (
          <button
            onClick={() => approveTokens()}
            className="mt-[2vh] mx-[3%] rounded-xl bg-[#00DAAC30] py-[2vh] mb-[2vh] font-medium text-lg  text-[#00DAAC]"
          >
            {" "}
            Approve{" "}
          </button>
        ) : (
          <button
            onClick={() => swap()}
            className="mt-[2vh] mx-[3%] rounded-xl  bg-[#00DAAC30] py-[2vh] mb-[2vh] font-medium text-[#00DAAC] shadow shadow-lg"
          >
            {" "}
            Swap
          </button>
        )}
      </div>
    </>
  );
}
