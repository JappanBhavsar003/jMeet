const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    host: 'jmeet-peerjs.herokuapp.com',
    port: '443'
});
const peers = {};
const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video : true,
    audio: true
}).then(stream => {
    alert('Hurray! Personal room has created. Share this URL with friends to get them online :)');
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', userId => {
        console.log('user connected ', userId);
        connectToNewUser(userId, stream);
    })

    socket.on('user-disconnected', userId => {
        console.log('user disconnected', userId);
        if(peers[userId]) {
            peers[userId].close() 
        }
    })
})

myPeer.on('open', userId => {
    socket.emit('join-room', ROOM_ID, userId);
})

function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    })
    call.on('close', () => {
        video.remove();
    })

    peers[userId] = call;
}

function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    console.log('addVideoStream >> ');
    videoGrid.append(video);
}