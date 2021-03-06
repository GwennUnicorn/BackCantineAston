const mongoose = require('mongoose')
const _ = require('lodash')
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const {ObjectID} = require('mongodb')

var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 1,
        trim: true,
    },
    firstname: {
        type: String,
        required: true,
        minLength: 1,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'Email invalide'

        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,

    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }],
    admin: {
        type: Boolean,
        default: false,
    },
    orderKeys: {
        type: [String]
    },
    solde: {
        type: Number,
        default: 0,
    },
})

// ** Méthodes d'instance **
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id','name', 'firstname', 'email', 'orderKeys','solde', 'admin']);
}
UserSchema.methods.generateAuthToken = function () {
    // https://jwt.io/
    var user = this;
    var access = 'auth';
    var token =
        jwt.sign({ _id: user._id.toHexString(), access }, 'CantineAst0n').toString();

    // console.log(user.tokens);

    // problème avec . push
    user.tokens = user.tokens.concat([{ access, token }]);
    // console.log(user);


    // mise à jour du user
    return user.save().then(() => {
        return token;
    })
}

// ** Méthodes de modèle **
UserSchema.statics.findByCredentials = function (email, password) {
    var User = this; // contexte du modèle
    // console.log(email + password);

    return User.findOne({ email }).then(user => {
        if (!user) {
            //   console.log(user);

            return Promise.reject(''); // reject immédiat
        }
        // si utilisateur trouvé
        return new Promise((resolve, reject) => {
            //   console.log(user);

            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject('mot de pass invalide');
                }
            }); // !# bcrypt.compare
        }); // !# Promise
    }); // !# User.findOne
}

UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, 'CantineAst0n');
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

// mongoose middleware
UserSchema.pre('save', function (next) {
    var user = this; //context binding
    // console.log(user);

    // détecte l'insertion ou mise à jour d'un nouveau password
    if (user.isModified('password')) {
        // cryptage
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next()
    }
})

var User = mongoose.model('User', UserSchema);

module.exports = { User }