import * as nodeMailer from 'nodemailer'
import * as sendGrid from 'nodemailer-sendgrid-transport'
import { getEnvVar } from '../environments/env'

export class NodeMailer{
    private static initiateTransport(){
        return nodeMailer.createTransport(
            // sendGrid({
            //         auth:{api_key: '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'}
            //     })
            {
                service:'gmail',
                auth: {
                    user: getEnvVar().gmail_auth.user,
                    pass: getEnvVar().gmail_auth.pass
                }
            }
            )
    }

    static async sendEmail(data:{to:string, subject:string, html: string}):Promise<any>{
        return NodeMailer.initiateTransport().sendMail({
            from:'nurjamanshekh@gmail.com',
            to:data.to,
            subject:data.subject,
            html: data.html
        })
    }
}