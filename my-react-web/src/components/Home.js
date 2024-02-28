
import React from 'react'
import "../css/home.css"
import ChatFrame from './chatFrame'
import ChatPanel from './chatPanel'
import Tools from './tools'


const Home = () => {
  return (
    <div className='container'>
        
       
        <Tools></Tools>
        <ChatPanel></ChatPanel>
        <ChatFrame></ChatFrame>
        
        
    </div>
  )
}

export default Home

