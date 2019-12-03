const tags = document.getElementById('tags');

let globalCountry;

function setTags(countryList){
    globalCountry = countryList;
    let ul = document.createElement('ul'); 
    countryList.forEach(country => {
        let li = document.createElement('li');
        ul.appendChild(li);
        li.innerHTML = country + `<img src="images/close.svg" alt="close"/>`;
    })
    tags.innerHTML = ul.innerHTML;
}

const estimate = document.getElementById('estimate'); 
const sendCheckbox = document.querySelector('input#send');
const receiveCheckbox = document.querySelector('input#receive');
const sendDiv = document.querySelector('.send');
const receiveDiv = document.querySelector('.receive');

// disable on initial load
estimate.style.display = "none";
sendDiv.style.display = "none";
receiveDiv.style.display = "none";


function getEstimate(){
    if(estimate.style.display === "none"){
        estimate.style.display = "block";
    }
    // handle send/receive based on checkbox
    if(sendCheckbox.checked || receiveCheckbox.checked){
        sendDiv.style.display = sendCheckbox.checked ? "block" : "none";
        receiveDiv.style.display = receiveCheckbox.checked ? "block" : "none";
        calculateEstimates();
    }else {
        console.log('show error')
    }
}

// Convert CSV to JSON
let outboundPricingData;
Papa.parse('./plivo.csv', {
    download: true,
	complete: function(results) {
        console.log("outboundPricingData:", results.data);
        outboundPricingData = results.data;
	}
});

let inboundPricingData;
Papa.parse('./inbound.csv', {
    download: true,
	complete: function(results) {
        console.log("inboundPricingData:", results.data);
        inboundPricingData = results.data;
	}
});

const rangeInput = document.getElementById('rangeInput');
const sendPrice = document.querySelector('.send p');
const receivePrice = document.querySelector('.receive p');

function calculateEstimates(){
    console.log(globalCountry, outboundPricingData);
    let total = 0;
    if(globalCountry){
        let volumePerCountry = rangeInput.value / globalCountry.length;
        let volumeSendPerCountry;
        let volumeReceivePerCountry;
        if(sendCheckbox.checked && receiveCheckbox.checked){
            volumeSendPerCountry = volumePerCountry * 0.7;
            volumeReceivePerCountry = volumePerCountry * 0.3;
        }else {
            volumeSendPerCountry = volumePerCountry;
            volumeReceivePerCountry = volumePerCountry;
        }
        console.log(volumeSendPerCountry, volumeReceivePerCountry);

        let sendTotal = 0;
        if(sendCheckbox.checked){
            // calculate send price
            globalCountry.forEach(country => {
                let flag = 0;
                for(let i=0; i< outboundPricingData.length; i++){
                    if(country === outboundPricingData[i][0]){
                        flag = 1;
                        console.log(outboundPricingData[i][6])
                        sendTotal += outboundPricingData[i][6] * volumeSendPerCountry;
                        break;
                    }
                }
                if(flag === 0){
                    console.log('country not found- send');
                }
            });
        }

        let receiveTotal = 0;
       if(receiveCheckbox.checked){
        // calculate receive price
        globalCountry.forEach(country => {
            let flag = 0;
            for(let i=0; i< inboundPricingData.length; i++){
                if(country === inboundPricingData[i][0] && inboundPricingData[i][9] !== "NA"){
                    flag =1;
                    console.log(inboundPricingData[i][9])
                    receiveTotal += inboundPricingData[i][9] * volumeReceivePerCountry;
                    break;
                }
            }
            if(flag === 0){
                console.log('country not found- receive');
            }
        });
       }
        // console.log("total", total);
        // console.log("avg", total / rangeInput.value);
        sendPrice.innerText = sendTotal / rangeInput.value;
        receivePrice.innerText = receiveTotal / rangeInput.value;
    }
}


// const sliderInput = document.querySelector('.slider input');
// const pricingButton = document.querySelector('#pricing-button a');

// sliderInput.addEventListener('change' , handleSlider);

// function handleSlider(){
//     console.log('changed', sliderInput.value);
//     if(sliderInput.value == 2000){
//         console.log('yes 2000');
//         pricingButton.innerText = "Contact Sales";
//     }
// }

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
    })
    .catch(err => {
        console.log(err);
    });
}

var slider = document.querySelector('.slider');
var output = document.getElementById("demo");
  
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
  console.log('slider')
  slider.style.cssText = `--val: ${this.value}`;
}

function handleSlider(){
  // onmouseleave
  if(slider.value > 2000){
    slider.value = 2000;
    output.innerHTML = 2000;
    slider.style.cssText = `--val: 2000`;
  }
}