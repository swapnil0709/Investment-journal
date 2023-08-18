import './App.css'
import TypingAnimation from './components/typing-animation'
import Home from './pages/home'

function App() {
  return (
    <>
      <h1 className='title'>Welcome To Investment Journal Generator!!</h1>
      <div className='header'>
        <TypingAnimation text={`Say no to mundane work, when I'm here :) `} />
      </div>
      <Home />
      <div className='signature'>Created with ❤️ by: Swapnil </div>
    </>
  )
}

export default App
