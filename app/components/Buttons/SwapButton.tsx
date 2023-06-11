import { ethers } from "ethers";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState, useEffect } from "react";
import {useSwapStore} from "../../hooks/useStore"

export default function SwapButton({amount, zeroForOne, baseLimit}) {

  const [Limit] = useSwapStore((state: any) => [
    state.Limit
  ]);

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);

  // const { address } = useAccount()
  // const userAddress = address;

  // const { config } = usePrepareContractWrite({
  //     address: rangePoolAddress,
  //     abi: rangePoolABI,
  //     functionName: "swap",
  //     args:[
  //         userAddress,
  //         zeroForOne,
  //         amount,
  //         Limit === 0 ? baseLimit : Limit,
  //     ],
  //     chainId: 421613,
  //     overrides:{
  //       gasLimit: BigNumber.from("140000")
  //     },
  // })

  // const { data, write } = useContractWrite(config)

  // const {isLoading} = useWaitForTransaction({
  //   hash: data?.hash,
  //   onSuccess() {
  //     setSuccessDisplay(true);
  //   },
  //   onError() {
  //     setErrorDisplay(true);
  //   },
  // });
  
  return (
    <>
      <button className=" w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
          // onClick={() => address ?  write?.() : null}
            >
              Swap
      </button>
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
    {errorDisplay && (
      <ErrorToast
        // hash={data?.hash}
        hash={""}
        errorDisplay={errorDisplay}
        setErrorDisplay={setErrorDisplay}
      />
    )}
    {/* {isLoading ? <ConfirmingToast hash={data?.hash} /> : <></>} */}
    {successDisplay && (
      <SuccessToast
        // hash={data?.hash}
        hash={""}
        successDisplay={successDisplay}
        setSuccessDisplay={setSuccessDisplay}
      />
    )}
    </div>
    </>
  );
}
