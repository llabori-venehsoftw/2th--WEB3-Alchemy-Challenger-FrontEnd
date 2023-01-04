import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, { useState, useEffect } from 'react'
import { ethers } from "ethers";
import { abi } from '../utils/buyMeACoffee.json'

const Home: NextPage = () => {

  // deployed contract information
  // const contractAddress = "0x2B764c99C87328c971870780d3D2243CF844916f"
  const contractAddress = "0x2eE1DF352C85198c2F6859b74c8BA2c93B3b56f7"
  
  // state managment 
  const [currentAccount, setCurrentAccount] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [memos, setMemos] = useState([])
  const [owner,setOwner] = useState("")
  const [coffeeValue,setCoffeeValue] = useState("0.001")

  // on Change functions 
  const onNameChange = (event) => {
    setName(event.target.value)
  }
  const onMessageChange = (event) => {
    setMessage(event.target.value)
  }
  const onOwnerChange = (event) => {
    setOwner(event.target.value)
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log("check metamask installed")
        return
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })

      setCurrentAccount(accounts[0])

    } catch (error) {
      console.log(error)
    }
  }

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window

      const accounts = await ethereum.request({ method: "eth_accounts" })
      console.log(accounts)

      if (accounts.length > 0) {
        console.log("account connected", accounts[0])
      } else {
        console.log("no accounts on metamask")
      }

    } catch (error) {
      console.log(error)
    }
  }

  const buyCoffee = async (e) => {
    e.preventDefault()
    try {
      const { ethereum } = window

      const provider = await new ethers.providers.Web3Provider(ethereum)
      const signer = await provider.getSigner()
      const buyCoffeeContract = await new ethers.Contract(contractAddress, abi, signer)

      const buyCoffeeTxn = await buyCoffeeContract.buyCoffee(
        name ? name : "anon", message ? message : "Enjoy Your Coffe",
        { value: ethers.utils.parseEther(coffeeValue)})

      console.log("mining with value",coffeeValue)
      await buyCoffeeTxn.wait()
      console.log("transaction mined", buyCoffeeTxn.hash)

      console.log("coffee purchased!");

      setName("")
      setMessage("")

    } catch (error) {
      console.log(error)
    }
  }

  const changeOwner = async() => {
    try {
      // get metamask
      const {ethereum} = window

      // get metamask account with provider
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()

      // get deployed contract 
      const buyCoffeeContract = new ethers.Contract(contractAddress,abi,signer)

      // change owner with new address
      const changeOwnerTxn = await buyCoffeeContract.changeOwner(owner)
      await changeOwnerTxn.wait()
      console.log(changeOwnerTxn)
      
      setOwner("")
    
    } catch(error) {
      console.error(error)
    }
  }

  // get all memos to show on website 
  const getMemos = async () => {
    try {

      // get metamask
      const { ethereum } = window

      // connect to provider to get information from blockchain and metamask
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = await provider.getSigner()

      // create deployed contract object to use getMemos function
      const buyCoffeeContract = new ethers.Contract(contractAddress, abi, signer)

      // get memos from blockchain
      const getMemos = await buyCoffeeContract.getMemos()

      setMemos(getMemos)
    } catch (error) {
      console.log(error)
    }

  }

  useEffect(() => {
    isWalletConnected()
    getMemos()
    let buyCoffeeContract

    // update memos instantly when newMemo event received
    const onNewMemo = (from, timestamp, name, message) => {
      setMemos((prevState) => {
        return [
          ...prevState,
          {
            from,
            timestamp,
            name,
            message
          }
        ]
      })
    }


    // get metamask
    const { ethereum } = window

    if (ethereum) {

      // connect to provider to get information from blockchain and metamask
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()

      // create deployed contract object to use getMemos function
      buyCoffeeContract = new ethers.Contract(contractAddress, abi, signer)

      // on event newMemo make changes in frontend with function onNewMemo
      buyCoffeeContract.on("NewMemo", onNewMemo)

    }
    return () => {
      if (buyCoffeeContract) {
        buyCoffeeContract.off("NewMemo", onNewMemo)
      }
    }


  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Buy me a Coffe App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Buy Tornike a Coffee!
        </h1>

        {currentAccount ? (
          <div>
            <form>
              <div>
                <label>Name</label>
                <br />
                <input onChange={onNameChange} value={name} type="text" placeholder="anon" id="name"  required/>
              </div>
              <br />
              <div>
                <label>Send Tornike a message</label>
                <br />
                <textarea rows={3} onChange={onMessageChange} value={message} placeholder="Enjoy your coffee" id="message" required></textarea>
              </div>
              <div>
                <button className={styles.sendCoffeeBtn} onClick={buyCoffee}>Send 1 Coffee for 0.001ETH</button>
                <button className={styles.sendCoffeeBtn} style={{display:"block"}} onClick={(e) => {setCoffeeValue("0.003"); buyCoffee(e);}}>Send 1 Medium Coffee for 0.003ETH</button>
                <button className={styles.sendCoffeeBtn} onClick={(e) => {setCoffeeValue("0.005"); buyCoffee(e);}}>Send 1 Large Coffee for 0.005ETH</button>
              </div>
              
            </form>
            <div style={{margin:"0 auto",marginTop:"50px",position:"relative"}}>
              <label>New Owner Adddress: <input onChange={onOwnerChange} value={owner} style={{display: "block",marginBottom: "5px"}} type="text" required /></label>
              <button onClick={changeOwner} style={{marginLeft:"40px",marginRight:"40px"}}>Change Owner</button>  
            </div>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect your wallet</button>
        )}

      </main>


      {currentAccount && (<h1 className={styles.center}>Memos received</h1>)}
      {currentAccount && (
        memos.map((memo, idx) => {
          return (
            <div key={idx} className={styles.center} style={{ margin: "5px", borderRadius: "5px",border: "2px solid black",padding: "5px" }}>
              <p style={{fontWeight: "bold"}}>"{memo.message}"</p>
              <p>From : {memo.name} at {(new Date(memo.timestamp * 1000)).toString()}</p>
            </div>
          )
        })
      )}

      <footer className={styles.footer}>
        <a
          href="https://www.alchemy.com/?a=roadtoweb3weektwo"
          target="_blank"
          rel="noopener noreferrer"
        >
        Refactory by @llabori_Veneh for Alchemy's Road to Web3 lesson two!
        </a>
      </footer>
    </div>
  )
}

export default Home
