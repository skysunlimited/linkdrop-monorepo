import React from 'react'
import { Alert, Icons, Button } from 'linkdrop-ui-kit'
import { translate } from 'decorators'
import { shortenString } from 'helpers'
import text from 'texts'

import styles from './styles.module'
import commonStyles from '../styles.module'
@translate('pages.main')
class InitialPage extends React.Component {
  render () {
    const { onClick, amount, symbol, icon, wallet, loading } = this.props
    return <div className={commonStyles.container}>
      <Alert className={styles.tokenIcon} icon={icon ? <img className={styles.icon} src={icon} /> : <Icons.Star />} />
      <div className={styles.title}>
        <span>{amount}</span> {symbol}
      </div>
      <Button loading={loading} className={styles.button} onClick={_ => onClick && onClick()}>
        {text('common.buttons.claim')}
      </Button>
      {wallet && <div className={styles.wallet} dangerouslySetInnerHTML={{ __html: this.t('titles.claimTo', { wallet: shortenString({ wallet }) }) }} />}
    </div>
  }
}

export default InitialPage
