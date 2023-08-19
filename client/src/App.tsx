import './App.css'
import TypingAnimation from './components/typing-animation'
import Home from './pages/home'

function App() {
  return (
    <div className='container'>
      <div className='header center-item text-center'>
        <h1 className='title'>Welcome To Investment Journal Generator!!</h1>
        <TypingAnimation text={`Say no to mundane work, when I'm here :) `} />
      </div>
      <div className='content center-item'>
        <Home />
      </div>
      <div className='footer logo center-item'>
        <div className='signature'>Created with ❤️ by: Swapnil </div>
      </div>
    </div>
  )
}

export default App
