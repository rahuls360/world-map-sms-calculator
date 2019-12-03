const apiKey = "yGI1fOsQQDpyetSgeG3myFWC2X84RT4S";
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const firstName = document.getElementById('first-name');
const lastName = document.getElementById('last-name');
const description = document.getElementById('description');

function prefillForm(){
    console.log('prefill');

    let body = {};
    if(email.value !== ""){
        body.emails = [email.value];
    }
    if(phone.value !== ""){
        body.phones = [phone.value];
    }
    console.log(body, "body")
    fetch('https://api.fullcontact.com/v3/person.enrich',{
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
            // 'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
        },
        body: JSON.stringify(body)
    }).then(resp => resp.json())
    .then(data => {
        if(data && data.details){
            firstName.value = data.details.name.given;
            lastName.value = data.details.name.family;
            phone.value = data.details.name.phones[0];
            console.log(data);
        }
    })
    .catch(err => {
        console.log(err);
    });
}

// Google Sheets - https://docs.google.com/spreadsheets/d/1Y4AUAFA44idQMSoDjxJ_JFF-P8fyZnVqxOnbymVRygE/edit?usp=sharing

function handleSubmit(){
    event.preventDefault();
    console.log("submit")

    let body = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        phone: phone.value,
        description: description.value,
    };
    console.log(body,"body")

    fetch('https://hooks.zapier.com/hooks/catch/6208679/o69xz11/', {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify(body)
    }).then(resp => resp.json())
    .then(data => {
        console.log(data);
        // clear form
        document.querySelector('form').reset();
    })
    .catch(err => {
        console.log(err);
    });
}
