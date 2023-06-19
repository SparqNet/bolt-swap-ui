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
    ArrowDownIcon,
  ArrowSmallLeftIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { BigNumberish, ethers } from "ethers";
import Link from "next/link";
import React, { Fragment, use, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";


interface Coin {
  name: string;
  symbol: string;
  address: string;
  image?: string;
}



function removeLiquidity() {
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
  const [display, setDisplay] = useState("simple");
  const [removePercent, setRemovePercentage] = useState(50);
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

  const getBalance = async (token0:string, token1:string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const factoryContract = new ethers.Contract(
        factory_address,
        FactoryAbi.abi,
        signer
      );


      const pairAddress = await factoryContract.getPair(
        token0,
        token1
      );
      const pairContract = new ethers.Contract(
        pairAddress,
        PairAbi.abi,
        signer
      );
      const totalSupply = await pairContract.totalSupply().then(null, (error) => console.log(error));
      const reserves:any = await pairContract.getReserves().then(null, (error) => console.log(error));
      const pairBalance = await pairContract
      .balanceOf(signerAddress)
      .then(null, (error) => console.log(error));

      setReserve0(Number(ethers.formatEther(reserves[0])))
      setReserve1(Number(ethers.formatEther(reserves[1])))

      const holdings =  Number(pairBalance) / Number(totalSupply)
      const token0holdings:number = Number(reserves[0]) / holdings
      const token1holdings =  Number(reserves[1]) /holdings

      let formattedNumber = token0holdings.toString();
      formattedNumber = formattedNumber.padStart(formattedNumber.length + (18 - formattedNumber.length), '0');
      formattedNumber = formattedNumber.slice(0, -18) + '.' + formattedNumber.slice(-18);

      let formattedNumber1 = token1holdings.toString();
      formattedNumber1 = formattedNumber1.padStart(formattedNumber1.length + (18 - formattedNumber1.length), '0');
      formattedNumber1 = formattedNumber1.slice(0, -18) + '.' + formattedNumber1.slice(-18);
      
      setToken0Balance(Number(Number(formattedNumber).toFixed(2)));
      setToken1Balance(Number(Number(formattedNumber1).toFixed(2)));

  

        const token0Contract = new ethers.Contract(
          token0,
          ERC20.abi,
          signer
        );
   
     

      const symbol0 = await token0Contract
      .symbol()
      .then(null, (error) => console.log(error));

      const name0 = await token0Contract
      .name()
      .then(null, (error) => console.log(error))

      setToken0({
        name: name0,
        symbol: symbol0,
        address: token0,
      } as Coin);

  
        const token1Contract = new ethers.Contract(
          token1,
          ERC20.abi,
          signer
        );

        const symbol1 = await token1Contract
        .symbol()
        .then(null, (error) => console.log(error));

        const name1 = await token1Contract
        .name()
        .then(null, (error) => console.log(error))

        setToken1({
          name: name1,
          symbol: symbol1,
          address: token1,
        } as Coin);
  
  
 
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if ((token0Input >= 0 || token1Input >= 0)) {
      checkApproval();
    }
  }, [token0Input, token1Input]);
 


  useEffect(() => {
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

    calculateStats0();
    }



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
    
    
    calculateStats();
  }



 
  }, [token1Input,token0Input]);

  const path = usePathname().split('/')

  useEffect(() => {

    const token0Pth = path[3]
    const token1Pth = path[4]
    getBalance(token0Pth, token1Pth);
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



      <div className="flex flex-col md:max-w-[30vw] mx-auto bg-[#00AFE340] rounded-3xl mt-[3vh]">
        <div className="flex flex-row items-center justify-between p-[5%]">
          <Link href={"/liquidity"}>
            <ArrowSmallLeftIcon color="white" width="1vw" height="1vw" />
          </Link>
          <span className="text-white font-medium text-xl">Remove Liquidity</span>
          <QuestionMarkCircleIcon color="white" width="1vw" height="1vw" />
        </div>
        <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] p-[5%] text-white ">
          <div className="flex flex-row justify-between text-[#00DAAC]">
            <span className="text-white">Amount</span>
            <span className="cursor-pointer" onClick={() => {
                if (display === "detailed") {
                    setDisplay("simple")
                } else {
                    setDisplay("detailed")
                }

                
            }}  >{display === "detailed" ? "Detailed" : "Simple"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[4rem]">{removePercent}%</span>
            <input value={removePercent} onChange={(e) => setRemovePercentage(Number(e.target.value))} className="cursor-pointer w-full my-[2vh] focus:outline-none" type="range" min={0} max={100} step={1}></input>
            <div className="flex flex-row justify-between pt-[2vh]">
                <button onClick={() => 
                        setRemovePercentage(25)
                } className="rounded-lg  bg-[#00DAAC40] h-[4vh] w-[] px-3 py-2 text-[#00DAAC] border border-solid-[1px] border-[#00DAAC]">25%</button>
                <button onClick={() => 
                        setRemovePercentage(50)
                } className="rounded-lg  bg-[#00DAAC40] h-[4vh] w-[] px-3 py-2 text-[#00DAAC] border border-solid-[1px] border-[#00DAAC]">50%</button>
                <button onClick={() => 
                        setRemovePercentage(75)
                } className="rounded-lg  bg-[#00DAAC40] h-[4vh] w-[] px-3 py-2 text-[#00DAAC] border border-solid-[1px] border-[#00DAAC]">75%</button>
                <button onClick={() => 
                        setRemovePercentage(100)
                } className="rounded-lg  bg-[#00DAAC40] h-[4vh] w-[] px-3 py-2 text-[#00DAAC] border border-solid-[1px] border-[#00DAAC]">Max</button>
            </div>
          </div>
          </div>
            <div>
            <ArrowDownIcon className="mx-auto my-[2vh]" color="white" width="1.5vw" height="1.5vw" />
            <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] text-white ">

            <div className="border-b-[1px] border-[#86C7DB25] rounded-xl  p-[5%] text-white ">

              <span className="flex flex-row text-2xl justify-between items-center">
                <p className="">{token0Balance}</p>
                <span className="flex flex-row items-center justify-center"><QuestionMarkCircleIcon className="w-[2.5vh] h-[2.5vh] mr-[5%]" width="100%" height="100%"/>{token0.symbol}</span>
              </span>

              <span className="flex flex-row justify-between items-center text-2xl">
                <p className="">{token1Balance}</p>
                <span className="flex flex-row items-center justify-center"><QuestionMarkCircleIcon className="w-[2.5vh] h-[2.5vh] mr-[5%]" width="100%" height="100%"/>{token1.symbol}</span>
              </span>
              </div>
             
              <span className="flex flex-row justify-between items-center p-[5%]" >
                <p>Price:</p>
                <span className="flex flex-col space-y-[1vh]">
                <p>
                  {Number.isNaN(reserve0 / reserve1) ? 0 : reserve0 / reserve1}  {token0.symbol} = {Number.isNaN(reserve1 / reserve0) ? 0 : reserve1 / reserve0} {token1.symbol}
                </p>
                <p>
                  {Number.isNaN(reserve1 / reserve0) ? 0 : reserve1 / reserve0}  {token1.symbol} = {Number.isNaN(reserve0 / reserve1) ? 0 : reserve0 / reserve1} {token0.symbol}
                </p>
                </span>
              </span>
   
      </div>
      <span className="flex flex-row mt-[2vh] justify-between mb-[2vh] mx-[3%]">
      <button className="py-[2vh] w-[49%] bg-[#00DAAC90] rounded-xl flex flex-row justify-center text-white items-center">Approve</button>
           <button className="py-[2vh] w-[49%] bg-[#00DAAC90] rounded-xl flex flex-row justify-center items-center text-white">Remove</button>
           </span>
            </div>
            </div>
    </>
  );
}

export default removeLiquidity
