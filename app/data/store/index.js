import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import thunk from 'redux-thunk'
import { routerReducer } from 'react-router-redux'
import saga from './saga'

import { user, nftTokens, tokens } from './reducers'

const sagaMiddleware = createSagaMiddleware()
export default () => {
  const store = createStore(
    combineReducers({
      user,
      nftTokens,
      tokens,
      routing: routerReducer
    }),
    {},
    compose(
      applyMiddleware(thunk),
      applyMiddleware(sagaMiddleware)
    )
  )
  sagaMiddleware.run(saga)
  return store
}
