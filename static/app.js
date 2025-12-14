class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        }

        this.state = false;
        this.messages = [];
        this.userLocation = null;
        
        // Kullanıcının konumunu al
        this.getUserLocation();
    }
    
    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    console.log("Konum alındı:", this.userLocation);
                },
                (error) => {
                    console.log("Konum alınamadı:", error);
                    // Varsayılan Istanbul koordinatları
                    this.userLocation = {
                        latitude: 41.0082,
                        longitude: 28.9784
                    };
                }
            );
        } else {
            // Tarayıcı geolocation desteklemiyor, varsayılan Istanbul
            this.userLocation = {
                latitude: 41.0082,
                longitude: 28.9784
            };
        }
    }

    display() {
        const {openButton, chatBox, sendButton} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
        if(this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        // Mesajla birlikte konumu da gönder
        let requestBody = { 
            message: text1
        };
        
        // Eğer konum varsa ekle
        if (this.userLocation) {
            requestBody.location = this.userLocation;
        }

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            mode: 'cors',
            headers: {
               'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let msg2 = {name: "Sam", message1: r.answer[0], message2: r.answer[1], message3: r.answer[2], message4: r.answer[3], message5: r.answer[4]}
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''

        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
        });
    }

    // Google Maps URL oluştur
    createGoogleMapsUrl(hospitalName, address) {
        // Hastane adı ve adresini birleştir
        const query = encodeURIComponent(hospitalName + ", " + address);
        return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }

    updateChatText(chatbox) {
        var html = '';
        const specificTags = ["greeting", "goodbye","work","who","Thanks","joke", "name", "age", "gender", "not_understand"]
        
        // Self referansını sakla (arrow function içinde kullanmak için)
        const self = this;
        
        this.messages.slice().reverse().forEach(function(item, index) {
            
            if (item.name === "Sam")
            {
                if (specificTags.includes(item.message1)){
                    html += '<div class="messages__item messages__item--visitor">' + item.message2 + '</div>'
                }
                else if (item.message1 === "center"){ 
                    html += '<div class="messages__item messages__item--visitor">You can ask me if you want any thing else.</div>'
                    
                    // 5 hastaneyi göster (message2, message3, message4, message5 + potansiyel message6)
                    const hospitals = [item.message5, item.message4, item.message3, item.message2];
                    
                    hospitals.forEach(function(hospital) {
                        if (hospital && hospital.length >= 3) {
                            const hospitalName = hospital[0];
                            const distance = hospital[1];
                            const address = hospital[2];
                            const mapsUrl = self.createGoogleMapsUrl(hospitalName, address);
                            
                            html += '<div class="hospital-card" style="margin-bottom: 10px;">'
                                + '<div class="myDIV hospital-clickable" style="font-size: 17px; cursor: pointer; transition: background-color 0.3s;" '
                                + 'onclick="window.open(\'' + mapsUrl + '\', \'_blank\')" '
                                + 'onmouseover="this.style.backgroundColor=\'#e3f2fd\'" '
                                + 'onmouseout="this.style.backgroundColor=\'white\'">'
                                + '<strong>🏥 ' + hospitalName + '</strong><br>'
                                + '<small>📍 ' + distance + '</small>'
                                + '<span style="float: right; color: #1976d2;">📌 Haritada Aç</span>'
                                + '</div>'
                                + '<div class="hide" style="padding: 10px; background-color: #f5f5f5;">'
                                + '<strong>Adres:</strong><br>' + address
                                + '</div>'
                                + '</div>';
                        }
                    });
                    
                    html += '<div class="con" style="margin-top:20px; margin-bottom:10px"><h3>Medical locations that are near to you.</h3></div>'
                }
                else{
                    html += '<div class="messages__item messages__item--visitor">Do you want to know about the nearby medical center locations</div>'
                            + '<div class="accordion" id="accordionExample">'
                                + '<div class="accordion-item" style="width: 40%; margin-top: 10px" >'
                                + '<h2 class="accordion-header" id="headingOne">'
                                + '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">'
                                + '<b>Precautions</b>'
                                + '</button>'
                                + '</h2>'
                                + '<div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">'
                                + '<div class="accordion-body">'
                                + item.message3
                                + '</div>'
                                + '</div>'
                                + '</div>'
                                + '</div>'
                            + '<div class="accordion" id="accordionExample">'
                                    + '<div class="accordion-item" style="width: 40%; margin-top: 10px" >'
                                    + '<h2 class="accordion-header" id="headingThree">'
                                    + '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">'
                                    + '<b>Description</b>'
                                    + '</button>'
                                    + '</h2>'
                                    + '<div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">'
                                    + '<div class="accordion-body">'
                                    + item.message2
                                    + '</div>'
                                    + '</div>'
                                    + '</div>'
                                    + '</div>'
                            + '<div class="messages__item messages__item--visitor">Here is some more info on the disease</div>'
                            + '<div class="myDIV">' + item.message1 + '</div>'
                            + '<div class="con" style="margin-top:20px; margin-bottom:10px"><h3>This may be the possible disease that you may have.</h3></div>'   
                }
            }
            else
            {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
          });
          html += '<div class="messages__item messages__item--visitor">Hi, this is a medical chat support.</div><div class="messages__item messages__item--visitor">May I know your name.</div>'

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
    
}


const chatbox = new Chatbox();
chatbox.display();