const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')



module.exports = class UserController{

    static async register(req, res){
        const {name, email, phone, password, confirmpassword} = req.body

        //validações
        if(!name){
            res.status(422).json({ message: 'O campo nome tem que ser preenchido!' })
            
            return
        }

        if(!email){
            res.status(422).json({ message: 'O campo email tem que ser preenchido!' })

            return
        }

        if(!phone){
            res.status(422).json({ message: 'O campo telefone tem que ser preenchido!' })

            return
        }

        if(!password){
            res.status(422).json({ message: 'A campo senha tem que ser preenchido!' })

            return
        }

        if(!confirmpassword){
            res.status(422).json({ message: 'O campo confirmação de senha tem que ser preenchido!' })

            return
        }


        //checando se os campos de senha são iguais
        if(password !== confirmpassword){
            res.status(422).json({ message: 'A senha e a confirmação da senha tem que ser iguais!' })

            return
        }

        //checando se o usuário existe
        const userExiste = await User.findOne({ email: email })

        if(userExiste){
            res.status(422).json({ message: 'E-mail já cadastrado!' })

            return
        }

        //criptografando a senha

        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        //criando o usuário
        const user = new User({
            name,
            email,
            phone,
            password: passwordHash
        })

        try {
            const newUser = await user.save()

            await createUserToken(newUser, req, res)

        } catch (error) {

            res.status(500).json({ message: error & 'Erro server'})

        }
    }

















    static async login(req, res){
        const {email, password} = req.body
        
        //validações
        if(!email){
            res.status(422).json({ message: 'O campo email tem que ser preenchido!' })

            return
        }

        if(!password){
            res.status(422).json({ message: 'A campo senha tem que ser preenchido!' })

            return
        }

        //checando se o usuário existe
        const user = await User.findOne({ email: email })

        if(!user){
            res.status(422).json({
                message: 'Não existe usuário cadastrado com esse e-mail!'
            })

            return
        }


        // checando se a senha está correta
        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword){
            res.status(422).json({
                message: 'Senha invalida!'
            })

            return
        }

        await createUserToken(user, req, res)
    }
















    static async checkUser(req, res){
        let currentUser

        if(req.headers.authorization){

            const token = getToken(req)
            const decoded = jwt.verify(token, 'nossosecret')

            currentUser = await User.findById(decoded.id)
            currentUser.password = undefined


        }else{
            currentUser = null
        }

        res.status(200).send(currentUser)
    }












    static async getUserById(req, res){

        const id = req.params.id

        const user = await User.findById(id).select('-password')

        if(!user){
            res.status(422).json({ 
                message: 'Usuário nao encontrado!' })

            return
        }

        res.status(200).json({ user })
    }








    static async editUser(req, res){

        
        //check if user exists
        const token = getToken(req)
        const user = await getUserByToken(token)
        
        const { name, email, phone, password, confirmpassword } = req.body
        let image = ''

        if(req.file){
            user.image = req.file.filename
        }


        //validações
        if(!name){
            res.status(422).json({ message: 'O campo nome tem que ser preenchido!' })

            return
        }

        if(!email){
            res.status(422).json({ message: 'O campo email tem que ser preenchido!' })

            return
        }

        if(!phone){
            res.status(422).json({ message: 'O campo telefone tem que ser preenchido!' })

            return
        }

        if(!user){ 
            res.status(422).json({ 
                message: 'Usuário nao encontrado!' })

            return
        }

        //checando se o email já existe!
        const userExiste = await User.findOne({email: email})
        if(user.email !== email && userExiste){
            res.status(422).json({ message: 'E-mail já cadastrado'})
        }
        
        
        
        if(password !== confirmpassword){
            res.status(422).json({ message: 'As senhas não conferem!' })
            return
            
        }else if(password == confirmpassword && password != null){
            // atualizando password
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)
            
            user.password = passwordHash
        }
        
        user.name = name
        user.phone = phone
        
        try {
            //returnando user update date

            await User.findOneAndUpdate(
                {_id: user._id},
                {$set: user},
                {new: true}
            )

            res.status(200).json({message: 'Usuário atualizado com sucesso!'})
        } catch (error) {
            res.status(500).json({ message: error })
            return
        }



        
    }
}