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

// const rangeInput = document.getElementById('rangeInput');
var slider = document.querySelector('.slider');
const sendPrice = document.querySelector('.send p');
const receivePrice = document.querySelector('.receive p');

function calculateEstimates(){
    console.log(globalCountry, outboundPricingData);
    let total = 0;
    if(globalCountry){
        let volumePerCountry = slider.value / globalCountry.length;
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
        sendPrice.innerText = `$ ${sendTotal}`;
        receivePrice.innerText = `$ ${receiveTotal}`;
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


const pricingButton = document.querySelector('#pricing-button a');


  

slider.oninput = function() {
  calculateEstimates();
  slider.style.cssText = `--val: ${this.value}`;
}

function handleSlider(){
  // onmouseleave
  if(slider.value > 2000){
    slider.value = 2000;
    slider.style.cssText = `--val: 2000`;
    calculateEstimates();
    pricingButton.innerText = "Contact Sales";
    pricingButton.setAttribute('href', 'sales.html');
}else {
    pricingButton.innerText = "View Pricing";
    pricingButton.setAttribute('href', 'https://www.plivo.com/sms/pricing/us/');
  }
}