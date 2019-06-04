import { signReceiverAddress } from './utils'
const ethers = require('ethers')
const axios = require('axios')

export const claim = async ({
  jsonRpcUrl,
  host,
  weiAmount,
  tokenAddress,
  tokenAmount,
  expirationTime,
  version,
  linkKey,
  linkdropMasterAddress,
  linkdropSignerSignature,
  receiverAddress,
  isApprove
}) => {
  if (jsonRpcUrl === null || jsonRpcUrl === '') {
    throw new Error('Please provide json rpc url')
  }

  if (host === null || host === '') {
    throw new Error('Please provide host')
  }

  if (weiAmount === null || weiAmount === '') {
    throw new Error('Please provide amount of eth to claim')
  }

  if (tokenAddress === null || tokenAddress === '') {
    throw new Error('Please provide ERC20 token address')
  }

  if (tokenAmount === null || tokenAmount === '') {
    throw new Error('Please provide amount of tokens to claim')
  }

  if (expirationTime === null || expirationTime === '') {
    throw new Error('Please provide expiration time')
  }

  if (version === null || version === '') {
    throw new Error('Please provide contract version')
  }

  if (linkKey === null || linkKey === '') {
    throw new Error('Please provide link key')
  }

  if (linkdropMasterAddress === null || linkdropMasterAddress === '') {
    throw new Error('Please provide linkdropMaster address')
  }

  if (linkdropSignerSignature === null || linkdropSignerSignature === '') {
    throw new Error('Please provide linkdropMaster signature')
  }

  if (receiverAddress === null || receiverAddress === '') {
    throw new Error('Please provide receiver address')
  }

  if (isApprove) {
    if (String(isApprove) !== 'true' && String(isApprove) !== 'false') {
      throw new Error('Please provide valid isApprove argument')
    }
  }

  // Get provider
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl)

  // Get receiver signature
  const receiverSignature = await signReceiverAddress(linkKey, receiverAddress)

  // Get linkId from linkKey
  const linkId = new ethers.Wallet(linkKey, provider).address

  const claimParams = {
    weiAmount,
    tokenAddress,
    tokenAmount,
    expirationTime,
    version,
    linkId,
    linkdropMasterAddress,
    linkdropSignerSignature,
    receiverAddress,
    receiverSignature,
    isApprove
  }
  try {
    const response = await axios.post(
      `${host}/api/v1/linkdrops/claim`,
      claimParams
    )
    if (response.status !== 200) {
      console.error(`\n❌ Invalid response status ${response.status}`)
    } else {
      if (response.data.success === true) {
        console.log(
          '\n✅  Claim tx has been submitted. Please verify the claim status manually.'
        )
        const { success, txHash } = response.data
        console.log(`#️⃣  Tx Hash: ${txHash}`)
        return { success, txHash }
      } else {
        const { success, error } = response.data
        if (error.reason) {
          console.error(`🆘  Request failed with '${error.reason}'`)
        } else console.error(error)
        return { success, error }
      }
    }
  } catch (err) {
    console.error(err)
  }
}

export const claimERC721 = async ({
  jsonRpcUrl,
  host,
  weiAmount,
  nftAddress,
  tokenId,
  expirationTime,
  version,
  linkKey,
  linkdropMasterAddress,
  linkdropSignerSignature,
  receiverAddress,
  isApprove
}) => {
  if (jsonRpcUrl === null || jsonRpcUrl === '') {
    throw new Error('Please provide json rpc url')
  }

  if (host === null || host === '') {
    throw new Error('Please provide host')
  }

  if (weiAmount === null || weiAmount === '') {
    throw new Error('Please provide amount of eth to claim')
  }

  if (
    nftAddress === null ||
    nftAddress === '' ||
    nftAddress === ethers.constants.AddressZero
  ) {
    throw new Error('Please provide ERC721 token address')
  }

  if (tokenId === null || tokenId === '') {
    throw new Error('Please provide token id to claim')
  }

  if (expirationTime === null || expirationTime === '') {
    throw new Error('Please provide expiration time')
  }

  if (version === null || version === '') {
    throw new Error('Please provide contract version')
  }

  if (linkKey === null || linkKey === '') {
    throw new Error('Please provide link key')
  }

  if (linkdropMasterAddress === null || linkdropMasterAddress === '') {
    throw new Error('Please provide linkdropMaster address')
  }

  if (linkdropSignerSignature === null || linkdropSignerSignature === '') {
    throw new Error('Please provide linkdropMaster signature')
  }

  if (receiverAddress === null || receiverAddress === '') {
    throw new Error('Please provide receiver address')
  }

  if (isApprove) {
    if (String(isApprove) !== 'true' && String(isApprove) !== 'false') {
      throw new Error('Please provide valid isApprove argument')
    }
  }

  // Get provider
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl)

  // Get receiver signature
  const receiverSignature = await signReceiverAddress(linkKey, receiverAddress)

  // Get linkId from linkKey
  const linkId = new ethers.Wallet(linkKey, provider).address

  const claimParams = {
    weiAmount,
    nftAddress,
    tokenId,
    expirationTime,
    version,
    linkId,
    linkdropMasterAddress,
    linkdropSignerSignature,
    receiverAddress,
    receiverSignature,
    isApprove
  }
  try {
    const response = await axios.post(
      `${host}/api/v1/linkdrops/claim-erc721`,
      claimParams
    )
    if (response.status !== 200) {
      console.error(`\n❌ Invalid response status ${response.status}`)
    } else {
      if (response.data.success === true) {
        console.log(
          '\n✅  Claim tx has been submitted. Please verify the claim status manually.'
        )
        const { success, txHash } = response.data
        console.log(`#️⃣  Tx Hash: ${txHash}`)
        return { success, txHash }
      } else {
        const { success, error } = response.data
        if (error.reason) {
          console.error(`🆘  Request failed with '${error.reason}'`)
        } else console.error(error)
        return { success, error }
      }
    }
  } catch (err) {
    console.error(err)
  }
}
