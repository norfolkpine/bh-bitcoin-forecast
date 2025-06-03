export const getEtherscanUrl = (hash: string, type: 'tx' | 'address' | 'token') => {
  const baseUrl = "https://etherscan.io";
  return type === 'tx' 
    ? `${baseUrl}/tx/${hash}` 
    : type === 'token'
    ? `${baseUrl}/token/${hash}`
    : `${baseUrl}/address/${hash}`;
};

export const openEtherscan = (hash: string, type: 'tx' | 'address' | 'token') => {
  const url = getEtherscanUrl(hash, type);
  window.open(url, '_blank');
};
