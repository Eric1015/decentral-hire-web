import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { useEffect } from 'react';

const useLitFileProvider = () => {
  const encrypt = async (file: File, authorizedWalletAddress: string) => {
    const authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: 'ethereum',
    });
    // only allow the authorized wallet address to have access to the file contents
    const accessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '', // this is a way for the method to only return the address of the user, so that we can compare it with the authorized wallet address
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: authorizedWalletAddress,
        },
      },
    ];
    const ipfsCid = await LitJsSdk.encryptToIpfs({
      authSig,
      accessControlConditions,
      chain: 'ethereum',
      file,
      litNodeClient: window.litNodeClient,
      infuraId: process.env.NEXT_PUBLIC_IPFS_INFURA_PROJECT_ID || '',
      infuraSecretKey: process.env.NEXT_PUBLIC_IPFS_INFURA_API_SECRET_KEY || '',
    });
    return ipfsCid;
  };

  const decrypt = async (ipfsCid: string): Promise<File | undefined> => {
    try {
      const metadata = await (
        await fetch(`https://ipfs.io/ipfs/${ipfsCid}`)
      ).json();
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'ethereum',
      });
      const result = await LitJsSdk.decryptFromIpfs({
        authSig,
        ipfsCid,
        litNodeClient: window.litNodeClient,
      });
      return new File([Buffer.from(result)], metadata.name, {
        type: 'application/octet-stream',
      });
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  useEffect(() => {
    const setUp = async () => {
      const client = new LitJsSdk.LitNodeClient({
        alertWhenUnauthorized: true,
        litNetwork: 'serrano',
      });
      await client.connect();
      window.litNodeClient = client;
    };

    setUp();
  }, []);

  return { encrypt, decrypt };
};

export default useLitFileProvider;
