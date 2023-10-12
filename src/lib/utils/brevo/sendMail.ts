import brevo from '@getbrevo/brevo/src'

const defaultClient = brevo.ApiClient.instance
const apiKey = defaultClient.authentications['api-key']
apiKey.apiKey =
	'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'

const apiInstance = new brevo.TransactionalEmailsApi()
const sendSmtpEmail = new brevo.SendSmtpEmail()

export function sendEmail(emailData) {
	sendSmtpEmail.subject = emailData.subject
	sendSmtpEmail.htmlContent = emailData.content
	sendSmtpEmail.sender = {
		name: 'Mavie',
		email: 'test@test.com'
	}
	sendSmtpEmail.to = [{ email: emailData.email, name: emailData.name }]
	sendSmtpEmail.replyTo = { email: 'example@brevo.com', name: 'sample-name' }
	sendSmtpEmail.headers = { 'Some-Custom-Name': 'unique-id-1234' }
	sendSmtpEmail.params = {
		name: emailData.name,
		email: emailData.email,
		reason: emailData.reason
	}

	return apiInstance.sendTransacEmail(sendSmtpEmail)
}
