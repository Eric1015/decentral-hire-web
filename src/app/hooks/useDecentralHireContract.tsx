import { Contract } from 'ethers';
import { useMemo } from 'react';
import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import ABI from '../abis/DecentralHire.json';

const address = process.env.NEXT_PUBLIC_DECENTRAL_HIRE_CONTRACT_ADDRESS || '';

const useDecentralHireContract = () => {
  const { state } = useWeb3Context() as IWeb3Context;

  return useMemo(
    () => state.signer && new Contract(address, ABI, state.signer),
    [state.signer]
  );
};

export default useDecentralHireContract;
