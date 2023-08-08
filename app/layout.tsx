"use client";

import Link from "next/link";
import "./globals.css";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  Cog8ToothIcon,
  QuestionMarkCircleIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "./useStore";

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
  const hasConnected =
    localStorage.getItem("hasConnected") === null
      ? false
      : Boolean(localStorage.getItem("hasConnected"));
  const [wallet, setWallet] = useState<
    undefined | { address: string; nativeBalance: string }
  >(undefined);
  const [network, setNetwork] = useState("");
  const [networkId, setNetworkId] = useState(0);
  const [settingsOpened, setSettingsOpened] = useState(false);
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
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== 808080) {
          setNetwork("Wrong Network");
        } else {
          setNetwork("Orbiter");
          updateNetwork("Orbiter");
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
    } catch (error) {
      console.log(error);
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

  useEffect(() => {
    console.log(Connection)
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
