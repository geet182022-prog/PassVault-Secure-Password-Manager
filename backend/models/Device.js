import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
    },
    fingerprint: {
        type: String,
        required: true
    },
    userAgent: String,
    firstSeen: {
        type: Date,
        default: Date.now
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model("Device", deviceSchema);