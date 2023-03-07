'use strict';

let alert = {
    success: '<div class="p-2 bg-indigo-800 items-center text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex" role="alert"><span class="flex rounded-full bg-indigo-500 uppercase px-2 py-1 text-xs font-bold mr-3">Success</span><span class="font-semibold mr-2 text-left flex-auto">Your Request has been accepted. Funds should arrive on your wallet soon. 🚀</span></div>',
    errorInvalid: '<div class="p-2 bg-red-800 items-center text-red-100 leading-none lg:rounded-full flex lg:inline-flex" role="alert"><span class="flex rounded-full bg-red-500 uppercase px-2 py-1 text-xs font-bold mr-3">Error</span><span class="font-semibold mr-2 text-left flex-auto">Please use a valid EVM Wallet Address. 🚫</span></div>',
    errorEnough: '<div class="p-2 bg-red-800 items-center text-red-100 leading-none lg:rounded-full flex lg:inline-flex" role="alert"><span class="flex rounded-full bg-red-500 uppercase px-2 py-1 text-xs font-bold mr-3">Error</span><span class="font-semibold mr-2 text-left flex-auto">You already seem to have enough funds. 🤑</span></div>',
    errorFail: '<div class="p-2 bg-red-800 items-center text-red-100 leading-none lg:rounded-full flex lg:inline-flex" role="alert"><span class="flex rounded-full bg-red-500 uppercase px-2 py-1 text-xs font-bold mr-3">Error</span><span class="font-semibold mr-2 text-left flex-auto">Faucet Failed! Please try again after sometime. 🚨</span></div>'
};
