const fs = require("fs");
const Web3 = require("web3");

const getProcessArgv = (param) => {
  const index = process.argv.findIndex((arg) => arg === param);
  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const balances = JSON.parse(fs.readFileSync('./balances.json', 'utf8'));

let alchemyApiKey = '';
if (getProcessArgv("--alchemy-api-key")) {
  alchemyApiKey = getProcessArgv("--alchemy-api-key");
}
if (!alchemyApiKey) {
  console.error('Need --alchemy-api-key');
  process.exit(1);
}

const web3Ethereum = new Web3(
  new Web3.providers.HttpProvider(`https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`)
);

const web3BSC = new Web3("https://bsc-dataseed1.defibit.io/");

const web3Polygon = new Web3("https://polygon-rpc.com");

// Ethereum mainnet
const USDT_TOKEN_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDC_TOKEN_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const AGEUR_TOKEN_ADDRESS = "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8";

// BNB Chain https://bscscan.com/tokens
const BUSD_TOKEN_ADDRESS = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
const USDC_TOKEN_ADDRESS_ON_BSC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const USDT_TOKEN_ADDRESS_ON_BSC = "0x55d398326f99059ff775485246999027b3197955";

// Polygon https://polygonscan.com/tokens
const USDC_TOKEN_ADDRESS_ON_POLYGON = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const USDT_TOKEN_ADDRESS_ON_POLYGON = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const AGEUR_TOKEN_ADDRESS_ON_POLYGON = "0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4";

let addresses = [];
if (getProcessArgv("--address")) {
  addresses = [getProcessArgv("--address")]
}

let logs = '';

const print = async (ethAddress) => {
  logs += "ETH address          : " + ethAddress + "\n";
  let minABI = [
    {
      "constant":false,
      "inputs":[
        {"internalType":"address","name":"recipient","type":"address"},
        {"internalType":"uint256","name":"amount","type":"uint256"}
      ],
      "name":"transfer",
      "outputs":[{"internalType":"bool","name":"","type":"bool"}],
      "payable":false,
      "stateMutability":"nonpayable",
      "type":"function"
    },
    {
      "constant":true,
      "inputs":[{"internalType":"address","name":"account","type":"address"}],
      "name":"balanceOf",
      "outputs":[
        {"internalType":"uint256","name":"","type":"uint256"}
      ],
      "payable":false,
      "stateMutability":"view",
      "type":"function"
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [{ name: "", type: "uint8" }],
      type: "function",
    },
  ];

  const usdtContract = new web3Ethereum.eth.Contract(
    minABI,
    USDT_TOKEN_ADDRESS
  );
  const usdcContract = new web3Ethereum.eth.Contract(
    minABI,
    USDC_TOKEN_ADDRESS
  );
  const ageurContract = new web3Ethereum.eth.Contract(
    minABI,
    AGEUR_TOKEN_ADDRESS
  );

  const bscBUSDContract = new web3BSC.eth.Contract(minABI, BUSD_TOKEN_ADDRESS);
  const bscUSDTContract = new web3BSC.eth.Contract(minABI, USDT_TOKEN_ADDRESS_ON_BSC);
  const bscUSDCContract = new web3BSC.eth.Contract(minABI, USDC_TOKEN_ADDRESS_ON_BSC);

  const polygonUSDTContract = new web3Polygon.eth.Contract(minABI, USDT_TOKEN_ADDRESS_ON_POLYGON);
  const polygonUSDCContract = new web3Polygon.eth.Contract(minABI, USDC_TOKEN_ADDRESS_ON_POLYGON);
  const polygonAGEURContract = new web3Polygon.eth.Contract(minABI, AGEUR_TOKEN_ADDRESS_ON_POLYGON);

  if (!balances[ethAddress]) balances[ethAddress] = {};

  let eth;
  try {
    eth = await web3Ethereum.eth.getBalance(ethAddress)
  } catch (err) {
    console.log('Failed to get ETH balance')
    throw err;
  }

  logs += "ETH  (Ethereum)      : " + eth / 10 ** 18 + "\n";
  balances[ethAddress]['eth'] = eth / 10 ** 18;

  let usdtEthereum;
  try {
    usdtEthereum = await usdtContract.methods
    .balanceOf(ethAddress)
    .call()
  } catch (err) {
    console.log('Failed to get USDT Ethereum balance')
    throw err;
  }

  logs += "USDT (Ethereum)      : " + usdtEthereum / 10 ** 6 + "\n";
  balances[ethAddress]['usdt-eth'] = usdtEthereum / 10 ** 6;

  let usdcEthereum;
  try {
    usdcEthereum = await usdcContract.methods
    .balanceOf(ethAddress)
    .call();
  } catch (err) {
    console.log('Failed to get USDC Ethereum balance')
    throw err;
  }

  logs += "USDC (Ethereum)      : " + usdcEthereum / 10 ** 6 + "\n";
  balances[ethAddress]['usdc-eth'] = usdcEthereum / 10 ** 6;

  let agEurEthereum;
  try {
    agEurEthereum = await ageurContract.methods
    .balanceOf(ethAddress)
    .call();
  } catch (err) {
    console.log('Failed to get agEur Ethereum balance')
    throw err;
  }

  logs += "agEur (Ethereum)     : " + agEurEthereum / 10 ** 18 + "\n";
  balances[ethAddress]['ageur-eth'] = agEurEthereum / 10 ** 18;

  let matic;
  try {
    matic = await web3Polygon.eth.getBalance(ethAddress)
  } catch (err) {
    console.log('Failed to get BNB balance')
    throw err;
  }

  logs += "MATIC (Polygon)      : " + matic / 10 ** 18 + "\n";
  balances[ethAddress]['matic'] = matic / 10 ** 18;

  let usdtPolygon;
  try {
    usdtPolygon = await polygonUSDTContract.methods
    .balanceOf(ethAddress)
    .call()
  } catch (err) {
    console.log('Failed to get USDT (Polygon) balance')
    throw err;
  }

  logs += "USDT  (Polygon)      : " + usdtPolygon / 10 ** 6 + "\n";
  balances[ethAddress]['usdt-polygon'] = usdtPolygon / 10 ** 6;

  let usdcPolygon;
  try {
    usdcPolygon = await polygonUSDCContract.methods
    .balanceOf(ethAddress)
    .call()
  } catch (err) {
    console.log('Failed to get USDC (Polygon) balance')
    throw err;
  }

  logs += "USDC  (Polygon)      : " + usdcPolygon / 10 ** 6 + "\n";
  balances[ethAddress]['usdc-polygon'] = usdcPolygon / 10 ** 6;

  let agEurPolygon;
  try {
    agEurPolygon = await polygonAGEURContract.methods
    .balanceOf(ethAddress)
    .call()
  } catch (err) {
    console.log('Failed to get agEur (Polygon) balance')
    throw err;
  }

  logs += "agEur (Polygon)      : " + agEurPolygon / 10 ** 18 + "\n";
  balances[ethAddress]['ageur-polygon'] = agEurPolygon / 10 ** 18;

  let bnb;
  try {
    bnb = await web3BSC.eth.getBalance(ethAddress)
  } catch (err) {
    console.log('Failed to get BNB balance')
    throw err;
  }

  logs += "BNB  (BNB Chain)     : " + bnb / 10 ** 18 + "\n";
  balances[ethAddress]['bnb'] = bnb / 10 ** 18;

  let busdBSC;
  try {
    busdBSC = await bscBUSDContract.methods
    .balanceOf(ethAddress)
    .call()
  } catch (err) {
    console.log('Failed to get BUSD (BNB Chain) balance')
    throw err;
  }

  logs += "BUSD (BNB Chain)     : " + busdBSC / 10 ** 18 + "\n";
  balances[ethAddress]['busd-bnbchain'] = busdBSC / 10 ** 18;

  let usdtBSC;
  try {
    usdtBSC = await bscUSDTContract.methods
    .balanceOf(ethAddress)
    .call()
  } catch (err) {
    console.log('Failed to get USDT (BNB Chain) balance')
    throw err;
  }

  logs += "USDT (BNB Chain)     : " + usdtBSC / 10 ** 18 + "\n";
  balances[ethAddress]['usdt-bnbchain'] = usdtBSC / 10 ** 18;

  let usdcBSC;
  try {
    usdcBSC = await bscUSDCContract.methods
    .balanceOf(ethAddress)
    .call()
  } catch (err) {
    console.log('Failed to get USDC (BNB Chain) balance')
    throw err;
  }

  logs += "USDC (BNB Chain)     : " + usdcBSC / 10 ** 18 + "\n";
  balances[ethAddress]['usdc-bnbchain'] = usdcBSC / 10 ** 18;

  logs += "=============" + "\n";
  await new Promise(resolve => {
    setInterval(resolve, 50)
  })
  return logs;
};

if (!addresses.length) {
  try {
    const fileContent = fs.readFileSync('./addresses.txt', 'utf8');
    addresses = fileContent.split('\n').filter(a => !!a);
  } catch (e) {
    console.log(e);
    console.error('Unable to read addresses.txt');
    process.exit(1);
  }

}

const func = async (i) => {
  const logs = await print(addresses[i]);
  if (logs) console.log(logs);
  if (i === addresses.length - 1) {
    fs.writeFileSync(
      './balances.json',
      JSON.stringify(balances, null, 1),
      'utf8'
    )
    process.exit();
  } else {
    func(i + 1);
  }
};

func(0);
