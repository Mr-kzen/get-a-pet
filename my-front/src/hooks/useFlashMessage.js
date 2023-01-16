import bus from '../utils/bus' //responsavel pelos disparos de eventos dentro do sistema

export default function useFlashMessage(){
    function setFlashMessage(msg, type){

        bus.emit('flash', {
            message: msg,
            type: type,
        })

    }


    return { setFlashMessage }
}