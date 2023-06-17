"use client";

import CoinListButton from "@/app/components/Buttons/CoinListButton";
import CoinListItem from "@/app/components/CoinListItem";
import ERC20 from "@/abis/ERC20.json";
import RouterAbi from "@/abis/Router.json";
import FactoryAbi from "@/abis/Factory.json";
import PairAbi from "@/abis/Pair.json";
import {
  Gold,
  RouterAddress,
  Silver,
  factory_address,
} from "@/utils/constants";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowSmallLeftIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ethers } from "ethers";
import Link from "next/link";
import React, { Fragment, use, useEffect, useState } from "react";

interface Coin {
  name: string;
  symbol: string;
  address: string;
  image: string;
}

export default function addLiquidity() {
  const [isSelected, setSelected] = useState(false);
  const [token0, setToken0] = useState({
    name: "Sparq",
    symbol: "SPRQ",
    address: "0x4aFf1a752E49017FC486E627426F887DDf948B2F",
    image: "/logo.svg",
  } as Coin);
  const [token1, setToken1] = useState({
    name: "Sparq",
    symbol: "SPRQ",
    address: "0x000000000000000002",
    image: "/logo.svg",
  } as Coin);
  const [token0Input, setToken0Input] = useState(0);
  const [slippage, setSlippage] = useState(0.02);
  const [expectedOut, setExpectedOut] = useState(0);
  const [tokenField, setTokenField] = useState<undefined | number>(undefined)
  const [reserve0, setReserve0] = useState(0);
  const [reserve1, setReserve1] = useState(0);
  const [token0Balance, setToken0Balance] = useState(0);
  const [token1Balance, setToken1Balance] = useState(0);
  const [token1Input, setToken1Input] = useState(0);
  const [needsApproval, setNeedsApproval] = useState(true);
  const [coinsForListing, setCoinsForListing] = useState([
    { name: "Gold", symbol: "GLD", address: Gold, image: "/gold.png" } as Coin,
    {
      name: "Silver",
      symbol: "SLV",
      address: Silver,
      image: "/silver.png",
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
        Number(ethers.formatEther(token0Allowance)) < token0Input &&
        Number(ethers.formatEther(token1Allowance)) < token1Input
      ) {
        setNeedsApproval(true);
        return;
      }

      if (
        Number(ethers.formatEther(token0Allowance))  >= token0Input &&
        Number(ethers.formatEther(token1Allowance))  >= token1Input
      ) {
        setNeedsApproval(false);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const calculateLPStats = async (input: number, e:any) => {
    e.preventDefault()
    try {
      if (input === 0) {
        setTokenField(0)
        setToken0Input(e.target.value)
      }

      if (input === 1) {
        setTokenField(1)
        setToken1Input(e.target.value)
      }
      
    } catch (error) {
      console.log(error);
    }
  };

  const supplyLiquidity = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const RouterContract = new ethers.Contract(
        RouterAddress,
        RouterAbi.abi,
        signer
      );
      const factoryContract = new ethers.Contract(
        factory_address,
        FactoryAbi.abi,
        signer
      );
      const deadline = Number(Date.now() + 5 * 60 * 1000);
      const doesLPTokenExist = await factoryContract.getPair(
        token0.address,
        token1.address
      );
      if (doesLPTokenExist === "0x0000000000000000000000000000000000000000") {
        const LP_Token = await RouterContract.addLiquidity(
          token0.address,
          token1.address,
          ethers.toBigInt(token0Input * 100)** 16n,
          ethers.toBigInt(token1Input * 100)** 16n,
          ethers.toBigInt(token0Input * 100)** 16n,
          ethers.toBigInt(token1Input * 100)** 16n,
          signerAddress,
          deadline
        ).then(null, (error) => console.log(error));
        console.log(LP_Token)
      }

      if (doesLPTokenExist !== "0x0000000000000000000000000000000000000000") {
        console.log(

          token0.address + "\n",
          token1.address + "\n",
          ethers.toBigInt(Math.floor(token0Input * 100)) * 10n ** 16n + "\n",
          ethers.toBigInt(Math.floor(token1Input * 100)) * 10n ** 16n + "\n",
          ethers.toBigInt(Math.floor((token0Input - token0Input * slippage) * 100)) * 10n ** 16n + "\n",
          ethers.toBigInt(Math.floor((token1Input - token1Input * slippage) * 100)) * 10n ** 16n + "\n",
          signerAddress + "\n",
          deadline + "\n"

        )
        const LP_Token = await RouterContract.addLiquidity(
          token0.address,
          token1.address,
          String(ethers.toBigInt(Math.floor(token0Input * 100)) * 10n ** 16n),
          String(ethers.toBigInt(Math.floor(token1Input * 100)) * 10n ** 16n),
          String(ethers.toBigInt(Math.floor((token0Input - token0Input * slippage) * 100)) * 10n ** 16n),
          String(ethers.toBigInt(Math.floor((token1Input - token1Input * slippage) * 100)) * 10n ** 16n),
          signerAddress,
          deadline
        ).then(null, (error) => console.log(error));
        console.log(LP_Token);
      }

      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      // async() => {const wasAdded = await ethereum.request({
      //   method: 'wallet_watchAsset',
      //   params: {
      //     type: 'ERC20', // Initially only supports ERC20, but eventually more!
      //     options: {
      //       address: LP_Token.address, // The address that the token is at.
      //       symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
      //       decimals: tokenDecimals, // The number of decimals in the token
      //       image: tokenImage, // A string url of the token logo
      //     },
      //   },
      // });

      // if (wasAdded) {
      //   console.log('Thanks for your interest!');
      // } else {
      //   console.log('Your loss!');
      // }

      // }
    } catch (error) {
      console.log(error);
    }
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
    if (isSelected && (token0Input >= 0 || token1Input >= 0)) {
      checkApproval();
    }
  }, [isSelected, token0Input, token1Input]);


  useEffect(() => {
    if (isSelected && (token0Input > 0 || token1Input > 0) && tokenField === 1) {
    const calculateStats0 = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
  
        const factoryContract = new ethers.Contract(
          factory_address,
          FactoryAbi.abi,
          signer
        );
        const pairAddress = await factoryContract.getPair(
          token0.address,
          token1.address
        );
        const pairContract = new ethers.Contract(
          pairAddress,
          PairAbi.abi,
          signer
        );
        const totalSupply = await pairContract.totalSupply();
        const reserves = await pairContract.getReserves();
        const liquidityGenerated = Math.min(
          (Number(token0Input) * Number(totalSupply)) / Number(reserves[0]),
          (Number(token0Input) * Number(totalSupply)) / Number(reserves[1])
        );
        setExpectedOut(liquidityGenerated);
        setReserve0(Number(reserves[0]));
        setReserve1(Number(reserves[1]));
  
       if (Number(reserves[0]) === 0) {
          setToken0Input(token1Input);
          const token0 = document.getElementById("token0") as HTMLInputElement;
          token0.value = String(token1Input);
        } else if (Number(reserves[0]) !== 0) {
          const outPutToken =
            (Number(reserves[0]) * token1Input * 1000) /
            (Number(reserves[1]) * 1000);
          setToken0Input(outPutToken);
          const token0 = document.getElementById("token0") as HTMLInputElement;
          token0.value = String(outPutToken);
        }
      } catch (error) {
        console.log(error);
      }
    };
    calculateStats0();
    }


    if (isSelected && (token0Input > 0 || token1Input > 0 ) && tokenField === 0) {
      const calculateStats = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
    
          const factoryContract = new ethers.Contract(
            factory_address,
            FactoryAbi.abi,
            signer
          );
          const pairAddress = await factoryContract.getPair(
            token0.address,
            token1.address
          );
          const pairContract = new ethers.Contract(
            pairAddress,
            PairAbi.abi,
            signer
          );
          const totalSupply = await pairContract.totalSupply();
          const reserves = await pairContract.getReserves();
          const liquidityGenerated = Math.min(
            (Number(token0Input) * Number(totalSupply)) / Number(reserves[0]),
            (Number(token0Input) * Number(totalSupply)) / Number(reserves[1])
          );
          setExpectedOut(liquidityGenerated);
          setReserve0(Number(reserves[0]));
          setReserve1(Number(reserves[1]));
    
          if (Number(reserves[0]) === 0) {
            setToken1Input(token0Input);
            const token1 = document.getElementById("token1") as HTMLInputElement;
            token1.value = String(token0Input);
          } else if (Number(reserves[0]) !== 0) {
            const outPutToken =
              (Number(reserves[1]) * token0Input * 1000) /
              (Number(reserves[0]) * 1000);
            setToken1Input(outPutToken);
            const token1 = document.getElementById("token1") as HTMLInputElement;
            token1.value = String(outPutToken);
          } 
        } catch (error) {
          console.log(error);
        }
    
    }
    calculateStats();
  }



 
  }, [token1Input,token0Input]);

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
            <span>Balance:{token0Balance}</span>
          </div>

          <div className="flex flex-row justify-between py-[.5vh]">
            <input
              onChange={(e) => {
                calculateLPStats(0, e);
              }}
              id="token0"
              type="number"
              className="text-3xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.0"
            />
            <button
              onClick={() => setIsOpen({ show: true, tokenNum: 0 })}
              className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]"
            >
              <img className="w-[1vw]" src={token0.image} />
              <p className="text-2xl font-medium">
                {token0.name.toUpperCase()}
              </p>
              <ChevronDownIcon color="white" width="1vw" height="1vw" />
            </button>
          </div>
        </div>
        <span className="mx-auto text-white text-2xl my-[2vh]">+</span>

        <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] p-[3%] text-white ">
          <div className="flex flex-row justify-between">
            <span>Input</span>
            <span>
              {" "}
              {isSelected === true ? `Balance:${token1Balance}` : "-"}
            </span>
          </div>

          {isSelected === true ? (
            <div className="flex flex-row justify-between items-end py-[.5vh]">
              <input
                onChange={(e) => {
                  calculateLPStats(1, e);
                
                }}
                id="token1"
                type="number"
                className="text-3xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.0"
              />
              <button
                onClick={() => setIsOpen({ show: true, tokenNum: 1 })}
                className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]"
              >
                <img className="w-[1vw]" src={token1.image} />
                <p className="text-2xl font-medium">
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
                className="text-3xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.0"
              />
              <button
                onClick={() => setIsOpen({ show: true, tokenNum: 1 })}
                className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]"
              >
                <p className="text-2xl font-normal">Select Token</p>
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
                <p>
                  {Number.isNaN(reserve0 / reserve1) ? 0 : reserve0 / reserve1}
                </p>
                <p>
                  {token0.symbol} per {token1.symbol}
                </p>
              </span>
              <span className="flex flex-col items-center w-1/3">
                <p>
                  {Number.isNaN(reserve1 / reserve0) ? 0 : reserve1 / reserve0}
                </p>
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
        {isSelected === false ? (
          <button className="mt-[2vh] mx-[3%] rounded-xl bg-[#888D9B] py-[2vh] mb-[2vh] font-medium text-[#3E4148]">
            {" "}
            Invalid pair
          </button>
        ) : token0Input === 0 || String(token0Input).length === 0? (
          <button className="mt-[2vh] mx-[3%] rounded-xl bg-[#888D9B] py-[2vh] mb-[2vh] font-medium text-[#3E4148]">
            {" "}
            Enter an amount
          </button>
        ) : needsApproval === true ? (
          <button
            onClick={() => approveTokens()}
            className="mt-[2vh] mx-[3%] rounded-xl bg-[#00DAAC30] py-[2vh] mb-[2vh] font-medium text-[#00DAAC]"
          >
            {" "}
            Approve{" "}
          </button>
        ) : (
          <button
            onClick={() => supplyLiquidity()}
            className="mt-[2vh] mx-[3%] rounded-xl  bg-[#00DAAC30] py-[2vh] mb-[2vh] font-medium text-[#00DAAC] shadow shadow-lg"
          >
            {" "}
            Supply liquidity
          </button>
        )}
      </div>
    </>
  );
}
