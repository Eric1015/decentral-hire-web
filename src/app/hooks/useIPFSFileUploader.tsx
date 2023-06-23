import { create } from 'ipfs-http-client';

const useIPFSFileUploader = () => {
  const projectId = process.env.NEXT_PUBLIC_IPFS_INFURA_PROJECT_ID || '';
  const projectSecret =
    process.env.NEXT_PUBLIC_IPFS_INFURA_API_SECRET_KEY || '';
  if (!projectId || !projectSecret)
    throw new Error(
      'Missing projectId or projectSecret for Infura node to upload files to IPFS'
    );
  const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
  const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    apiPath: '/api/v0',
    headers: {
      authorization: auth,
    },
  });

  const uploadFile = async (file: File | Blob) => {
    return await client.add(file);
  };

  return { uploadFile };
};

export default useIPFSFileUploader;
