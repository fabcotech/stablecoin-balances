Easy to use CLI to get all stable coin balances (Ethereum mainnet, BNB Chain, Polygon) of one or many addresses.

A JSON file `balances.json` is automatically populated so you can start working with it with any other program. You currently you need a free [Alchemy API key](https://docs.alchemy.com/docs/alchemy-quickstart-guide).

Balances output by the program :
- ETH
- USDT (Ethereum)
- USDC (Ethereum)
- agEur (Ethereum)
- Matic (Polygon)
- USDT (Polygon)
- USDC (Polygon)
- agEur (Polygon)
- BNB (BNB Chain)
- BUSD (BNB Chain)
- USDT (BNB Chain)
- USDC (BNB Chain)

![Example of the balances output](https://github.com/fabcotech/stablecoin-balances/raw/master/static/balances.png)

### How to use

**One address**

```
node index.js --alchemy-api-key abc --address 0xcdC74a1942FE68C1cA64Fa394132D7c11DC615Cb
```

**Many addresses**

Populate `addresses.txt` with a list of addresses.

```
node index.js --alchemy-api-key abc 
```