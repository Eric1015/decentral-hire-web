import { useState, useCallback, useEffect } from 'react';
import { create } from 'ipfs-http-client';

const useIPFSFileUploader = () => {
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_IPFS_INFURA_PROJECT_ID || '';
    const projectSecret =
      process.env.NEXT_PUBLIC_IPFS_INFURA_API_SECRET_KEY || '';
    if (!projectId || !projectSecret)
      throw new Error(
        'Missing projectId or projectSecret for Infura node to upload files to IPFS'
      );
    const auth =
      'Basic ' +
      Buffer.from(projectId + ':' + projectSecret).toString('base64');
    const client = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      apiPath: '/api/v0',
      headers: {
        authorization: auth,
      },
    });
    setClient(client);
  }, []);

  const uploadFile = useCallback(
    async (file: File | Blob) => {
      if (!client) {
        return;
      }
      return await client.add(file);
    },
    [client]
  );

  const getFile = useCallback(
    async (cid: string) => {
      if (!client) {
        return;
      }
      return await client.get(cid);
    },
    [client]
  );

  const getFileContent = useCallback(
    async (cid: string) => {
      if (!client) {
        return;
      }
      const chunks = [];
      for await (const chunk of client.cat(cid)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks).toString();
    },
    [client]
  );

  const getFileUrl = useCallback((cid: string) => {
    return `https://ipfs.io/ipfs/${cid}`;
  }, []);

  return { uploadFile, getFile, getFileUrl, getFileContent };
};

export default useIPFSFileUploader;
