import './App.css'
import TypingAnimation from './components/typing-animation'
import ExcelReader from './pages/home'

function App() {
  return (
    <>
      <div className='header'>
        <TypingAnimation text='Welcome To Investment Journal Generator!!' />
        <br />
        <TypingAnimation text={`Say no to mundane work, when I'm here :) `} />
      </div>
      <ExcelReader />
      <div className='signature'>Created by: Swapnil ❤️</div>
    </>
  )
}

export default App
