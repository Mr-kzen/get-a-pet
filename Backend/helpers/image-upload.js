const multer = require("multer");
const path = require("path");


//Destination to store the images
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      let folder = "";
  
      console.log(req)
  
      if (req.baseUrl.includes('users')) {
        folder = "users";
      } else if (req.baseUrl.includes('pets')) {
        folder = "pets";
      }
      cb(null, `public/image/${folder}/`);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + String(Math.floor(Math.random() * 10)) + path.extname(file.originalname));
    },
  });


const imageUpload = multer({
    storage: imageStorage,
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(png|jpg)$/)){
            return cb(new Eror("Por favor, envie apenas arquivos jpg ou png!"))
        }
        cb(undefined, true)
    },
})


module.exports = {imageUpload}