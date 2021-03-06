import React from 'react'
import { Alert, Icons, Button, RetinaImage, Loading } from '@linkdrop/ui-kit'
import { translate } from 'decorators'
import classNames from 'classnames'
import { getImages, capitalize } from 'helpers'
import connectors from 'components/application/connectors'
import styles from './styles.module'
import commonStyles from '../styles.module'
import { getHashVariables } from '@linkdrop/commons'

@translate('pages.needWallet')
class NeewWallet extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false
    }
  }

  render () {
    const { context } = this.props
    const { loading } = this.state
    const { w = 'trust', chainId } = getHashVariables()
    return <div className={commonStyles.container}>
      {loading && <Loading withOverlay />}
      <Alert className={styles.alert} icon={<Icons.Exclamation />} />
      <div className={styles.title} dangerouslySetInnerHTML={{ __html: this.t('titles.main') }} />
      <div className={styles.content}>
        {Number(chainId) !== 100 && this.renderButton({ connector: 'fortmatic', context })}
        {this.renderButton({ connector: 'portis', context })}
        {this.renderButton({ connector: 'walletconnect', context })}
        {this.renderButton({ connector: 'metamask', context })}
        <div className={styles.instructions}>
          <div dangerouslySetInnerHTML={{ __html: this.t('texts._1') }} />
          <div dangerouslySetInnerHTML={{ __html: this.t('texts._2') }} />
        </div>
      </div>
    </div>
  }

  renderButton ({ connector, context }) {
    return <Button
      inverted
      className={classNames(styles.button, styles.buttonIconed)}
      onClick={_ => {
        this.setState({
          loading: true
        }, _ => {
          context.activate(connectors[capitalize({ string: connector })])
        })
      }}
    >
      <RetinaImage width={20} {...getImages({ src: `${connector}-icon` })} />
      <div className={styles.buttonTitle}>{this.t(`buttons.${connector}`)}</div>
    </Button>
  }
}

export default NeewWallet
