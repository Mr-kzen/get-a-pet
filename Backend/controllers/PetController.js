const Pet = require('../models/Pet')

// helpeers
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const ObjectId = require('mongoose').Types.ObjectId


module.exports = class PetController{
    static async create(req, res){
        
        const {name, age, weight, color} = req.body

        const available = true

        const images = req.files

        if(!name){
            res.status(422).json({ message: "O nome é obrigatorio!"})
        }

        if(!age){
            res.status(422).json({ message: "O idade é obrigatorio!"})
        }

        if(!weight){
            res.status(422).json({ message: "O peso é obrigatorio!"})
        }

        if(!color){
            res.status(422).json({ message: "A cor é obrigatorio!"})
        }
        
        if(images.length === 0){
            res.status(422).json({ message: "A imagem é obrigatorio!"})
        }

        //dono do pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        //adicionando pet no banco de dados

        const pet = new Pet({
            name,
            age,
            weight,
            color,
            available,
            images: [],
            user: {
                _id : new ObjectId(user.id),
                name: user.name,
                image: user.image,
                phone: user.phone,
            }
        })

        // images.map((image) => {
        //     pet.images.push(image.filename)
        // })

        try{
            const newPet = await pet.save()
            res.status(201).json({ message: 'Pet cadastrado com sucesso!', newPet,})
        }
        catch (error){
            res.status(500).json({ message: error})
        }
    }

    static async getAll(req, res){
        const pets = await Pet.find().sort('-createdAt')

        res.status(200).json({
            pets: pets,
        })
    }

    static async getAllUserPets(req, res){
        
        //pegando usuário pelo token

        const token = getToken(req)
        const user = await getUserByToken(token)

        console.log(user._id)

        const pets = await Pet.find({'user._id': user._id}).sort('-createdAt')

        console.log('Pet -  ' + pets)
        res.status(200).json({
            pets,
        })
    }

    static async getAllUserAdoptions(req, res){
                
        //pegando usuário pelo token

        const token = getToken(req)
        
        const user = await getUserByToken(token)

        const pets = await Pet.find({'adopter._id': user._id}).sort('-createdAt')
        

        res.status(200).json({
            pets,
        })
    }

    static async getPetById(req, res){

        const id = req.params.id

        if(!ObjectId.isValid(id)){
            res.status(422).json({ message: 'ID invalido!'})
            return
        }

        //checando se o pet existe pelo id

        const pet = await Pet.findOne({ _id: id})

        if(!pet){
            res.status(404).json({ message: 'Pet não encontrado!'})
            return
        }

        res.status(200).json({pet: pet,})

    }

    static async removePetById(req, res){
        const id = req.params.id

        // checando de o id é valido
        if(!ObjectId.isValid(id)){
            res.status(422).json({ message: 'ID invalido!'})
            return
        }

        // chekando se o pet existe pelo id
        const pet = await Pet.findOne({ _id: id})

        if(!pet){
            res.status(404).json({ message: 'Pet não encontrado!'})
            return
        }

        // checando se usuário é o registror do pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()){
        res.status(422).json({ message: 'Houve um problema em processar a sua solicitação, tente novamento mais tarde!'})
            return
        }


        await Pet.findByIdAndRemove(id)
        res.status(200).json({ message: 'Pet removido com sucesso!'})
            

    }

    static async upDatePet(req, res){
        const id = req.params.id

        const {name, age, weight, color, available} = req.body

        const images = req.files

        const updatedData = {}

        // checando de o id é valido
        if(!ObjectId.isValid(id)){
            res.status(422).json({ message: 'ID invalido!'})
            return
        }

        //checando se o pet existe pelo id

        const pet = await Pet.findOne({ _id: id})

        if(!pet){
            res.status(404).json({ message: 'Pet não encontrado!'})
            return
        }



        // checando se usuário é o registror do pet

        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()){
        res.status(422).json({ message: 'Houve um problema em processar a sua solicitação, tente novamento mais tarde!'})
            return
        }


        //verificando informações do pet
        if(!name){
            res.status(422).json({ message: "O nome é obrigatorio!"})
        }else{
            updatedData.name = name
        }

        if(!age){
            res.status(422).json({ message: "A idade é obrigatorio!"})
        }else{
            updatedData.age = name
        }

        if(!weight){
            res.status(422).json({ message: "O peso é obrigatorio!"})
        }else{
            updatedData.weight = name
        }

        if(!color){
            res.status(422).json({ message: "A cor é obrigatorio!"})
        }else{
            updatedData.color = name
        }
        
        if(images.length === 0){
            res.status(422).json({ message: "A imagem é obrigatorio!"})
        }else{
            updatedData.images = []
            images.map((image) => {
                updatedData.images.push(image.filename)
            })
        }

        await Pet.findByIdAndUpdate(id, updatedData)

        res.status(200).json({ message: "Pet atualizado com sucesso!"})

    }

    static async schedule(req, res){

        //pegando o id do pet
        const id = req.params.id

        //checando se o pet existe pelo id
        const pet = await Pet.findOne({ _id: id})

        if(!pet){
            res.status(404).json({ message: 'Pet não encontrado!'})
            return
        }

        //checando se o usuario registrou o pet, não se pode marcar visita para o proprio pet!
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.equals(user.id)){
        res.status(422).json({ message: 'Você não pode agendar uma visita para o seu proprio pet!'})
            return
        }

        // checando se o usuário já tem uma visita agendada
        if(pet.adopter){
            if(pet.adopter._id.equals(user.id)){
                res.status(422).json({ message: 'Você já agendou uma visita para este pet!'})
            return
            }
        }

        //adicionando usuario para o pet
        pet.adopter = {
            _id: ObjectId(user._id),
            name: user.name,
            image: user.image
        }

        await Pet.findByIdAndUpdate(id, pet)

        res.status(200).json({
            message: `A visita foi agendada com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}`
        })


    }

    static async concludeAdopter(req, res){
        const id = req.params.id

         //checando se o pet existe pelo id
         const pet = await Pet.findOne({ _id: id})

         if(!pet){
             res.status(404).json({ message: 'Pet não encontrado!'})
             return
         }

        // checando se usuário é o registror do pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()){
        res.status(422).json({ message: 'Houve um problema em processar a sua solicitação, tente novamento mais tarde!'})
            return
        }

         pet.available = false

         await Pet.findByIdAndUpdate(id, pet)

         res.status(200).json({
            message: 'Parabens o ciclo de adoção foi finalizado com sucesso!'
         })
    }
}