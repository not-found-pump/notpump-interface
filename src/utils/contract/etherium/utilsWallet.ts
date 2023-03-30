import Web3 from 'web3';
import usdtABI from './usdtABI.json'
import nftABI from './nftABI.json'
import ToastContext from 'contexts/toastContext';
import { useContext } from 'react';
import { toast } from 'react-hot-toast';



export const utilsEthereumWallet = {
  // walletAirDrop: async (connection: Web3, publicKey: string) => {

  //   return {
  //     status: 69, 
  //     text: "dm",
  //   };
  // },
  // walletGetNativeTokenBalance: async (connection: Web3, publicKey: string) => { 
  //   const num = 69;
  //   return num;
  // },
  walletGetInfor: async (connection: Web3, publicKey: string) => {
    // Connection control
    connection.eth.net.getNetworkType().then((network) => {
      console.log(network);
      if (network === "main") {
        toast.error("Please change wallet network chain to testnet");
      }
    });


    // BALANCE
    // get eth balance 
    publicKey = "0xa6D4462A24D0CAC66bf6cb679Efe3b90CF741f75"; // must del, just for test
    const ethBalance = await connection.eth.getBalance(publicKey);
    const ethBalanceInEther = connection.utils.fromWei(ethBalance, 'ether');

    //get usdt balance
    const usdtContractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // mainnet
    //const usdtContractAddress = "0xe583769738b6dd4E7CAF8451050d1948BE717679"; // testnet goerli

    const usdtContractABI = usdtABI;
    connection.setProvider(connection.currentProvider);
    const usdtContract = new connection.eth.Contract(usdtContractABI as any, usdtContractAddress);
    const decimals = 6;
    const balanceRaw = await usdtContract.methods.balanceOf(publicKey).call();
    const balance = balanceRaw / 10 ** decimals;
    console.log(balanceRaw);


    // NFT
    //publicKey = "0x2F62CEACb04eAbF8Fc53C195C5916DDDfa4BED02"; // must del, just for test
    const contractAddress = '0x1dfe7Ca09e99d10835Bf73044a23B73Fc20623DF'; //  NFT contract
    const contract = new connection.eth.Contract(nftABI as any, contractAddress);
    const numNFTs = await contract.methods.balanceOf(publicKey).call();
    console.log(numNFTs);
    // TODO

    const walletNFTs: {
      tokenId: string;
      collectionId: string;
      owner: string;
      metadata: object;
    }[] = [];

    for (let i = 0; i < parseInt(numNFTs); i++) {
      const tokenId = await contract.methods.tokenOfOwnerByIndex(publicKey, i).call();
      const tokenURI = await contract.methods.tokenURI(tokenId).call();
      const metadataResponse = await fetch(tokenURI);
      const metadataJSON = await metadataResponse.json();
      const collectionId = metadataJSON.collection;
      const owner = await contract.methods.ownerOf(tokenId).call();
      console.log(metadataJSON);

      walletNFTs.push({
        tokenId,
        collectionId,
        owner,
        metadata: metadataJSON
      });
    }

    console.log(walletNFTs);

    const walletTokens: {
      address: string;
      value: Number;
      key: string;
    }[] = [
        {
          address: "",
          value: Number(ethBalanceInEther), //ethBalanceInEther
          key: "ETH",
        },
        {
          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          value: balance, // balance
          key: "USDT",
        }
      ];

    return {
      tokens: walletTokens,
      nfts: walletNFTs,
    };
  },
  // walletTransaction: async (connection: Web3, publicKey: string, _amount, _to) => { 
  //   return "as";
  // }
}
