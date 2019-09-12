import React from 'react'
import i18next from 'i18next'
import { Route, Switch } from 'react-router-dom'
import { Claim, Widget, NotFound, Wallet, Confirm, Authorization, Send, Receive } from 'components/pages'
import './styles'
import { Loading } from '@linkdrop/ui-kit'
import { getHashVariables } from '@linkdrop/commons'

import { actions } from 'decorators'
@actions(({ user: { sdk, loading, privateKey, contractAddress, ens, loacale } }) => ({
  sdk,
  loading,
  privateKey,
  contractAddress,
  ens,
  loacale
}))
class AppRouter extends React.Component {
  componentWillReceiveProps ({ locale }) {
    const { locale: prevLocale } = this.props
    if (locale === prevLocale) { return }
    i18next.changeLanguage(locale)
  }

  componentDidMount () {
    const { sdk } = this.props
    if (!sdk) { 
      let {
        chainId
      } = getHashVariables()
      chainId = chainId || '1'
      this.actions().user.createSdk({ chainId })
    }
  }

  render () {
    const { sdk, privateKey, contractAddress, ens } = this.props
    if (!sdk) {
      return <Loading />
    }
    // sdk
    if (sdk && (!ens || !privateKey || !contractAddress)) {
      return <Authorization />
    }

    return <Switch>
      <Route path='/receive' component={Claim} />
      <Route path='/confirm' component={Confirm} />
      <Route path='/get' component={Receive} />
      <Route path='/send' component={Send} />
      <Route path='/' component={Wallet} />
      <Route path='*' component={NotFound} />
    </Switch>
  }
}

export default AppRouter
