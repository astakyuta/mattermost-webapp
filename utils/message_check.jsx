export function messageCheck(data) {
    console.log('send post message');
    setTimeout(function(){
        window.postMessage('this is a test message', '*');
    }, 5000);

    console.log('post message sent');
}
