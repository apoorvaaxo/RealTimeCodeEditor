import React, { useEffect, useRef, useState } from 'react';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import ACTIONS from '../Actions';
import toast from 'react-hot-toast';
import OutputWindow from '../components/OutputWindow';

const EditorPage = () => {
    const socketRef = useRef(null);
    const editorRef = useRef(null); // Define editorRef
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");

    
    useEffect(() => {
        const init = async () => {
            try {
                socketRef.current = await initSocket();
                socketRef.current.on('connect_error', handleErrors);
                socketRef.current.on('connect_failed', handleErrors);

                function handleErrors(e) {
                    console.log('Socket error', e);
                    toast.error('Socket connection failed, try again later.');
                    reactNavigator('/');
                }

                // Emit join event with room ID and username
                socketRef.current.emit(ACTIONS.JOIN, {
                    roomId,
                    username: location.state?.username,
                });

                // Listening for joined event
                socketRef.current.on(ACTIONS.JOINED, ({ clients, username }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                });

                // Listening for disconnected event
                socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => prev.filter(client => client.socketId !== socketId));
                });

                // Listening for CODE_CHANGE event
                socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                    if (code !== null && editorRef.current) {
                        editorRef.current.setValue(code); // Update editor with received code
                    }
                });
            } catch (error) {
                console.error('Failed to initialize socket:', error);
            }
        };

        init();

        // Cleanup function
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);
                socketRef.current.off(ACTIONS.CODE_CHANGE); // Cleanup listener
            }
        };
    }, [location.state?.username, reactNavigator, roomId]);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID copied successfully!');
        } catch (err) {
            toast.error('Could not copy Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    // Function to handle code execution
    const executeCode = async () => {
        try {
            // API request to backend to execute code
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });
            const data = await response.json();
            if (response.ok) {
                setOutput(data.output); // Update output state
            } else {
                setOutput(data.error || 'Error executing code');
            }
        } catch (error) {
            console.error('Error during code execution:', error);
            setOutput('Error connecting to the server.');
        }
    };


    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className='mainWrap'>
            <div className='aside'>
                <div className='asideInner'>
                    <div className='logo'>
                        <img className="logoImage" src="/CoDevIconForm.png" alt="" />
                    </div>
                    <h3>Connected</h3>
                    <div className='clientList'>
                        {clients.map((client) => (
                            <Client key={client.socketId} username={client.username} />
                        ))}
                    </div>
                </div>
                <button className='btn copyBtn' onClick={copyRoomId}>Copy ROOM ID</button><br />
                <button className='btn leaveBtn' onClick={leaveRoom}>Leave</button>
            </div>
            <div className='editorWrap'>
                <Editor socketRef={socketRef} roomId={roomId} editorRef={editorRef} />
            </div>
            <div className="outputWindowWrap">
                <OutputWindow output={output} setOutput={setOutput} executeCode={executeCode} />
            </div>
        </div>
    );
};

export default EditorPage;
