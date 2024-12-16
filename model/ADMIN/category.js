const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types; // Import ObjectId

const categorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    Offer: {
        type: ObjectId, 
        ref: 'Offer',    
        required: false
    },
    isList: {
        type: Boolean,
        default: true,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('categories', categorySchema);
