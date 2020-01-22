
import {
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom'

import 'semantic-ui-css/semantic.min.css'
import 'tachyons/css/tachyons.min.css'

import { Container } from 'semantic-ui-react'
import { Head } from './components/Head'
import { ProvideHolochain } from 'react-holochain-hook'
import React from 'react'
import { ScreensEdit } from './screens/edit_quill'
import { ScreensIndex } from './screens/index'

function App() {
  return (
    <div className='App'>
      <ProvideHolochain>
        <Router>
          <Head />
          <Container style={styles.container}>
            <Switch>
              <Route path='/:textAddress' component={ScreensEdit} />
              <Route path='/' component={ScreensIndex} />
            </Switch>
          </Container>
        </Router>
      </ProvideHolochain>
    </div>
  )
}

const styles = {
  container: {
    margin: 20,
    marginTop: 70
  }
}
export default App
