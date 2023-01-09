const mongoose = require('../db/conn')
const { Schema } = mongoose

const Pet = mongoose.model(
    'Pet',

    new Schema({
        name:{
            type: String,
            require: true
        },
        age:{
            type: Number,
            require: true
        },
        weight: {
            type: Number,
            require: true
        },
        color:{
            type: String,
            require: true
        },
        image:{
            type: Array, //permite a inserção de mais de 1 imagem
            require: true
        },
        available:{
            type: Boolean,
        },


        user: Object, //estaremos coletando algumas informações do usuário
        adopter: Object, // estaremos coletando algumas informações do adotador
        

    }, { timestamps: true } )
)

module.exports = Pet