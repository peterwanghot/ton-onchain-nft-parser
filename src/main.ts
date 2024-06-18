import './style.css';

import { Blockchain, RemoteBlockchainStorage } from '@ton-community/sandbox';
import { Address, Dictionary, TupleItemCell } from 'ton-core';
import { NFTDictValueSerializer } from './dict';
import { sha256 } from 'ton-crypto';
import { TonClient4 } from 'ton';

const app = document.querySelector<HTMLDivElement>('#app')!;
app!.innerHTML = `
<h1>TON On-chain NFT Parsing example</h1>
<div id="log">
</div>`;

const log = document.getElementById('log')!;

async function main() {
  const tonClient = new TonClient4({
    endpoint: 'https://mainnet-v4.tonhubapi.com',
  });
  const blockchain = await Blockchain.create({
    storage: new RemoteBlockchainStorage(
      tonClient,
      (
        await tonClient.getLastBlock()
      ).last.seqno
    ),
  });

  const mNftAddress = Address.parse(
    'EQDCTSWTSJGV0GPbhH7cmloSwSX3AYY0wpKzXKA1-l-fj5AH'
  );
  const mCollectionAddress = Address.parse(
    'EQAl_hUCAeEv-fKtGxYtITAS6PPxuMRaQwHj0QAHeWe6ZSD0'
  );

  const nftDataRes = await blockchain.runGetMethod(
    mNftAddress,
    'get_nft_data',
    []
  );
  const nftContentRes = await blockchain.runGetMethod(
    mCollectionAddress,
    'get_nft_content',
    [nftDataRes.stack[1], nftDataRes.stack[4]]
  );

  const dataCell = nftContentRes.stack[0] as TupleItemCell;

  const data = dataCell.cell.asSlice();
  const start = data.loadUint(8);
  if (start !== 0) {
    throw new Error('Unknown format');
  }

  const dict = data.loadDict(
    Dictionary.Keys.Buffer(32),
    NFTDictValueSerializer
  );

  const keys = ['image', 'name', 'description'];
  for (const key of keys) {
    const dictKey = await sha256(key);
    const dictValue = dict.get(dictKey);
    if (dictValue) {
      if (key === 'image') {
        const img = document.createElement('img');
        img.src = `${dictValue.content.toString('utf-8')}`;
        log.append(img);
      } else {
        const div = document.createElement('div');
        div.innerHTML = `<b>${key}</b>: ${dictValue.content.toString('utf-8')}`;
        log.append(div);
      }
    }
  }
  const div = document.createElement('div');
  div.innerHTML = `Gas User: ${nftContentRes.gasUsed}`;
  log.append(div);
}

main();
