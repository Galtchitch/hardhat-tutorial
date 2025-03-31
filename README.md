#  Hardhat проект
Hardhat (твердая шляпа, каска) - фреймворк для компиляции, тестирования и деплоя смарт-контракта в локальной сети hardhat network. 
Этот проект содержит начальный код и инструкции для создания распределенного приложения на основе react и hardhat. 

Структура проекта включает в себя основные директории: 
- `/app` - фронтенд на `React`;
- `/contracts` - файлы с исходным кодом смарт-контрактов;
- `/test` - файлы для тестирования смарт-контрактов.

## 1 Настройка окружения 

Для работы понадобится nodejs не менее 20 версии, git и редактор VS Code. 

Клонируйте репозиторий и установите зависимости для `hardhat`:
```sh
git clone https://github.com/labintsev/hardhat-tutorial
cd hardhat-tutorial
npm i
```

Создайте новое приложение с помощью `vite` 
```sh
npm create vite@latest
```

Введите имя приложения app и выберите в меню React и JavaScript. 


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
  solidity: "0.8.28",
  paths: {
    artifacts: "./app/src/artifacts",
  }, 
};
```

Здесь мы определяем версию компилятора `solidity`, который используется для компиляции смарт-контрактов в этом проекте. 
Важно отметить, что hardhat использует реализацию компилятора `solcjs`, написанного на JavaScritp. 
Этот компилятор работает независимо от системного `solc` и можно иметь несколько версий для сравнения генерируемого кода. 

Переменная `  paths: { artifacts: "./app/src/artifacts",   },` отвечает за тот путь, в который будут размещаться результаты компиляции (артифакты) смарт-контрактов. 
Мы размещаем их в папке фронтенд приложения, т.к. деплой и обращение к публичным методам смарт-контракта будут проводиться из пользовательского интерфейса. 

## 3 Написание и компиляция смарт-контрактов

Компания Open Zeppelin предоставляет исходные коды безопасных реализаций для многих стандартных спецификаций смарт-контрактов. 
Вам не нужно наступать на грабли и беспокоиться об уязвимостях, которые могут привести к потере средств. 
В Open Zeppelin действует программа bounty bug - за каждую найденную уязвимость выплачивается вознаграждение. 
Такой подход позволяет привлечь специалистов со всего света для аудита кода и сведения вероятности потери средств практически к нулю.   
Установите библиотеку с помощью команды:  

```sh
npm install @openzeppelin/contracts
```

После установки вы можете использовать контракты из библиотеки, импортировав их. 
За размещение (деплой) смарт-контракта и вызов его публичных методов необходимо уплатить комиссию. 
При размещении смарт-контракта в локальной тестовой сети эта комиссия ничего не стоит, не нужно использовать faucet. 
При размещении в сети `Ethereum sepolia` используется тестовая криптовалюта `ETH`.  
При размещении в сети `Ethereum mainnet` за каждую транзакцию нужно расплачиваться реальной криптовалютой `ETH`.  

ERC-721 - это стандарт для представления права собственности на невзаимозаменяемые токены, например недвижимость или предметы коллекционирования.

ERC-721 является более сложным стандартом, чем ERC-20, с множеством дополнительных расширений и разделен на несколько контрактов. Открытые контракты Zeppelin обеспечивают гибкость в отношении их сочетания, а также пользовательских полезных расширений.  

Рассмотрим пример, в котором ERC-721 используется для отслеживания игровых предметов со своими уникальными свойствами. Всякий раз, когда игрок получит какой-либо предмет, он будет отчеканен и отправлен ему. Игроки могут свободно хранить свои токены или обменивать их с другими людьми по своему усмотрению, как и с любым другим активом в блокчейне! Пожалуйста, обратите внимание, что любая учетная запись может использовать awardItem для чеканки предметов. Чтобы ограничить количество учетных записей, которые могут чеканить предметы, можно добавить [контроль доступа](https://docs.openzeppelin.com/contracts/5.x/access-control). 

В корне проекта создайте директорию `contracts/`, а в ней файл `GameItem.sol`. 
Наполните содержимое этого файла: 

```solidity
// contracts/GameItem.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract GameItem is ERC721URIStorage {
    uint256 private _nextTokenId;

    constructor() ERC721("GameItem", "ITM") {}

    function awardItem(address player, string memory tokenURI) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(player, tokenId);
        _setTokenURI(tokenId, tokenURI);

        return tokenId;
    }
}
```

С исходным кодом смарт-контракта ERC720.sol можно ознакомиться на сайте [github](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol). 
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

## 3.1 Использование IPFS для хранения информации об NFT
Скачайте IPFS Desktop App с официальной [страницы](https://github.com/ipfs/ipfs-desktop/releases). 
Создайте два файла:
1) Изображение NFT
2) Описание в текстовом формате, например:
```
{
    "name": "Thor's hammer",
    "description": "Mjölnir, the legendary hammer of the Norse god of thunder.",
    "image": "https://bafybeibren22musqfs36r2gg4pz6i3b5hvqdsa7w3ot5w2s27jduriiyxe.ipfs.dweb.link?filename=tor_hammer.png",
    "strength": 20
}
``` 
Импортируйте сначала изображение с помощью кнопки + Импорт: 

![img](/img/1.jpg)

Скопируйте ссылку на изображение и вставьте ее в поле "image" вашего текстового файла: 

![img](/img/2.jpg)

Затем импортируйте текстовый файл. 
Его ссылка пригодится для тестирования смарт-контракта. 

## 4 Тестирование смарт-контрактов с Hardhat

Перед размещением контракта в тестовой сети полезно протестировать его инструментами hardhat. 
Проблема заключается в том, что взаимодействие с контрактом осуществляется через интерфейс сторонней библиотеки, например `ethers` или `web3`. 
В hardhat эта проблема решается с помощью собственной реализации интерфейса библиотеки `ethers`, которая эмулирует наличие тестовой сети.  

В корне проекта создайте папку `test`, а в ней файл `GameItem.js`. 
Наполните его содержимое: 

```js
const { expect } = require("chai");

describe("Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();

    const hardhatToken = await ethers.deployContract("MyNFT");

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

Для отправки запросов можно воспользоваться любым инструментом, например `curl`:  
```sh
curl --data '{"jsonrpc":"2.0","method":"eth_getBalance", "params": ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "latest"], "id":2}' -H "Content-Type: application/json" localhost:8545
```

На windows используйте curl.exe с явным преобразованием строки в json 
```sh
$body = '{"jsonrpc":"2.0","method":"eth_getBalance", "params": ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "latest"], "id":2}' | ConvertTo-Json 
curl.exe -d $body localhost:8545
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
