// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useEffect, useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import * as algokit from '@algorandfoundation/algokit-utils'
import algosdk from 'algosdk'
import MethodCall from './components/MethodCall'
import { AlgorackMarketClient, AlgorackMarketFactory } from './contracts/AlgorackMarket'
import * as methods from './methods'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'
import { AlgoRackClient } from './contracts/AlgoRack'


interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)


  const { activeAccount, activeAddress, transactionSigner: TransactionSigner } = useWallet()

  const [appId, setAppId] = useState<bigint>(BigInt(0))
  const [assetId, setAssetId] = useState<bigint>(0n)
  const [unitaryPrice, setUnitaryPrice] = useState<bigint>(0n)
  const [changeprice, setChangePrice] = useState<bigint>(0n)
  const [quantity, setQuantity] = useState<bigint>(0n)
  const [unitsleft, setUnitsLeft] = useState<bigint>(0n)
  const [seller, setSeller] = useState<string>("")
  const [assetname, setassetname] = useState<string>("")
  const [int_quantity, setInt_quanity] = useState<bigint>(0n)
  const [int_decimals, setInt_decimals] = useState<number>(0)
  const [hasAsset, sethasAsset] = useState<boolean>(false);
  const [isfractional, setIsFractional] = useState<boolean>(false);
  const [isNFT, setIsNFT] = useState<boolean>(false);
  const [assetUrl, setAssetUrl] = useState("");


  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

 const algodConfig = getAlgodConfigFromViteEnvironment()
 const algorand = algokit.AlgorandClient.fromConfig({ algodConfig })
 algorand.setDefaultSigner(TransactionSigner)

 const dmFactory = new AlgorackMarketFactory({
  algorand: algorand,
  defaultSender: activeAccount?.address,
  defaultSigner: TransactionSigner,
 })

 const dmClient = new AlgorackMarketClient({
  appId: BigInt(appId),
  algorand: algorand,
  defaultSigner: TransactionSigner,
 })

 const fetchstate = async () => {
  console.log('inside fetchstate')
  try {
    if (!activeAccount) throw new Error('Please connect wallet first')
    if (!appId) throw new Error('App ID is required')

    const dmClient = new AlgorackMarketClient({
      appId: BigInt(appId),
      algorand: algorand,
      defaultSigner: TransactionSigner,
    })

    console.log('state.assetid.value above')
    setAssetId(BigInt(0))

    const state = await dmClient.appClient.getGlobalState()


      setUnitaryPrice(BigInt(state.unitaryprice.value))

      console.log('state.assetid.value ', state.assetid.value)


      setAssetId(BigInt(state.assetid.value))

      const info = await algorand.asset.getAccountInformation(algosdk.getApplicationAddress(appId), BigInt(state.assetid.value))

      const asset_info = await algorand.asset.getById(BigInt(state.assetid.value))

      await algorand.client.algod
        .getApplicationByID(Number(appId))
        .do()
        .then((app) => {
          setSeller(app.params.creator.toString())
        })


      setUnitsLeft(info.balance)
      setassetname(asset_info.assetName || "")

    } catch (e) {
      console.log('inside catch')
      setUnitaryPrice(0n)
      // setAssetId(0n)
      // setUnitsLeft(0n)
      console.error(e)
    }
  }

  useEffect(() => {
    console.log('inside useeffect')

    fetchstate()
  }, [appId])



  return (
    <div className="hero min-h-screen bg-teal-400">
      <div className="hero-content text-center rounded-lg p-6 max-w-md bg-white mx-auto">
        <div className="max-w-md">
          <h1 className="text-4xl">
            Welcome to <div className="font-bold">AlgoKit 🙂</div>
          </h1>
          <p className="py-6">
            This starter has been generated using official AlgoKit React template. Refer to the resource below for next steps.
          </p>

          <div className="grid">
            <a
              data-test-id="getting-started"
              className="btn btn-primary m-2"
              target="_blank"
              href="https://github.com/algorandfoundation/algokit-cli"
            >
              Getting started
            </a>

            <div className="divider" />
            <button data-test-id="connect-wallet" className="btn m-2" onClick={toggleWalletModal}>
              Wallet Connection
            </button>
            {appId !== BigInt(0) && assetId !== BigInt(0) && unitsleft <= 0n && activeAddress !== seller && (
              <div>
                <div className="divider" />
                <p className="text-red-500">No units left</p>
              </div>
            )}

            {appId !== BigInt(0) && activeAddress === seller && (
              <MethodCall
                text="Delete App"
                methodFunction={methods.deleteApp(algorand, dmFactory, dmClient, assetId, activeAddress!, TransactionSigner, setAppId)}
              />
            )}
          </div>

          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
        </div>
      </div>
    </div>
  )
}

export default Home
