"use client";

import Link from "next/link";
import "./globals.css";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  Cog8ToothIcon,
  EyeDropperIcon,
  QuestionMarkCircleIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "./useStore";
import { ContractManagerAddress } from "@/utils/constants";
import ContractMangerAbi from '../abis/ContractManager.json'
import { ConfirmingToast } from "./components/Toasts/Confirming";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: 'Bolt Swap',
//   description: 'The premier DEX on Sparq Network',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  wallet: { address: string; nativeBalance: string };
}) {
  const path = usePathname();
  const [wallet, setWallet] = useState<
    undefined | { address: string; nativeBalance: string }
  >(undefined);
  const [network, setNetwork] = useState("");
  const [networkId, setNetworkId] = useState(0);
  const [faucetOpened, setFaucetOpened] = useState(false);
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [mintOpened, setMintOpened] = useState(false);
  const [mintName, setMintName] = useState("")
  const [mintSymbol, setMintSymbol] = useState("")
  const [toastTxnHash, setToastTxnHash] = useState("");
  const [showToast, setShowToast] = useState("");
  const [mintDecimals, setMintDecimals] = useState(18)
  const [mintAmount, setMintAmount] = useState(ethers.parseUnits('1000'))
  const [sendAddressForFaucet, setSendAddressForFaucet] = useState("0x00")
  const [Slippage, Network, Connection, Deadline, updateNetwork, updateSlippage, updateConnection, updateDeadline] =
    useStore((state: any) => [
      state.Slippage,
      state.Network,
      state.Connection,
      state.Deadline,
      state.updateNetwork,
      state.updateSlippage,
      state.updateConnection,
      state.updateDeadline
    ]);

  const connectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setWallet({
        address: signer.address,
        nativeBalance: ethers.formatEther(
          await signer.provider.getBalance(signer.address)
        ),
      });
      localStorage.setItem("hasConnected", "true");
      updateConnection(true);
    } catch (error) {
      console.log(error);
    }
  };

  function copyToClipboard(text: string) {
    // Check if the Clipboard API is supported
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      // Use the Clipboard API
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log("Text copied to clipboard");
        })
        .catch((error) => {
          console.error("Failed to copy text to clipboard:", error);
        });
    } else {
      // Use the document.execCommand method as a fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed"; // Ensure it's not visible
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        console.log("Text copied to clipboard");
      } catch (error) {
        console.error("Failed to copy text to clipboard:", error);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }

  const checkNetwork = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: 'C4C4C0' }],
          });
        } catch (switchError:any) {
          if (switchError.code === 4902) {
            setNetwork("Wrong Network");
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: 'C4C4C0',
                    chainName: 'Bolt-Swap',
                    rpcUrls: ['https://dex-demo-api.sparq.network'],
                  },
                ],
              });
              setNetwork("Orbiter");
              updateNetwork("Orbiter");
            } catch (addError) {
              console.log(addError)
            }
          }
        }
        const currentNetwork = window.ethereum;
        currentNetwork.on("chainChanged", (networkId: number) => {
          setNetworkId(networkId);
        });

        currentNetwork.on("accountsChanged", (accounts: []) => {
          if (accounts.length === 0) {
            localStorage.setItem("hasConnected", "false");
            updateConnection(false);
          }
        });
      }
  };

  const handleDivClick = (event:any) => {
    event.stopPropagation();

  };

  const handleButtonClick = (event:any, inputValue:number | string) => {
    event.stopPropagation();
    const input = document.getElementById('slippageInput') as HTMLInputElement
    input.value = String(inputValue)
  };

  const mintNewToken = async() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const mintContract = new ethers.Contract(ContractManagerAddress,ContractMangerAbi,signer)
    const txn = await mintContract.createNewERC20Contract(mintName, mintSymbol, mintDecimals, mintAmount)

    setToastTxnHash(await txn.hash);
    setShowToast("confirm");
    await provider.waitForTransaction(await txn.hash).then(async() =>
    null, (err) => console.log(err));
    return;

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

  }
  const getSparq = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_FAUCET_KEY as string, provider);
      const toAddress = sendAddressForFaucet;
      const amountInEther = ethers.parseEther('1');

(async () => {await wallet.sendTransaction({
    to: toAddress,
    value: amountInEther
  });
})(); 
  }

  useEffect(() => {
    const hasConnected =
    localStorage.getItem("hasConnected") === null
      ? false
      : Boolean(localStorage.getItem("hasConnected"));
    if (hasConnected) {
      connectWallet()
        .then(() => checkNetwork())
        .catch((error) => console.log(error));
    }
  }, [networkId, wallet?.address, Connection]);

  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/png"
          sizes="32x32"
        />
      </head>
      <ConfirmingToast
        hash={toastTxnHash}
        key={showToast}
        isOpen={showToast}
        closeToast={(toast: string) => setShowToast(toast)}
      />
      <body className={inter.className}>
        <div className="bg-[url('/background.svg')] bg-cover min-h-screen h-full">
          <div className="py-[2%] px-[4%]" id="main-container">
            <span className="flex flex-row justify-between items-center h-[5%]">
              <span className="flex flex-row text-white">
                <img className="h-[4vh]" src="/logo.svg" />
                <span className="flex flex-row text-white pl-[4vw] space-x-[2vw] items-center">
                  <Link
                    className={path.includes("/swap") ? "font-bold" : ""}
                    href={"/swap"}
                  >
                    Swap
                  </Link>
                  <Link
                    className={path.includes("/liquidity") ? "font-bold" : ""}
                    href={"/liquidity"}
                  >
                    Liquidity
                  </Link>
                </span>
              </span>
              <span className="relative flex flex-row space-x-[.5vw]">
                {network === "Wrong Network" ? null : wallet === undefined ||
                  Connection === false ? (
                  <button
                    onClick={() => connectWallet()}
                    className="rounded-lg bg-[#00DAAC40] h-[4vh] px-3 py-2 text-[#00DAAC] font-bold"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <>
                  <Link href={"/swap/wrap"} className="rounded-lg bg-white h-[4vh] px-3 py-2 font-bold">
                    Get WSPARQ &nbsp;🔄
                  </Link>
                  <span onClick={() => setMintOpened(!mintOpened)} className="rounded-lg bg-white h-[4vh] px-3 py-2 text-black font-bold">
                      Mint Tokens 🪄
                     
                      <div onClick={(event) => handleDivClick(event)} className={mintOpened === false ? "hidden" : "z-40  block absolute top-[5vh] text-white left-0 rounded-lg bg-black transition-opacity duration-[2000] p-[1rem] flex flex-col items-center space-y-3"}>
                        <span className="font-medium text-left flex-shrink-0 ">
                          Mint a new token
                        </span>
                        <input onChange={(e) => setMintName(e.target.value)} id="mintName" className="appearance-none outline-none border-none bg-[#00DAAC40] rounded-lg text-right text-white h-[4vh] placeholder:text-[lightGray] p-[3%]" placeholder="Token Name"></input>
                        <input onChange={(e) => setMintSymbol(e.target.value)} id="mintSymbol" className="appearance-none outline-none border-none bg-[#00DAAC40] rounded-lg text-right text-white h-[4vh] placeholder:text-[lightGray] p-[3%]" placeholder="Token Symbol"></input>
                        <input onChange={(e) => setMintDecimals(Number(e.target.value))} id="mintDecimals" className="appearance-none outline-none border-none bg-[#00DAAC40] rounded-lg text-right text-white h-[4vh] placeholder:text-[lightGray] p-[3%]" placeholder="Decimals (ex:18)"></input>
                        <input onChange={(e) => setMintAmount(ethers.parseUnits(e.target.value))} id="mintAmount" className="appearance-none outline-none border-none bg-[#00DAAC40] rounded-lg text-right text-white h-[4vh] placeholder:text-[lightGray] p-[3%]" placeholder="Amount (ex:1000)"></input>
                        <span onClick={() => mintNewToken()} className="cursor-pointer rounded-lg bg-[#00DAAC40] h-full px-3 py-2 text-[#00DAAC] font-bold">
                          Mint
                      </span>
                        </div>
                        </span>
                  <span onClick={() => setFaucetOpened(!faucetOpened)} className="rounded-lg bg-[#00DAAC40] h-[4vh] px-3 py-2 text-[#00DAAC] font-bold">
                      <EyeDropperIcon
                        className="transition duration-[1000] hover:rotate-[720deg]"
                        color="#00DAAC"
                        height="100%"
                      />
                      <div onClick={(event) => handleDivClick(event)} className={faucetOpened === false ? "hidden" : "z-20  block absolute top-[5vh] text-white left-0 rounded-lg bg-[#00AFE340] transition-opacity duration-[2000] p-[1rem] flex flex-row items-center space-x-3"}>
                        <span className="font-medium text-left flex-shrink-0 ">
                          Send To
                        </span>
                        <input onChange={(e) => setSendAddressForFaucet(e.target.value)} id="faucetInput" className="appearance-none outline-none border-none bg-black rounded-lg text-right text-white h-[4vh] placeholder:text-[#404040] p-[3%]" placeholder="0x00"></input>
                        <span onClick={() => getSparq()} className="cursor-pointer rounded-lg bg-[#00DAAC40] h-full px-3 py-2 text-[#00DAAC] font-bold" style={{marginRight:'1rem'}}>
                          Send
                      </span>
                        </div>
                        </span>

                    {" "}
                    <p className="rounded-lg bg-[#00DAAC40] h-[4vh] px-3 py-2 text-[#00DAAC] font-bold">
                      {network}
                    </p>
                    <p className="rounded-lg bg-[#00DAAC40] h-[4vh] px-3 py-2 text-[#00DAAC] font-bold">
                      {" "}
                      {Number(wallet?.nativeBalance).toFixed(2)} SPARQ
                    </p>
                    <button
                      onClick={() => copyToClipboard(wallet.address)}
                      className="rounded-lg bg-[#00DAAC40] h-[4vh] px-3 py-2 text-[#00DAAC] font-bold"
                    >
                      <span className="flex flex-row items-center">
                        <WalletIcon height={"2vh"} />{" "}
                        <p className="pl-[.5vw]">
                          {wallet.address.substring(0, 5) +
                            "..." +
                            wallet.address.slice(-4)}
                        </p>
                      </span>
                    </button>
                    <span onClick={() => setSettingsOpened(!settingsOpened)} className="rounded-lg bg-[#00DAAC40] h-[4vh] px-3 py-2 text-[#00DAAC] font-bold">
                      <Cog8ToothIcon
                        className="transition duration-[1000] hover:rotate-[720deg]"
                        color="#00DAAC"
                        height="100%"
                      />
                      <div onClick={(event) => handleDivClick(event)} className={settingsOpened === false ? "hidden" : "z-20 block absolute top-[5vh] text-white right-0 rounded-lg bg-[#00AFE340] w-[20vw] transition-opacity duration-[2000] p-[3%] flex flex-col"}>
                        <p className="font-medium text-left">
                          Transaction Settings
                        </p>
                        <span className="flex flex-row space-x-[.3vw] items-center  pt-[1.5vh]">
                          <p className="font-extralight">Slippage Tolerance</p>
                          <QuestionMarkCircleIcon width="1vw" />
                        </span>
                        <span className="flex flex-row space-x-[.3vw] w-full z-2 pt-[.5vh]">
                          <button onClick={(event)=> handleButtonClick(event, 3)} className="rounded-full py-[.2vh] px-[.5vw] bg-black border border-solid-[1px] border-[#404040] text-white">3%</button>
                          <button onClick={(event)=> handleButtonClick(event, 10)}  className="rounded-full py-[.2vh] px-[.5vw] bg-black border border-solid-[1px] border-[#404040] text-white">10%</button>
                          <button onClick={(event)=> handleButtonClick(event, 20)}  className="rounded-full py-[.2vh] px-[.5vw] bg-black border border-solid-[1px] border-[#404040] text-white">20%</button>
                          <span onClick={(event)=> handleButtonClick(event, "")} className="rounded-full py-[.2vh] px-[.5vw] bg-black border border-solid-[1px] border-[#404040] text-white flex flex-row">
                          <input onChange={(e) => updateSlippage(e.target.value)} id="slippageInput" className="appearance-none outline-none border-none bg-transparent w-full text-right text-white placeholder:text-[#404040]" placeholder="5"></input>
                          <span>%</span>
                          </span>
                        </span>

                        <span className="flex flex-row space-x-[.3vw] items-center  pt-[1vh]">
                          <p className="font-extralight text-left">Transaction Deadline</p>
                          <QuestionMarkCircleIcon width="1vw" />
                        </span>
                        <span className="flex flex-row items-center pb-[3%]">
                        <span onClick={(event)=> handleButtonClick(event, "")} className="rounded-full w-[30%] mt-[.5vh] py-[.2vh] px-[.5vw] bg-black border border-solid-[1px] border-[#404040] text-[#404040] flex flex-row">
                          <input onChange={(e) => updateDeadline(e.target.value)} id="transactionDeadline" className="appearance-none outline-none border-none bg-transparent w-full text-right text-white placeholder:text-[#404040]" placeholder="10"></input>
                          </span>
                          <span className="font-extralight pl-[.3vw]">minutes</span>
                          </span>
                      </div>
                    </span>
                  </>
                )}
              </span>
            </span>

            {network === "Wrong Network" ||
            network === "" ||
            Connection === false ? (
              <div className="h-[89.5vh] w-full flex flex-row justify-center items-center">
                {" "}
                <span className="flex flex-row justify-center items-center bg-[#00DAAC40] max-w-[30vw] h-[20vh] max-h-[20vh] rounded-lg p-[3%] text-[#00DAAC] font-bold">
                  {" "}
                  Please change to the Orbiter Dex Chain to continue.
                </span>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
