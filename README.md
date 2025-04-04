#  Hardhat NFT IPFS проект

Hardhat (твердая шляпа, каска) - фреймворк для компиляции, тестирования и деплоя смарт-контракта в локальной сети hardhat network. 

Для подсветки синтаксиса и удобной работы установите расширение [hardhat](https://hardhat.org/hardhat-vscode/docs/overview) для `VSCode`.  

Этот проект содержит инструкции для создания распределенного приложения на основе react и hardhat. 

Структура проекта включает в себя основные директории, которые мы создадим в ходе занятия: 
- `/app` - фронтенд приложения;
- `/contracts` - файлы с исходным кодом смарт-контракта;
- `/ignition/modules` - файлы для деплоя смарт-контракта;
- `/test` - файлы для тестирования смарт-контрактов.

## 1 Настройка проекта hardhat 

Откройте терминал и выполните инициализацию нового проекта node.js 

```sh
npm init

```
После этого установите библиотеку hardhat и инициализируйте проект `hardhat`

```sh
npm i hardhat 
npm i @nomicfoundation/hardhat-toolbox
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


## 2 Создание frontend 

Для работы понадобится nodejs не менее 20 версии, git и редактор VS Code. 

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


## 3 Написание и компиляция смарт-контрактов

Компания Open Zeppelin предоставляет исходные коды безопасных реализаций для многих стандартных спецификаций смарт-контрактов. 
Вам не нужно наступать на грабли и беспокоиться об уязвимостях, которые могут привести к потере средств. 
В Open Zeppelin действует программа bounty bug - за каждую найденную уязвимость выплачивается вознаграждение. 
Такой подход позволяет привлечь специалистов со всего света для аудита кода и сведения вероятности потери средств практически к нулю.   
В корневом каталоге проекта установите библиотеку с помощью команды:  

```sh
npm install @openzeppelin/contracts
```

После установки вы можете использовать контракты из библиотеки, импортировав их. 
За размещение (деплой) смарт-контракта и вызов его публичных методов необходимо уплатить комиссию. 
При размещении смарт-контракта в локальной тестовой сети эта комиссия ничего не стоит, не нужно использовать faucet. 
При размещении в сети `Ethereum sepolia` используется тестовая криптовалюта `ETH`.  
При размещении в сети `Ethereum mainnet` за каждую транзакцию нужно расплачиваться реальной криптовалютой `ETH`.  

ERC-721 - это стандарт для представления права собственности на невзаимозаменяемые токены (NFT), например недвижимость или предметы коллекционирования.

ERC-721 является более сложным стандартом, чем ERC-20, с множеством дополнительных расширений и разделен на несколько контрактов. Открытые контракты Zeppelin обеспечивают гибкость в отношении их сочетания, а также пользовательских полезных расширений.  

Рассмотрим пример, в котором ERC-721 используется для отслеживания игровых предметов со своими уникальными свойствами. Всякий раз, когда игрок получит какой-либо предмет, он будет отчеканен и отправлен ему. Игроки могут свободно хранить свои токены или обменивать их с другими людьми по своему усмотрению, как и с любым другим активом в блокчейне! Пожалуйста, обратите внимание, что любая учетная запись может использовать awardItem для чеканки предметов. Чтобы ограничить количество учетных записей, которые могут чеканить предметы, можно добавить [контроль доступа](https://docs.openzeppelin.com/contracts/5.x/access-control). 

В корне проекта создайте директорию `contracts/`, а в ней файл `GameItem.sol`. 
Наполните содержимое этого файла: 

```solidity
// contracts/GameItem.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

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

С исходным кодом смарт-контракта ERC721.sol можно ознакомиться на сайте [github](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol). 

Скомпилируйте контракт командой: 
```sh
npx hardhat compile
```
В консоли должно появиться сообщение об успешной компиляции: 
```sh
Compiled 1 Solidity file successfully (evm target: paris).
```
В корне проекта появится папка `cache`, а в папке `app/src/artifacts` - результаты компиляции. 

## 4 Использование IPFS для хранения информации об NFT

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

Затем импортируйте текстовый файл, содержащий описание NFT. 
Ссылка на этот текстовый файл пригодится нам для последующего тестирования смарт-контракта. 

## 5 Тестирование смарт-контрактов с Hardhat

Перед размещением контракта в тестовой сети полезно протестировать его инструментами hardhat. 
Проблема заключается в том, что взаимодействие с контрактом осуществляется через интерфейс сторонней библиотеки, например `ethers` или `web3`. 
В hardhat эта проблема решается с помощью собственной реализации интерфейса библиотеки `ethers`, которая эмулирует наличие тестовой сети.  

В корне проекта создайте папку `test`, а в ней файл `GameItem.js`. 
Наполните его содержимое: 

```js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token contract", function () {
  it("Should return name after deployment", async function () {
    const myNftContract = await ethers.deployContract("GameItem");
    const deployedName = await myNftContract.name();
    expect(deployedName).to.equal("GameItem");
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
    ✔ Should return name after deployment
```

Добавьте еще один тест для проверки получения токенов разными аккаунтами и выполните его: 
```js
  it("Should award an item to player", async function () {
    const [ player_0, player_1 ] = await ethers.getSigners();

    // Deploy the MyNFT contract
    const myNftContract = await ethers.deployContract("GameItem");

    // Award an item to the owner
    const tokenUri = "https://bafybeifdpy3ikwpysuu7gvur232wv2ttzff55warsbpqdqku5hzaejw3ym.ipfs.dweb.link?filename=thor_hammer.txt";
    const testUri = "Just a test";

    await myNftContract.awardItem(player_0.address, tokenUri);
    await myNftContract.awardItem(player_1.address, testUri);

    // Check ownership
    expect(await myNftContract.ownerOf(0)).to.equal(player_0.address);
    expect(await myNftContract.ownerOf(1)).to.equal(player_1.address);

    // The token URI should be the same as the one we set earlier   
    expect(await myNftContract.tokenURI(0)).to.equal(tokenUri);
    expect(await myNftContract.tokenURI(1)).to.equal(testUri);

  });
```

## 6 Настройка кошелька и Hardhat Network

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

Для совершения транзакций есть более удобные инструменты, например [geth](https://geth.ethereum.org/docs/interacting-with-geth/javascript-console) или та же библиотека [ethers](https://docs.ethers.org/v5/single-page/#/v6/api/providers/jsonrpc-provider/). 
Однако самым удобным для пользователей, пожалуй, является кошелек, который устанавливается как расширение браузера.  

Рекомендуем использовать [MetaMask](https://metamask.io/download/), т.к. он лучше всего подходит для [децентрализованных приложений](https://cryptowallet.com/academy/best-ethereum-wallets/). 

### 6.1 Настройка кошелька 

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

## 7 Размещение смарт-контракта в тестовой сети

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
    const player_0 = mbuilder.getAccount(0);     
    const erc721_smart_contract = mbuilder.contract("GameItem", [], {from: player_0});
    return { erc721_smart_contract };
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
TokenDeploy#Token - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Этот адрес понадобится для взаимодействия с размещенным экземпляром через пользовательский интерфейс.  
Владельцем смарт-контракта по умолчанию является нулевой аккаунт сети hardhat. 


## 7 Разработка UI

В папке app добавьте в зависимости `package.json` стабильную версию библиотеки ethers 6.13.5 
```js
  "dependencies": {
    ...
    "ethers": "^6.13.5"
    }
``` 

Установите зависимости.  
Откройте код приложения `src/App.js` и замените содержимое на следующий код. 

```js
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

const ABI = [
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function awardItem(address player, string memory tokenURI) public returns (uint256)",
];

function App() {
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contractAddress, setcontractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [tokenURI, setTokenURI] = useState('');
  const [tokenMetadata, setTokenMetadata] = useState('');
  const [owner, setOwner] = useState('');

  useEffect(() => {
    async function init() {
      let _provider, _signer;
      if (window.ethereum == null) {
        console.log("MetaMask not installed; using read-only defaults")
        _provider = ethers.getDefaultProvider();
      } else {
        _provider = new ethers.BrowserProvider(window.ethereum);
        _signer = await _provider.getSigner();
      }
      setProvider(_provider);
      setSigner(_signer);
    }
    init();
  }, []);

  async function awardNFT() {
    const contract = new ethers.Contract(contractAddress, ABI, signer);
    // get nft uri from backend
    const nftUri = "https://bafybeifdpy3ikwpysuu7gvur232wv2ttzff55warsbpqdqku5hzaejw3ym.ipfs.dweb.link?filename=thor_hammer.txt";
    setTokenURI(nftUri);
    try {
      const tx = await contract.awardItem(signer.getAddress(), tokenURI);
      await tx.wait();
      console.log("NFT awarded successfully:", tx);
      alert("NFT awarded successfully!");
    } catch (error) {
      console.error("Error awarding NFT:", error);
      alert("Failed to award NFT. Make sure the token ID is valid.");
    }
  }

  async function fetchNFT() {
    const contract = new ethers.Contract(contractAddress, ABI, provider);
    try {
      // Fetch tokenURI and owner address from the contract
      const uri = await contract.tokenURI(tokenId);
      const ownerAddress = await contract.ownerOf(tokenId);
      console.log("Token URI:", uri);
      console.log("Owner Address:", ownerAddress);
      // Fetch metadata from the tokenURI
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error("Failed to fetch metadata from tokenURI");
      }
      const metadata = await response.json();
      console.log("Metadata:", metadata);
      // Update state with metadata and owner
      setTokenURI(uri);
      setTokenMetadata(metadata); 
      setOwner(ownerAddress);
    } catch (error) {
      console.error("Error fetching NFT:", error);
      alert("Failed to fetch NFT. Make sure the token ID exists and the tokenURI is valid.");
      setTokenURI("");
      setTokenMetadata(""); 
      setOwner("");
    }
  }

  return (
    <div className="App">
      <label>
        Contract address:
        <input
          type="text"
          size="42"
          value={contractAddress}
          onChange={(e) => setcontractAddress(e.target.value)}
        />
      </label>

      <br /><button onClick={awardNFT}>Award NFT</button>
      <br /><h1>Retrieve NFT</h1>
      <br /><label>
        Token ID:
        <input
          type="text"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
      </label>
      <br /><button onClick={fetchNFT}>Fetch NFT</button>
      {tokenURI && (
        <div>
          <h2>NFT Details</h2>
          <img src={tokenMetadata.image} width={100}/>
          <p><strong>Name:</strong> {tokenMetadata.name}</p>
          <p><strong>Strength:</strong> {tokenMetadata.strength}</p>
          <p><strong>Owner:</strong> {owner}</p>
        </div>
      )}
    </div>
  );
}

export default App;
```

Запустите приложение и проверьте его работу. 
