"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useContracts, useStore } from "./useStore";

export default function Home() {
  const [isInput, setIsInput] = useState(false);
  const [updateFactory, updateRouter, updateWrappedAddress] = useContracts(
    (state: any) => [
      state.updateFactoryContract,
      state.updateRouterAddress,
      state.updateWrappedAddress,
    ]
  );

  async function save() {
    try {
      
    const factory = document.getElementById(
      "factoryAddress"
    ) as HTMLInputElement;
    const router = document.getElementById("routerAddress") as HTMLInputElement;
    const wrapped = document.getElementById(
      "wrappedAddress"
    ) as HTMLInputElement;

    await updateFactory(factory.value);
    await updateRouter(router.value);
    await updateWrappedAddress(wrapped.value);

    setIsInput(true);
  } catch (error) {
      console.log(error)
  }

  }
  return (
    <>
      {isInput ? (
        <main className="absolute flex flex-row justify-center items-center h-[90vh] w-[90vw] text-white text-[15rem]">
          Bolt Swap
        </main>
      ) : (
        <span className="absolute left-0 top-0 flex flex-row justify-center items-center h-[100vh] w-[100vw] bg-black bg-opacity-75 z-10">
          <div className="z-20 rounded-md bg-white flex flex-col p-10">
            <input
              className="border rounded-md border-solid-[1px] border-black p-2"
              type="text"
              id="factoryAddress"
              placeholder="Factory Address"
            />
            <input
              className="border rounded-md border-solid-[1px] border-black p-2 mt-3"
              type="text"
              id="routerAddress"
              placeholder="Router Address"
            />
            <input
              className="border rounded-md border-solid-[1px] border-black p-2 mt-3"
              type="text"
              id="wrappedAddress"
              placeholder="Wrapped Address"
            />
            <button
              className="mt-6 bg-green-900 text-white rounded-md py-2"
              onClick={() => save()}
            >
              Save
            </button>
          </div>
        </span>
      )}
    </>
  );
}
