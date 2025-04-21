import {InferSchemaType, model, Schema} from 'mongoose';

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {timestamps: true}
);

type userSchemaInferType = InferSchemaType<typeof userSchema>;
export default model<userSchemaInferType>('User', userSchema);
