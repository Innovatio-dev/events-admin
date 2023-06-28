
import { CognitoFacade } from "$lib/server/facades/CognitoFacade";
import { checkUser } from "$lib/server/middlewares/permission";
import { User } from "$lib/server/models/user";
import { error, json, type RequestEvent} from "@sveltejs/kit";


export async function DELETE(event:RequestEvent ){
    // checkUser(event, 1)
    try{
        const {email} = await event.request.json()
        const cognito = CognitoFacade.getInstance()
        const cognitoUser = await cognito.getUser(email)
        const result = await cognito.deleteUser(email)
        const id = cognitoUser.UserAttributes.find((attr:{Name:string, Value:string})=>{
            return attr.Name === 'sub'
        })?.Value

        await User.destroy({
            where: {cognitoId: id}
        })

        return json(cognitoUser)
    }
    catch(err){
        throw error(403, {
            message: 'User not found'
        })
    }
}
