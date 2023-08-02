"use client";

import CoinListButton from "@/app/components/Buttons/CoinListButton";
import CoinListItem from "@/app/components/CoinListItem";
import ERC20 from "@/abis/ERC20.json";
import RouterAbi from "@/abis/Router.json";
import PairAbi from "@/abis/Pair.json";
import FactoryAbi from "@/abis/Factory.json";
import NativeWrapperAbi from "@/abis/NativeWrapper.json";
import {
  Gold,
  RouterAddress,
  WrapperAddress,
  Silver,
  PAIR_LP,
  factory_address,
  compareHex,
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
  const [impact, setImpact] = useState(0);
  const [reserve0, setReserve0] = useState(0);
  const [reserve1, setReserve1] = useState(0);
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
      address: WrapperAddress,
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

      const token0Contract = new ethers.Contract(token0.address, ERC20, signer);
      const token1Contract = new ethers.Contract(token1.address, ERC20, signer);

      const token0Allowance = await token0Contract.allowance(
        signerAddress,
        RouterAddress
      );
      const token1Allowance = await token1Contract.allowance(
        signerAddress,
        RouterAddress
      );

      console.log(  Number(ethers.formatEther(token0Allowance)))

      console.log(  Number(ethers.formatEther(token1Allowance)))

      if (

        Number(ethers.formatEther(token0Allowance)) < token0Input &&
        Number(ethers.formatEther(token1Allowance)) > token1Input ||      Number(ethers.formatEther(token0Allowance)) > token0Input &&
        Number(ethers.formatEther(token1Allowance)) < token1Input
      ) {
        setNeedsApproval(true);
        return;
      }

      if (

        Number(ethers.formatEther(token0Allowance)) < token0Input &&
        Number(ethers.formatEther(token1Allowance)) < token1Input
      ) {
        setNeedsApproval(true);
        return;
      }

      if (
        Number(ethers.formatEther(token0Allowance)) >= token0Input &&
        Number(ethers.formatEther(token1Allowance)) >= token1Input
      ) {
        setNeedsApproval(false);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const calcOutAmount = async () => {

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();


    const FactoryContract = new ethers.Contract(
      factory_address,
      FactoryAbi,
      signer
    );

    const doesLPTokenExist = await FactoryContract.getPair(
      token0.address,
      token1.address
    );
    const PairContract = new ethers.Contract(
      await doesLPTokenExist,
      PairAbi,
      signer
    );

    const res = await PairContract.getReserves();

    const reserve0:bigint = res["reserve0"]
    const reserve1:bigint = res["reserve1"]
    
   
    const token0InputAmount =  ethers.parseUnits(String(token0Input), "ether")
    const amountInWFee = token0InputAmount * ethers.toBigInt(997)
    const numerator = amountInWFee * (0 === token0.address.toLowerCase().localeCompare([token0.address, token1.address].sort(compareHex)[0].toLowerCase()) ?  reserve1 : reserve0)
    const denominator = (0 === token0.address.toLowerCase().localeCompare([token0.address, token1.address].sort(compareHex)[0].toLowerCase()) ? reserve0 : reserve1) * ethers.toBigInt(1000) + amountInWFee
    setToken1Input(Number(ethers.formatEther(numerator/ denominator)))
    const toke1 = document.getElementById('token1Input') as HTMLInputElement;
    toke1.value = Number(ethers.formatEther(numerator/ denominator)).toFixed(3)

    const kstant:bigint = (0 === token0.address.toLowerCase().localeCompare([token0.address, token1.address].sort(compareHex)[0].toLowerCase()) ?  reserve1 : reserve0) * (0 === token0.address.toLowerCase().localeCompare([token0.address, token1.address].sort(compareHex)[0].toLowerCase()) ?  reserve0 : reserve1)
    const inReserveChange = (0 === token0.address.toLowerCase().localeCompare([token0.address, token1.address].sort(compareHex)[0].toLowerCase()) ?  reserve1 : reserve0) + token0InputAmount
    const outReserveChange = kstant / inReserveChange
    const pricePaid:number = Number(token0InputAmount) / Number(outReserveChange)
    const reserveIn =  token0.address.toLowerCase().localeCompare([token0.address, token1.address].sort(compareHex)[0].toLowerCase()) == 0 ?  reserve0 : reserve1
    const reserveOut =  token0.address.toLowerCase().localeCompare([token0.address, token1.address].sort(compareHex)[0].toLowerCase()) == 0 ?  reserve1 : reserve0
    const bestPrice:number = Number(reserveIn) / Number(reserveOut)
   const impact = pricePaid / bestPrice

    setImpact(Number((impact * 100).toFixed(3)))
  }

  const swap = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    const FactoryContract = new ethers.Contract(
      factory_address,
      FactoryAbi,
      signer
    );

    const RouterContract = new ethers.Contract(
      RouterAddress,
      RouterAbi,
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
      PairAbi,
      signer
    );

    const res = await PairContract.getReserves();

   await RouterContract.swapExactTokensForTokens(
        ethers.parseUnits(String(token0Input), "ether"),
        ethers.parseUnits(String(token1Input - (token1Input * Slippage/100)), "ether"),
       0 === token0.address.toLowerCase().localeCompare([token0.address, token1.address].sort(compareHex)[0].toLowerCase()) ? [token0.address, token1.address]: [token1.address, token0.address],
        signerAddress,
        deadline
      ).then(null, (error) => console.log(error));
    
  };

  const approveTokens = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const token0Contract = new ethers.Contract(token0.address, ERC20, signer);
      const token1Contract = new ethers.Contract(token1.address, ERC20, signer);

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
        Number(ethers.formatEther(token0Allowance)) < token0Input &&
        Number(ethers.formatEther(token1Allowance)) < token1Input
      ) {
        await token0Contract
          .approve(RouterAddress, ethers.parseUnits(String(token0Input + 50), "ether"))
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        await token1Contract
          .approve(RouterAddress, ethers.parseUnits(String(token1Input + 50), "ether"))
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        if (caughtError === false) {
          setNeedsApproval(false);
        }
      }

      if (
        Number(ethers.formatEther(token0Allowance)) < token0Input &&
        Number(ethers.formatEther(token1Allowance)) > token1Input
      ) {
        await token0Contract
          .approve(RouterAddress, ethers.parseUnits(String(token0Input + 50), "ether"))
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        if (caughtError === false) {
          setNeedsApproval(false);
        }
      }

      if (
        Number(ethers.formatEther(token0Allowance)) > token0Input &&
        Number(ethers.formatEther(token1Allowance)) < token1Input
      ) {
        await token1Contract
          .approve(RouterAddress, ethers.parseUnits(String(token1Input + 50), "ether"))
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
          ERC20,
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
          ERC20,
          signer
        );
        const balance = await token1Contract
          .balanceOf(signerAddress)
          .then(null, (error) => console.log(error));
        setToken1Balance(Number(ethers.formatEther(balance)));
      }

      if (isSelected) {
        const factoryContract = new ethers.Contract(
          factory_address,
          FactoryAbi,
          signer
        );

        const token0Contract = new ethers.Contract(
          token0.address,
          ERC20,
          signer
        );
        const balance0 = await token0Contract
          .balanceOf(signerAddress)
          .then(null, (error) => console.log(error));
        setToken0Balance(Number(ethers.formatEther(balance0)));

        const token1Contract = new ethers.Contract(
          token1.address,
          ERC20,
          signer
        );
        const balance1 = await token1Contract
          .balanceOf(signerAddress)
          .then(null, (error) => console.log(error));
        setToken1Balance(Number(ethers.formatEther(balance1)));

        const pairAddress = await factoryContract.getPair(
          token0.address,
          token1.address
        );

        const pairContract = new ethers.Contract(pairAddress, PairAbi, signer);

        const reserves: any = await pairContract
          .getReserves()
          .then(null, (error) => console.log(error));

        setReserve0(Number(ethers.formatEther(reserves[0])));
        setReserve1(Number(ethers.formatEther(reserves[1])));
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


  useEffect(()=> {
    if (isSelected === true) {
    calcOutAmount()
    }
  }, [token0Input])
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
            <span className="select-none text-sm">From {isSelected && (0 === token0.address.toLowerCase().localeCompare([token0.address, token1.address].sort(compareHex)[1].toLowerCase())) ? "(estimated)":  "" }</span>
            <span key={token0.address}>Balance:{token0Balance.toFixed(2)}</span>
          </div>

          <div className="flex flex-row justify-between py-[.5vh]">
            <input
              onChange={(e) => {
                setToken0Input(Number(e.target.value))
                calcOutAmount()
              }}
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
          onClick={async () => {
            if (isSelected) {
              const temp = token0;

              setToken0(token1);
              setToken1(temp);
              if (direction === "down") {
                setDirection("up");
              } else {
                setDirection("down");
              }
              await getBalance();
            }
          }}
        >
          <ArrowSmallDownIcon color="white" className="w-4 h-4" />
        </span>

        <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] p-[3%] text-white ">
          <div className="flex flex-row justify-between">
            <span className="select-none text-sm">To {isSelected && (0 === token1.address.toLowerCase().localeCompare([token0.address, token1.address].sort(compareHex)[1].toLowerCase())) ? "(estimated)" : ""}</span>
            <span className="select-none">
              {" "}
              {isSelected === true ? `Balance:${token1Balance.toFixed(2)}` : "-"}
            </span>
          </div>

          {isSelected === true ? (
            <div className="flex flex-row justify-between items-end py-[.5vh]">
              <input
                onChange={(e) => {
                  setToken1Input(Number(e.target.value))
                }}
                id="token1Input"
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
            <span className="p-[3%]">Price and Impact</span>
            <div className="border-[1px] border-[#86C7DB25] rounded-xl p-[3%] flex flex-col justify-between ">
              <span className="flex flex-row items-center w-full space-x-1">
                <p key={direction}>
                  {direction === "up"
                    ? Number.isNaN(reserve0 / reserve1)
                      ? 0
                      : " " + (reserve0 / reserve1).toFixed(3)
                    : Number.isNaN(reserve1 / reserve0)
                    ? 0
                    : (reserve1 / reserve0).toFixed(3)}
                </p>
                <span className="font-bold">- {token0.symbol}</span>
                <span> per </span>
                <span className="font-bold">{token1.symbol}</span>
              </span>
              <span>Impact: <span className={impact < 10 ? "text-green-500 font-bold" : impact < 25 ? "text-yellow-500  font-bold" : impact > 25 ? "text-red-500  font-bold": ""}>{impact}%</span></span>
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
