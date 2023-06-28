
import { CognitoFacade } from "$lib/server/facades/CognitoFacade";
import { json, type RequestEvent } from "@sveltejs/kit";

interface ConfirmBody {
    email: string
    code: string
}
export async function POST(handler:RequestEvent){
    try{
        const confirmBody:ConfirmBody = await handler.request.json()
        const cognito = CognitoFacade.getInstance()
        const result = await cognito.confirmUser(confirmBody.email, confirmBody.code)
        return json(result)
    }
    catch(error){
        return json(error)
    }
}

