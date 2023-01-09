/* 
        pacotes instalados e seus usos

    bcrypt - Criptografa as senhar encaminhadas ao banco de dados
    cookie-parser
    cors - Possibilita encaminhar requisições para o seu proprio dominio - 
    express - Framework
    jsonwebtoken - comunicação com o token, metodo de autenticação
    mongoose
    multer - upload de fotos
    nodemon

        Pastas

    helpers - Pasta onde será encaminhados os arquivos de log de ajudas para o sistema
*/


const express = require('express')
const cors = require('cors')

const app = express()

//config JSON response - Como passaremos as requisições via JSON e não pela URL não necessitara configura-la
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//Solve CORS
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

//Public fooder for imagen
app.use(express.static('Public'))

//Routers
const UserRoutes = require('./routes/UserRoutes')
const PetRoutes = require('./routes/PetRoutes')

app.use('/users', UserRoutes)
app.use('/pets', PetRoutes)

app.listen(5000) //O fronte ficara em uma porta diferente ao back!