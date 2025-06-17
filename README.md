#  Hardhat проект
Hardhat (твердая шляпа, каска) - фреймворк для компиляции, тестирования и деплоя смарт-контракта в локальной сети hardhat network. 
Этот проект содержит начальный код и инструкции для создания распределенного приложения на основе react и hardhat. 

Структура проекта включает в себя основные директории: 
- `/app` - фронтенд на `React`;
- `/contracts` - файлы с исходным кодом смарт-контрактов;
- `/test` - файлы для тестирования смарт-контрактов.

## 1 Настройка окружения 

Для работы понадобится nodejs 20 версии, git и редактор VS Code. 
Настоятельно рекомендуем работать в среде linux или macOS. 
Стабильность работы в среде WSL windows не гарантируется.  

Клонируйте репозиторий и установите зависимости для `hardhat`:
```sh
git clone https://github.com/labintsev/hardhat-tutorial
cd hardhat-tutorial
npm i
```

Создайте новое приложение с помощью `vite` 
```sh
npm create vite@latest app --template react
```

Установите зависимости, запустите приложение, проверьте его работу. 
```sh
cd app
npm i
npm run dev
```

После этого можно остановить приложение, нажав в терминале `CTRL-C`. 


## 2 Создание и настройка проекта hardhat
Откройте новый терминал и в корневой папке проекта выполните инициализацию с пустым файлом `hardhat.config.js`
Для этого выполните команду: 
```sh
npx hardhat init
```

С помощью стрелок выберите пункт `Create an empty hardhat.config.js` и нажмите ввод. 
В созданном файле `hardhat.config.js` добавьте следующие настройки: 
```js
require("@nomicfoundation/hardhat-toolbox");


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  paths: {
    artifacts: "./app/src/artifacts",
  }, 
};
```
Здесь мы определяем версию компилятора `solidity`, который используется для компиляции смарт-контрактов в этом проекте. 
Важно отметить, что hardhat использует реализацию `solcjs` независимо от системного `solc`. 

Переменная `  paths: { artifacts: "./app/src/artifacts",   },` отвечает за тот путь, в который будут размещаться результаты компиляции (артифакты) смарт-контрактов. 
Мы размещаем их в папке фронтенд приложения, т.к. деплой и обращение к публичным методам смарт-контракта будут проводиться из пользовательского интерфейса. 

## 3 Написание и компиляция смарт-контрактов
Напишем простой смарт-контракт, который выдает токены всем желающим. 
Здесь под токеном мы понимаем некоторую условную единицу, например виртуальную шоколадку в вендинговой машине. 
Сам токен ничего не стоит, однако необходимо уплатить комиссию за размещение (деплой) смарт-контракта и вызов его публичных методов. 
При размещении смарт-контракта в локальной или тестовой сети эта комиссия ничего не стоит. 
Однако при размещении в настоящей сети `Ethereum mainnet` за каждую транзакцию нужно расплачиваться реальной криптовалютой `ETH`.  

В корне проекта создайте директорию `contracts/`, а в ней файл `Token.sol`. 
Наполните содержимое этого файла: 
```js
//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;


// This is the main building block for smart contracts.
contract Token {
    // Some string type variables to identify the token.
    string public name = "My Hardhat Token";
    string public symbol = "MHT";

    // The fixed amount of tokens, stored in an unsigned integer type variable.
    uint256 public totalSupply = 1000000;

    // An address type variable is used to store ethereum accounts.
    address public owner;

    // A mapping is a key/value map. Here we store each account's balance.
    mapping(address => uint256) balances;

    // The Transfer event helps off-chain applications understand
    // what happens within your contract.
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /**
     * Contract initialization.
     */
    constructor() {
        // The totalSupply is assigned to the transaction sender, which is the
        // account that is deploying the contract.
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    /**
     * A function to transfer tokens.
     *
     * The `external` modifier makes a function *only* callable from *outside*
     * the contract.
     */
    function transfer(address to, uint256 amount) external {
        // Check if the transaction sender has enough tokens.
        // If `require`'s first argument evaluates to `false` then the
        // transaction will revert.
        require(balances[msg.sender] >= amount, "Not enough tokens");

        // Transfer the amount.
        balances[msg.sender] -= amount;
        balances[to] += amount;

        // Notify off-chain applications of the transfer.
        emit Transfer(msg.sender, to, amount);
    }

    /**
     * Read only function to retrieve the token balance of a given account.
     *
     * The `view` modifier indicates that it doesn't modify the contract's
     * state, which allows us to call it without executing a transaction.
     */
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}
```
Внимательно ознакомьтесь с содержимыми этого файла. 
Для подсветки синтаксиса и других полезностей установите расширение [hardhat](https://hardhat.org/hardhat-vscode/docs/overview) для `VSCode`.  

Скомпилируйте контракт командой: 
```sh
npx hardhat compile
```
В консоли должно появиться сообщение об успешной компиляции: 
```sh
Compiled 1 Solidity file successfully (evm target: paris).
```
В корне проекта появится папка `cache`, а в папке `app/src/artifacts` - результаты компиляции. 

## 4 Тестирование смарт-контрактов с Hardhat

Перед размещением контракта в тестовой сети полезно протестировать его инструментами hardhat. 
Проблема заключается в том, что взаимодействие с контрактом осуществляется через интерфейс сторонней библиотеки, например `ethers` или `web3`. 
В hardhat эта проблема решается с помощью собственной реализации интерфейса библиотеки `ethers`, которая эмулирует наличие тестовой сети.  

В корне проекта создайте папку `test`, а в ней файл `Token.js`. 
Наполните его содержимое: 

```js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();

    const hardhatToken = await ethers.deployContract("Token");

    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  });
});
``` 

Обратите внимание, что в зависимостях корневого проекта `package.json` нет библиотеки `ethers`, они импортируется из пакета `hardhat`. 
Метод `ethers.getSigners()` возвращает фиктивный аккаунт владельца, который затем используется для проверки деплоя и вызова публичного метода смарт-контракта.  

Запустите тест командой: 
```sh
npx hardhat test
```
В консоли должно появиться сообщение об успешном выполнении теста: 

```sh
  Token contract
    ✔ Deployment should assign the total supply of tokens to the owner
```

Добавьте еще один тест для проверки перемещения токенов между аккаунтами и выполните его: 
```js
describe("Token contract", function () {
  // ...previous test...

  it("Should transfer tokens between accounts", async function() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const hardhatToken = await ethers.deployContract("Token");

    // Transfer 50 tokens from owner to addr1
    await hardhatToken.transfer(addr1.address, 50);
    expect(await hardhatToken.balanceOf(addr1.address)).to.equal(50);

    // Transfer 50 tokens from addr1 to addr2
    await hardhatToken.connect(addr1).transfer(addr2.address, 50);
    expect(await hardhatToken.balanceOf(addr2.address)).to.equal(50);
  });
});
```

## 5 Настройка кошелька и Hardhat Network
Помимо заглушки библиотеки `ethers`, hardhat предоставляет более продвинутый инструмент тестирования. 
[Hardhat Network](https://hardhat.org/hardhat-network/docs/overview) - это эмулятор полноценного узла сети Ethereum, который запускается на локальной машине. 

Запустите эмулятор в отдельном терминале:
```sh
npx hardhat node
```
В консоли должно появиться сообщение о запуске JSON-RPC сервера и доступных аккаунтах: 
```sh
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```
Accounts
========

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Account #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906 (10000 ETH)
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

Account #4: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 (10000 ETH)
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a

Account #5: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc (10000 ETH)
Private Key: 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba

Account #6: 0x976EA74026E726554dB657fA54763abd0C3a0aa9 (10000 ETH)
Private Key: 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e

Account #7: 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955 (10000 ETH)
Private Key: 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356

Account #8: 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f (10000 ETH)
Private Key: 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97

Account #9: 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720 (10000 ETH)
Private Key: 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6

Account #10: 0xBcd4042DE499D14e55001CcbB24a551F3b954096 (10000 ETH)
Private Key: 0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897

Account #11: 0x71bE63f3384f5fb98995898A86B02Fb2426c5788 (10000 ETH)
Private Key: 0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82

Account #12: 0xFABB0ac9d68B0B445fB7357272Ff202C5651694a (10000 ETH)
Private Key: 0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1

Account #13: 0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec (10000 ETH)
Private Key: 0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd

Account #14: 0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097 (10000 ETH)
Private Key: 0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa

Account #15: 0xcd3B766CCDd6AE721141F452C550Ca635964ce71 (10000 ETH)
Private Key: 0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61

Account #16: 0x2546BcD3c84621e976D8185a91A922aE77ECEc30 (10000 ETH)
Private Key: 0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0

Account #17: 0xbDA5747bFD65F08deb54cb465eB87D40e51B197E (10000 ETH)
Private Key: 0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd

Account #18: 0xdD2FD4581271e230360230F9337D5c0430Bf44C0 (10000 ETH)
Private Key: 0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0

Account #19: 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199 (10000 ETH)
Private Key: 0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e

Для отправки запросов можно воспользоваться любым инструментом, например `curl`:  
```sh
curl --data '{"jsonrpc":"2.0","method":"eth_getBalance", "params": ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "latest"], "id":2}' -H "Content-Type: application/json" localhost:8545
```

На windows используйте curl.exe с явным преобразованием строки в json 
```sh
$body = '{"jsonrpc":"2.0","method":"eth_getBalance", "params": ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "latest"], "id":2}' | ConvertTo-Json 
# curl.exe -d $body localhost:8545
curl.exe -d $body 127.0.0.1:8545
```

Для совершения транзакций есть более удобные инструменты, например [geth](https://geth.ethereum.org/docs/interacting-with-geth/javascript-console) или та же библиотека [ethers](https://docs.ethers.org/v5/single-page/#/v5/api/providers/jsonrpc-provider/). 
Однако самым удобным для пользователей, пожалуй, является кошелек, который устанавливается как расширение браузера.  

Рекомендуем использовать [MetaMask](https://metamask.io/download/), т.к. он лучше всего подходит для [децентрализованных приложений](https://cryptowallet.com/academy/best-ethereum-wallets/). 

Настройка кошелька 
Создайте новую сеть вручную с параметрами 
```
Network name: hardhat
New RPC URL: http://127.0.0.1:8545/
Chain ID: 31337
Currency symbol: HETH
```

Импортируйте аккаунт с помощью приватного ключа из консоли, например '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' 

Переведите 10 HETH на другой аккаунт, например `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`. 
После этого добавьте второй аккаунт в кошелек с помощью команды `Add account > Import account` 
Введите приватный ключ и проверьте, что баланс увеличился.  

В консоли с запущенной сетью  `hardhat` будут выводиться сообщения, которые обрабатываются узлом. 
Транзакции могут не выполняться с ошибкой:  
```
Nonce too high. Expected nonce to be 0 but got 2. Note that transactions can't be queued when automining.
```
Это связано с тем, что в кеше кошелька хранится количество совершенных транзакций аккаунта. 
Сеть hardhat при каждом новом запуске создает новый блокчейн. 
Поэтому счетчики `nonce` для блокчейна и кошелька могут не совпадать. 
Это можно исправить, если в настройках кошелька очистить кеш: `Settings > Advanced > Clear activity tab data`. 

## 6 Размещение смарт-контракта в тестовой сети
Для размещения в смарт-контрактов в сети Ethereum мы будем использовать инструмент [Hardhat Ignition](https://hardhat.org/ignition/docs/getting-started). 
Это декларативная система, которая упрощает деплой смарт-контрактов не только в тестовой, но и в основной сети. 
Для описания порядка размещения смарт-контракта используются модули `Ignition Modules`. 
Это обычные js-файлы, в которых описывается логика деплоя смарт-контракта. 

Установите пакет Hardhat Ignition:
```sh
npm install --save-dev @nomicfoundation/hardhat-ignition-ethers
```

В файле конфигурации `hardhat.config.js` добавьте строку
```js
require("@nomicfoundation/hardhat-ignition-ethers");
```

Создайте папку `ingnition/modules`
```sh
mkdir ignition
mkdir ignition/modules
```

В папке `ingnition/modules` определите модуль деплоя `TokenDeploy.js`  
```js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenDeploy", (mbuilder) => {
    const account0 = mbuilder.getAccount(0);     // or account = "0x123..." 
    const erc20_smart_contract = mbuilder.contract("Token", [], {from: account0});
    return { erc20_smart_contract };
  });
```

Выполнените команду 
```sh
npx hardhat ignition deploy ignition/modules/TokenDeploy.js --network localhost
```

В консоли должно появиться сообщение с адресом размещенного смарт-контракта 
```
[ TokenDeploy ] successfully deployed 🚀
Deployed Addresses
TokenDeploy#Token - 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

TokenDeploy#TokenV2 - 0x5FbDB2315678afecb367f032d93F642f64180aa3


```

Этот адрес понадобится для покупки `MyHardhatToken` через пользовательский интерфейс.  
Владельцем смарт-контракта по умолчанию является нулевой аккаунт сети hardhat. 
Это свойство можно переопределить через вызов метода `getAccount` или задать адрес в виде строки. 


## 7 Разработка UI

Откройте код приложения `src/App.js` и замените содержимое на следующий код. 

```js
import { useState } from 'react'
import './App.css'

function App() {
  const [account, setAccount] = useState('')
  const [tokens, setTokens] = useState('no')

  return (
    <>
    <h1>Token vending machine</h1>
    <h3>Current account {account} has {tokens} Tokens</h3>
    </>
  )
}

export default App

```

В папке app добавьте в зависимости `package.json` стабильную версию библиотеки ethers 5.7.2 
```js
  "dependencies": {
    ...
    "ethers": "^5.7.2"
    }
``` 

Обновите зависимости, запустите приложение и проверьте его работу.  

Добавьте кнопку для обновления баланса токенов аккаунта
```js
    <button
        onClick={(e) => {
          e.preventDefault();
          updateAccount();
        }}
      >Update Balance
      </button>
```

Добавьте метод, который читает баланс токенов из смарт-контракта, размещенного в сети hardhat. 
```js

import { ethers } from 'ethers';
const provider = new ethers.providers.Web3Provider(window.ethereum);
const ABI = [
  // ERC20 Standart Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",

  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

// This can be an address or an ENS name
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  async function updateAccount() {
    const accounts = await provider.send('eth_requestAccounts', []);
    console.log("Available accounts: ", accounts);
    const account = accounts[0];
    setAccount(account);
    
    const signer = provider.getSigner();
    setSigner(signer);
    console.log("Signer: ", signer);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    console.log("Contract: ", contract);
    setContract(contract);

    if (contract){
      const tokens = await contract.balanceOf(account);
      console.log("Tokens: ", tokens);
      setTokens(tokens.toString());
    }
  }   
```

Переключите кошелек на другой аккаунт и проверьте баланс токенов. 
Верните обратно аккаунт владельца смарт-контракта и снова обновите баланс.  


Добавьте поле ввода и кнопку для передачи токенов другому аккаунту. 

```js
<div>
<label>Send to: 
    <input type="text" id="address"/>
</label>

<label>Amount:
    <input type="text" id="amount"/>
</label>

<button
    onClick={(e) => {
    e.preventDefault();
    transferToken();
    }}
    > Transfer
</button>

</div>
```

Добавьте стили в `App.css` 
```css
label {
  display: flex;
  flex-direction: column;
  text-transform: uppercase;
  color: #aaa;
  margin: 20px;
}

input[type="text"] {
  padding: 6px;
  font-size: 18px;
}
```

Добавьте функцию обработки транзакции 
```js
  async function transferToken(){
    const address = document.getElementById("address").value;
    const amount  = document.getElementById("amount").value;
    console.log("Signer: ", signer);
    console.log("Contract: ", contract);

    const trx = await contract.connect(signer).transfer(address, amount);
    console.log("Transaction: ", trx);
    await trx.wait();
    updateAccount();
  }
```
