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
import { usePathname } from "next/navigation";
import { useStore } from "@/app/useStore";

interface Coin {
  name: string;
  symbol: string;
  address: string;
  image: string;
  new?: boolean;
}

export default function AddLiquidity() {
  let tokenList = [
    { name: "Gold", symbol: "GLD", address: Gold, image: "/gold.png" } as Coin,
    {
      name: "Silver",
      symbol: "SLV",
      address: Silver,
      image: "/silver.png",
    } as Coin,
  ];

  const [isSelected, setSelected] = useState(false);
  const [token0, setToken0] = useState({
    name: "Sparq",
    symbol: "SPRQ",
    address: "",
    image: "/logo.svg",
  } as Coin);
  const [token1, setToken1] = useState({
    name: "Sparq",
    symbol: "SPRQ",
    address: "",
    image: "/logo.svg",
  } as Coin);
  const [Slippage, Network, Deadline] = useStore((state: any) => [
    state.Slippage, state.Network,  state.Deadline
  ]);
  const [token0Input, setToken0Input] = useState(0);

  const [expectedOut, setExpectedOut] = useState(0);
  const [lpTokenExists, setLPTokenExists] = useState(true);
  const [tokenField, setTokenField] = useState<undefined | number>(undefined);
  const [reserve0, setReserve0] = useState(0);
  const [reserve1, setReserve1] = useState(0);
  const [token0Balance, setToken0Balance] = useState(0);
  const [token1Balance, setToken1Balance] = useState(0);
  const [token1Input, setToken1Input] = useState(0);
  const [needsApproval, setNeedsApproval] = useState(true);
  const [percentOfPool, setPercentOfPool] = useState(0);
  const [coinsForListing, setCoinsForListing] = useState(tokenList);
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

      const token0Bal = await token0Contract
        .balanceOf(signerAddress)
        .then(null, (error) => console.log(error));

      const token1Bal = await token1Contract
        .balanceOf(signerAddress)
        .then(null, (error) => console.log(error));

        

      const token0Allowance = await token0Contract.allowance(
        signerAddress,
        RouterAddress
      );
      const token1Allowance = await token1Contract.allowance(
        signerAddress,
        RouterAddress
      );

      console.log({token0Allowance: token0Allowance + "/" + token0Input }, {token1Allowance: token0Allowance + "/" + token1Input})
      setToken0Balance(Number(ethers.formatEther(token0Bal)));
      setToken1Balance(Number(ethers.formatEther(token1Bal)));

      if (
        Number(token0Allowance) >= token0Input &&
        Number(token1Allowance) < token1Input
      ) {
        console.log("this0")
        setNeedsApproval(true);
        return;
      }

      if (
        Number(token0Allowance) < token0Input &&
        Number(token1Allowance) < token1Input
      ) {

        setNeedsApproval(true);
        return;
      }

      if (
        Number(token0Allowance) < token0Input &&
        Number(token1Allowance) >= token1Input
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

  const calculateLPStats = async (input: number, e: any) => {
    e.preventDefault();
    try {
      if (input === 0) {
        setTokenField(0);
        setToken0Input(e.target.value);
      }

      // if (input === 1) {
      //   setTokenField(1);
      //   setToken1Input(e.target.value);
      // }
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
      const deadline = Number(Date.now() + Deadline * 60 * 1000);
  
        console.log(
          token1.address,
          ethers.parseUnits(String(token0Input),"ether"),
          ethers.parseUnits(String(token1Input),"ether"),
          ethers.parseUnits(String(token0Input - (token0Input * (Slippage /100))) ,"ether"),
          ethers.parseUnits(String(token1Input - (token1Input * (Slippage /100))) ,"ether"),
          signerAddress,
          deadline
        );
        const addLp = await RouterContract.addLiquidity(
          token0.address,
          token1.address,
          ethers.parseUnits(String(token0Input),"ether"),
          ethers.parseUnits(String(token1Input),"ether"),
          ethers.parseUnits(String(token0Input - (token0Input * (Slippage /100))) ,"ether"),
          ethers.parseUnits(String(token1Input - (token1Input * (Slippage /100))) ,"ether"),
          signerAddress,
          deadline
        )
        await addLp
        await getBalance(token0.address, token1.address).then((error) => console.log(error));
      

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
        Number(ethers.formatEther(token0Allowance)) < token0Input &&
        Number(ethers.formatEther(token1Allowance)) < token1Input
      ) {

       const tx1 = await token0Contract
          .approve(RouterAddress, ethers.toBigInt(token0Input))
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
       const tx2 = await token1Contract
          .approve(RouterAddress, token1Input)
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });

          await provider.waitForTransaction(tx1.hash)
          await provider.waitForTransaction(tx2.hash)

          if (caughtError === false) {
            setNeedsApproval(false);
          }


      }

      if (
        Number(ethers.formatEther(token0Allowance)) < token0Input &&
        Number(ethers.formatEther(token1Allowance)) > token1Input
      ) {
        console.log(ethers.toBigInt(token0Input))
        const tx1 = await token0Contract
          .approve(RouterAddress, ethers.toBigInt(token0Input))
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });

          await provider.waitForTransaction(tx1.hash)

        if (caughtError === false) {
          setNeedsApproval(false);
        }
      }

      if (
        Number(ethers.formatEther(token0Allowance)) > token0Input &&
        Number(ethers.formatEther(token1Allowance)) < token1Input
      ) {
        const tx1 = await token1Contract
          .approve(RouterAddress, ethers.toBigInt(token1Input))
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
          await provider.waitForTransaction(tx1.hash)

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

    console.log(coin.address)

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

  const getBalance = async (token0: string, token1: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const factoryContract = new ethers.Contract(
        factory_address,
        FactoryAbi.abi,
        signer
      );

      const pairAddress = await factoryContract.getPair(token0, token1);
      if (pairAddress === "0x0000000000000000000000000000000000000000") {
        setLPTokenExists(false);
        return;
      }
      const pairContract = new ethers.Contract(
        pairAddress,
        PairAbi.abi,
        signer
      );

      const totalSupply = await pairContract
        .totalSupply()
        .then(null, (error) => console.log(error));
      const reserves: any = await pairContract
        .getReserves()
        .then(null, (error) => console.log(error));
      const pairBalance = await pairContract
        .balanceOf(signerAddress)
        .then(null, (error) => console.log(error));

      setReserve0(Number(ethers.formatEther(reserves[0])));
      setReserve1(Number(ethers.formatEther(reserves[1])));

      const holdings = Number(pairBalance) / Number(totalSupply);
      const token0holdings: number = Number(reserves[0]) / holdings;
      const token1holdings = Number(reserves[1]) / holdings;

      let formattedNumber = token0holdings.toString();
      formattedNumber = formattedNumber.padStart(
        formattedNumber.length + (18 - formattedNumber.length),
        "0"
      );
      formattedNumber =
        formattedNumber.slice(0, -18) + "." + formattedNumber.slice(-18);

      let formattedNumber1 = token1holdings.toString();
      formattedNumber1 = formattedNumber1.padStart(
        formattedNumber1.length + (18 - formattedNumber1.length),
        "0"
      );
      formattedNumber1 =
        formattedNumber1.slice(0, -18) + "." + formattedNumber1.slice(-18);

      // setLPHoldings(Number(ethers.formatEther(pairBalance)));
      setPercentOfPool(holdings * 100);

      const token0Contract = new ethers.Contract(token0, ERC20.abi, signer);

      const symbol0 = await token0Contract
        .symbol()
        .then(null, (error) => console.log(error));

      const name0 = await token0Contract
        .name()
        .then(null, (error) => console.log(error));

      setToken0({
        name: name0,
        symbol: symbol0,
        address: token0,
      } as Coin);

      const token1Contract = new ethers.Contract(token1, ERC20.abi, signer);

      const symbol1 = await token1Contract
        .symbol()
        .then(null, (error) => console.log(error));

      const name1 = await token1Contract
        .name()
        .then(null, (error) => console.log(error));

      setToken1({
        name: name1,
        symbol: symbol1,
        address: token1,
      } as Coin);
      setSelected(true);
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   if (
  //     isSelected &&
  //     (token0Input > 0 || token1Input > 0) &&
  //     tokenField === 1
  //   ) {
  //     const calculateStats0 = async () => {
  //       try {
  //         const provider = new ethers.BrowserProvider(window.ethereum);
  //         const signer = await provider.getSigner();

  //         const factoryContract = new ethers.Contract(
  //           factory_address,
  //           FactoryAbi.abi,
  //           signer
  //         );
  //         const pairAddress = await factoryContract.getPair(
  //           token0.address,
  //           token1.address
  //         );
  //         const pairContract = new ethers.Contract(
  //           pairAddress,
  //           PairAbi.abi,
  //           signer
  //         );
  //         if (lpTokenExists === false) {
  //           setToken0Input(token0Input);
  //           const token1 = document.getElementById(
  //             "token1"
  //           ) as HTMLInputElement;
  //           token1.value = String(token0Input);
  //           return;
  //         }

  //         const totalSupply = await pairContract.totalSupply();
  //         const reserves = await pairContract.getReserves();
  //         const liquidityGenerated = Math.min(
  //           (Number(token0Input) * Number(totalSupply)) / Number(reserves[0]),
  //           (Number(token0Input) * Number(totalSupply)) / Number(reserves[1])
  //         );
  //         setExpectedOut(liquidityGenerated);
  //         setReserve0(Number(reserves[0]));
  //         setReserve1(Number(reserves[1]));

  //         if (Number(reserves[0]) === 0) {
  //           setToken0Input(token1Input);
  //           const token0 = document.getElementById(
  //             "token0"
  //           ) as HTMLInputElement;
  //           token0.value = String(token1Input);
  //         } else if (Number(reserves[0]) !== 0) {
  //           const outPutToken =
  //             (Number(reserves[0]) * token1Input * 1000) /
  //             (Number(reserves[1]) * 1000);
  //           setToken0Input(outPutToken);
  //           const token0 = document.getElementById(
  //             "token0"
  //           ) as HTMLInputElement;
  //           token0.value = String(outPutToken);
  //         }
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     };
  //     calculateStats0();
  //   }

  //   if (
  //     isSelected &&
  //     (token0Input > 0 || token1Input > 0) &&
  //     tokenField === 0
  //   ) {
  //     const calculateStats = async () => {
  //       try {
  //         const provider = new ethers.BrowserProvider(window.ethereum);
  //         const signer = await provider.getSigner();

  //         const factoryContract = new ethers.Contract(
  //           factory_address,
  //           FactoryAbi.abi,
  //           signer
  //         );
  //         const pairAddress = await factoryContract.getPair(
  //           token0.address,
  //           token1.address
  //         );
  //         const pairContract = new ethers.Contract(
  //           pairAddress,
  //           PairAbi.abi,
  //           signer
  //         );

  //         if (lpTokenExists === false) {
  //           setToken1Input(token0Input);
  //           const token1 = document.getElementById(
  //             "token1"
  //           ) as HTMLInputElement;
  //           token1.value = String(token0Input);
  //           return;
  //         }
  //         const totalSupply = await pairContract.totalSupply();
  //         const reserves = await pairContract.getReserves();
  //         const liquidityGenerated = Math.min(
  //           (Number(token0Input) * Number(totalSupply)) / Number(reserves[0]),
  //           (Number(token0Input) * Number(totalSupply)) / Number(reserves[1])
  //         );
  //         setExpectedOut(liquidityGenerated);
  //         setReserve0(Number(reserves[0]));
  //         setReserve1(Number(reserves[1]));

  //         if (Number(reserves[0]) === 0) {
  //           setToken1Input(token0Input);
  //           const token1 = document.getElementById(
  //             "token1"
  //           ) as HTMLInputElement;
  //           token1.value = String(token0Input);
  //         } else if (Number(reserves[0]) !== 0) {
  //           const outPutToken =
  //             (Number(reserves[1]) * token0Input * 1000) /
  //             (Number(reserves[0]) * 1000);
  //           setToken1Input(outPutToken);
  //           const token1 = document.getElementById(
  //             "token1"
  //           ) as HTMLInputElement;
  //           token1.value = String(outPutToken);
  //         }
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     };
  //     calculateStats();
  //   }
  // }, [token1Input, token0Input]);

  const search = async (query: string) => {
    const savedTokens = JSON.parse(localStorage.getItem("addedERC20Token")!);

    if (savedTokens !== null) {
      for (let i = 0; i < Object.keys(savedTokens).length; i++) {
        tokenList.push(savedTokens[i]);
      }
    }

    const newArray = tokenList.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setCoinsForListing(newArray);

    const addressRegex = /^(0x)?[0-9a-fA-F]{40}$/;

    if (addressRegex.test(query)) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);

        const tokenContract = new ethers.Contract(query, ERC20.abi, provider);

        const symbol0 = await tokenContract
          .symbol()
          .then(null, (error) => console.log(error));

        const name0 = await tokenContract
          .name()
          .then(null, (error) => console.log(error));

        const addition: Coin = {
          name: name0,
          symbol: symbol0,
          address: query,
          image: "",
          new: false,
        };

        const addition1: Coin = {
          name: name0,
          symbol: symbol0,
          address: query,
          image: "",
          new: true,
        };

        if (localStorage.getItem("addedERC20Token") === null) {
          setCoinsForListing([addition1]);
        }

        if (localStorage.getItem("addedERC20Token") !== null) {
          setCoinsForListing([addition]);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const addNewToken = (coin: Coin) => {
    if (localStorage.getItem("addedERC20Token") !== null) {
      const prevEntry = localStorage.getItem("addedERC20Token");
      const prevObject = JSON.parse(prevEntry!);
      for (let i = 0; i < Object.keys(prevObject).length; i++) {
        console.log(prevObject[i]["address"], coin.address);
        if (prevObject[i]["address"] === coin.address) {
          return;
        }
      }
      const nextIndex = Object.keys(prevObject).length + 1;
      prevObject[nextIndex] = {
        name: coin.name,
        symbol: coin.symbol,
        address: coin.address,
        image: coin.image,
        new: false,
      } as Coin;
      const updated = JSON.stringify(prevObject);
      localStorage.setItem("addedERC20Token", updated);
    }

    if (localStorage.getItem("addedERC20Token") === null) {
      const update: Coin = {
        name: coin.name,
        symbol: coin.symbol,
        address: coin.address,
        image: coin.image,
        new: false,
      };
      const newAddition = { 0: update };
      const updated = JSON.stringify(newAddition);

      localStorage.setItem("addedERC20Token", updated);
    }
  };

  const path = usePathname().split("/");

  useEffect(() => {
    const token0Pth = path[3];
    const token1Pth = path[4];
    if (token0Pth === "null" && token1Pth === "null") {
      if (token0.address !== "" && token1.address !== "") {
        getBalance(token0.address, token1.address);
      }
      return;
    } else {
      getBalance(token0Pth, token1Pth);
    }
  }, [token0, token1]);

  useEffect(() => {
    const savedTokens = JSON.parse(localStorage.getItem("addedERC20Token")!);

    if (savedTokens !== null) {
      for (let i = 0; i < Object.keys(savedTokens).length; i++) {
        tokenList.push(savedTokens[i]);
      }

      setCoinsForListing(tokenList);
    }
  }, [tokenList.length]);

  useEffect(() => {
    if (isSelected && (token0Input >= 0 || token1Input >= 0)) {
      checkApproval();
    }
  }, [isSelected, token0Input, token1Input]);

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
                    <MagnifyingGlassIcon
                      color="black"
                      className="w-5 absolute mt-[13px] ml-[14px]"
                    />
                    <input
                      className="border border-grey2 outline-none py-2.5 pl-12 rounded-lg w-full placeholder:text-grey placeholder:font-regular text-black"
                      placeholder="Search name or paste address"
                      value={inputVal}
                      onChange={(e) => {
                        setInputVal(e.target.value);
                        search(e.target.value);
                      }}
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
                          addToken={addNewToken}
                          key={index}
                        />
                      );
                    })}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <div className="flex flex-col md:max-w-[30vw] mx-auto bg-[#00AFE340] rounded-3xl mt-[3vh]">
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
                // calculateLPStats(0, e);
                setToken0Input(Number(e.target.value))
              }}
              id="token0"
              type="number"
              className="text-3xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.0"
            />
            <button
              onClick={() => setIsOpen({ show: true, tokenNum: 0 })}
              className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh] max-w-[50%]"
            >
              {token0.image === "" ? (
                <QuestionMarkCircleIcon
                  color="white"
                  width="1vw"
                  height="1vw"
                />
              ) : (
                <img className="w-[1vw]" src={token0.image} />
              )}
              <p className="text-2xl font-medium truncate max-w-full text-ellipsis">
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
                  // calculateLPStats(1, e);
                  setToken1Input(Number(e.target.value))
                }}
                id="token1"
                type="number"
                className="text-3xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.0"
              />
              <button
                onClick={() => setIsOpen({ show: true, tokenNum: 1 })}
                className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh] max-w-[50%]"
              >
                {token1.image === "" ? (
                  <QuestionMarkCircleIcon
                    color="white"
                    width="1vw"
                    height="1vw"
                  />
                ) : (
                  <img className="w-[1vw]" src={token1.image} />
                )}
                <p className="text-2xl font-medium  truncate max-w-full text-ellipsis ">
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
                <p>{percentOfPool}%</p>
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
        ) : !(token0Input > 0 || String(token0Input).length > 0) || !(token1Input > 0 || String(token1Input).length > 0) ? (
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
