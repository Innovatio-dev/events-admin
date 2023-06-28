
import { CognitoFacade } from "$lib/server/facades/CognitoFacade";
import { User } from "$lib/server/models/user";
import { json, type RequestEvent } from "@sveltejs/kit";
import { error } from '@sveltejs/kit';
interface SignupBody {
    email: string
    password: string
}
export async function POST(handler:RequestEvent ){
    try{
        const signupBody:SignupBody = await handler.request.json()
        const cognito = CognitoFacade.getInstance()
        const result = await cognito.signup(signupBody.email, signupBody.password)
        const uuid = result.UserSub
        const user = await User.create({
            cognitoId: uuid,
        })
        return json(user)
    }
    catch(err){
        throw error(409, {
            message: 'User already exists'
        })
    }
}
