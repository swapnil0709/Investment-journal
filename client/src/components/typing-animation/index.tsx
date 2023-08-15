import React, { useState, useEffect } from 'react'
import './TypingAnimation.css' // Import your CSS file

interface TypingAnimationProps {
  text: string
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ text }) => {
  const [displayText, setDisplayText] = useState<string>('')

  useEffect(() => {
    let currentIndex = 0

    const typingInterval = setInterval(() => {
      setDisplayText(text.substring(0, currentIndex))
      currentIndex = (currentIndex + 1) % (text.length + 1)
    }, 150) // Adjust typing speed as needed

    return () => clearInterval(typingInterval)
  }, [text])

  return (
    <div className='typing-container'>
      <div className='typing-text'>
        {displayText}
        <span className='cursor'>|</span>
      </div>
    </div>
  )
}

export default TypingAnimation
