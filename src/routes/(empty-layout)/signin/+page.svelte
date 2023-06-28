<script lang="ts">
    import loginSplash from '$lib/images/login-splash.png'
    import MainButton from '$lib/components/MainButton.svelte';
    import { applyAction, enhance } from '$app/forms';
	import Input from '$lib/components/Input.svelte';
    import CgMail from "svelte-icons-pack/cg/CgMail";
	import { getErrorMessages } from '$lib/utils/validation/validation';
	import { passwordSchema } from '$lib/utils/validation/schemas';


 
    export let form

    let loading = false
    let title = ''
    let subtitle = ''
    
   
    $: {
        if (form && form.challenge){
            if (form.challenge.challengeName = 'NEW_PASSWORD_REQUIRED'){
                title = 'Change your password'
                subtitle = 'You must change your password at first login'
            }
            else{
                title = 'Unknown challenge', 
                subtitle = 'Please contact with your administrator'
            }
        }
        else{
            title = 'Welcome back'
            subtitle = 'Please enter your credentials'
        }
        
    }

   

    function handleForm(){
        loading = true
        return async ({result}:any)=>{
            loading = false
            await applyAction(result)
        }
    }
   
</script>

<section class="h-screen w-screen bg-gd-page ">
    <div class="h-full w-full flex relative">
        <div class="absolute z-10 w-[33%] h-full gradient-to-transparent left-1/2 -translate-x-1/2"></div>
        <div class="h-full w-[50%] relative">
            <img alt="login-splash" class="w-full h-full object-cover" src={loginSplash}>
        </div>
        <div class="grow flex  flex-col items-center justify-center p-2 z-20">
            <div class="welcome mb-2">
                <h2 class="text-accent font-bold text-center text-2xl">
                    {title}
                </h2>
                <p class="text-center text-sm text-neutral-4"> {subtitle}</p>
            </div>
            <div class="bg-form-color w-full max-w-sm rounded-2xl shadow-main px-8 py-16 max-h-full bg-gd-glassmorphism backdrop-blur-md overflow-y-auto">
                {#if form?.challenge}
                    {#if form.challenge.challengeName == 'NEW_PASSWORD_REQUIRED'}
                        <form class="flex flex-col gap-8" method="post" action="?/new_password" use:enhance={handleForm}>       
                            <input type="hidden" value={form.challenge.session} name="session"/>
                            <input type="hidden" value={form.email} name="email"/>
                            <input type="hidden" value={form.redirectTo} name="redirectTo"/>
                            <Input 
                                type="password"
                                name="newPassword"
                                label="New Password"
                                placeholder="type your new password"
                                validationSchema={passwordSchema}
                                errorMessages={form?.error?.details?getErrorMessages(form.error, 'newPassword'):[]}
                            />
                            <Input 
                                type="password"
                                name="newPasswordConfirmation"
                                label="Password Confirmation"
                                placeholder="Re-type your new password"
                                errorMessages={form?.error?.details?getErrorMessages(form.error, 'newPasswordConfirmation'):[]}
                            />
                            {#if form?.error}
                                <div class="bg-alert-error text-neutral-1 px-4 py-2 rounded-lg">{form.error.message}</div>
                            {/if}
                            <MainButton loading={loading} disabled={loading}>Change Password</MainButton>
                        </form>
                    {:else}
                        <div class="error">
                            Challenge not managed
                        </div>
                    {/if}
                {:else}
                    <form class="flex-col flex gap-8" 
                    use:enhance={handleForm}
                    method="post" 
                    action="?/make">
                        <Input 
                            type="email" 
                            label="Email" 
                            name="email" 
                            value={form?.email??''} 
                            placeholder="Type your email"
                            errorMessages={form?.error?.details?getErrorMessages(form.error, 'email'):[]}
                            icon={CgMail}/>
                        <Input 
                            type="password" 
                            label="Password" 
                            placeholder="Type your password"
                            validationSchema={passwordSchema}
                            errorMessages={form?.error?.details?getErrorMessages(form.error, 'password'):[]}
                            name="password"/>

                        <div class="flex justify-between">
                            <label class="text-neutral-4 select-none text-sm">
                                <input type="checkbox" name="rememberme">
                                Remember me
                            </label>
                            <span class="text-sm">
                                <a href="/auth/resend-password">Recover your password</a>
                            </span>
                        </div>
                        {#if form?.error}
                            <div class="bg-alert-error text-neutral-1 px-4 py-2 rounded-lg">{form.error.message}</div>
                        {/if}
                        <MainButton disabled={loading} loading={loading}>Login</MainButton>
                    </form>
                {/if}
            </div>
        </div>
    </div>
    
</section>

<style lang="scss">
   .gradient-to-transparent{
        background: linear-gradient(90deg, rgba(217, 217, 217, 0) 0%, #E3E5EE 50%, rgba(223, 225, 231, 0.658704) 63.54%, rgba(217, 217, 217, 0.03) 100%);
   }
</style>