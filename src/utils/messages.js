const generateMessages = (username,text)=>{
    return {
        username,
        text: text,
        createdAt: new Date()
    }
}

const generatedLocationMessage = (username,coords)=>{
    return {
        username,
        url: `https://google.com/maps?q=${coords.latitude}${coords.longitude}`,
        createdAt: new Date()
    }
}
module.exports={
    generateMessages,
    generatedLocationMessage,
}