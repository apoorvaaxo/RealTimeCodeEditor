import React, { useState } from 'react'
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {


  //creating states
  const navigate=useNavigate('');
  const [roomId , setRoomId]=useState('');
  const [username , setUsername]=useState('');

  const createNewRoom=(e)=>{
    e.preventDefault();
    const id=uuidV4();
    setRoomId(id);
    toast.success('New room created successfully!');
  

  };

  const joinRoom=()=>
  {
    if(!roomId || !username)
    {
      toast.error('RoomID and Username required!');
      return;
    }
    //redirect to editor page
    navigate(`/editor/${roomId}` , {
      state:{
        username, //accessing username from homepage to editor page
      },
    })
  };

  const handleInputEnter=(e)=>
  {
    console.log('event' , e.code);
    if(e.code=='Enter')
    {
      joinRoom();
    }
  }

  return (
    
    <div className='homePageWrapper'>
      <div className='formWrapper'>
        <img src="/CoDevIconForm.png" className='homePageLogo' alt="CoDev Logo"   />
        <h2 className='mainLabel'>Paste Invitation Room ID</h2>
        <div className='inputGroup'>
          <input type="text" className="inputBox" placeholder='Enter Room ID' onChange={(e)=>setRoomId(e.target.value)} value={roomId} onKeyUp={handleInputEnter}/><br />
          <input type="text" className="inputBox" placeholder='Username' onChange={(e)=>setUsername(e.target.value)} value={username} onKeyUp={handleInputEnter}/><br />
          <button className='btn joinBtn' onClick={joinRoom}>Join Now</button>
          <span className='createInfo'>
            If you don't have an invite then create &nbsp;
            <a onClick={createNewRoom}href="" className='createNewBtn'>new room</a>
          </span>
        </div>
      </div>

    <footer>
      <h4>Empowering developers to code together in real-time, anywhere.</h4>
    </footer>
    </div>   
   
  )
}

export default Home
