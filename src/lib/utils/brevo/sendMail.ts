import { BREVO_API_KEY } from '$env/static/private'
import brevo from '@getbrevo/brevo/src'

const defaultClient = brevo.ApiClient.instance
const apiKey = defaultClient.authentications['api-key']
// apiKey.apiKey = `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`
apiKey.apiKey = BREVO_API_KEY

const apiInstance = new brevo.TransactionalEmailsApi()
const sendSmtpEmail = new brevo.SendSmtpEmail()

export function sendEmail(emailData) {
	sendSmtpEmail.subject = emailData.subject
	sendSmtpEmail.htmlContent = emailData.content
	sendSmtpEmail.templateId = emailData.templateId
	sendSmtpEmail.sender = {
		name: 'Mavie',
		email: 'no_reply@mavie.global'
	}
	sendSmtpEmail.to = [{ email: emailData.email, name: emailData.name }]
	sendSmtpEmail.headers = { 'Some-Custom-Name': 'unique-id-1234' }
	sendSmtpEmail.params = {
		name: emailData.name,
		email: emailData.email,
		reason: emailData.reason
	}

	return apiInstance.sendTransacEmail(sendSmtpEmail)
}
