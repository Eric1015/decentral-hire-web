import { Contract } from 'ethers';
import { useMemo } from 'react';
import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import ABI from '../abis/JobApplication.json';

const useJobApplicationContract = (address: string) => {
  const { state } = useWeb3Context() as IWeb3Context;

  return useMemo(
    () => state.signer && new Contract(address, ABI, state.signer),
    [state.signer, address]
  );
};

export default useJobApplicationContract;
