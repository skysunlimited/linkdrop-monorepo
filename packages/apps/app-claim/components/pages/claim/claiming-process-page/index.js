import React from 'react'
import { translate, actions } from 'decorators'
import commonStyles from '../styles.module'
import { getHashVariables } from '@linkdrop/commons'
import { TokensAmount, AssetBalance, AccountBalance } from 'components/common'
import { getCurrentAsset } from 'helpers'

@actions(({ tokens: { transactionId, transactionStatus } }) => ({ transactionId, transactionStatus }))
@translate('pages.claim')
class ClaimingProcessPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true
    }
  }

  componentDidMount () {
    const {
      tokenAddress,
      tokenAmount,
      expirationTime,
      linkKey,
      linkdropMasterAddress,
      linkdropSignerSignature,
      nftAddress,
      tokenId,
      weiAmount,
      campaignId
    } = getHashVariables()
    const { wallet } = this.props

    return this.actions().tokens.claimTokensERC20({ campaignId, wallet, tokenAddress, tokenAmount, weiAmount, expirationTime, linkKey, linkdropMasterAddress, linkdropSignerSignature })
    // if (nftAddress && tokenId) {
    //   return this.actions().tokens.claimTokensERC721({ wallet, campaignId, nftAddress, tokenId, weiAmount, expirationTime, linkKey, linkdropSignerSignature })
    // }

    // this.actions().tokens.claimTokensERC20({ campaignId, wallet, tokenAddress, tokenAmount, weiAmount, expirationTime, linkKey, linkdropMasterAddress, linkdropSignerSignature })
  }

  componentWillReceiveProps ({ transactionId: id, transactionStatus: status }) {
    const { transactionId: prevId, transactionStatus: prevStatus } = this.props
    if (id != null && prevId === null) {
      const { chainId } = getHashVariables()
      this.statusCheck = window.setInterval(_ => this.actions().tokens.checkTransactionStatus({ transactionId: id, chainId, statusToAdd: 'claimed' }), 3000)
    }
    if (status != null && status === 'claimed' && prevStatus === null) {
      this.statusCheck && window.clearInterval(this.statusCheck)
      this.actions().tokens.setTransactionStatus({ transactionStatus: null })
      window.setTimeout(_ => {
        this.setState({
          loading: false
        }, _ => this.actions().assets.saveClaimedAssets())
      }, 3000)
    }
  }

  render () {
    const { itemsToClaim } = this.props
    const { loading } = this.state
    const mainAsset = getCurrentAsset({ itemsToClaim })
    if (!mainAsset) { return null }
    const finalPrice = itemsToClaim.reduce((sum, item) => {
      sum = sum + (Number(item.balanceFormatted) * Number(item.price))
      return sum
    }, 0)
    const { balanceFormatted, symbol } = mainAsset
    return <div className={commonStyles.container}>
      <AccountBalance balance={finalPrice} loading={loading} />
      <TokensAmount loading={loading} symbol={symbol} amount={balanceFormatted} />
      {itemsToClaim.map(({ icon, symbol, balanceFormatted, tokenAddress, price }) => <AssetBalance key={tokenAddress} loading={loading} symbol={symbol} amount={balanceFormatted} price={price} icon={icon} />)}
    </div>
  }
}

export default ClaimingProcessPage