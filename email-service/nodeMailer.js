import nodemailer from "nodemailer"

class Email{

    constructor(subject, text, receiver){
        this.subject = subject;
        this.text = text;
        this.receiver = receiver;
    }

static sender = "UserEmail";
static transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: this.sender,
    pass: 'email password'
  }
});

send(){
    var mailOptions = {
    from: Email.sender,
    to: this.receiver,
    subject:  this.subject ,
    text: this.text
    };

    Email.transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
}
}

export default Email;