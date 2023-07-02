# DecentralHire Web

This is the UI for the DecentralHire dApp application [here](https://github.com/Eric1015/DecentralHire)


### Getting Started

Create an account at Infura: [website link](https://www.infura.io/) and obtain the project id and API secret key for IPFS from it. (You will need it later when filling in the `.env.local` file)

```shell
# copy the .env.example to .env.local for actual usage
cp .env.example .env.local

# create the file to store your firebase config downloaded from firebase console
touch public/firebase.config.ts

# install required packages
npm install

# start the dev server
npm run dev
```
