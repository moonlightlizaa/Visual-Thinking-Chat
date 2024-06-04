const socket = io();

const clientsTotal = document.getElementById("client-total");

const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");


const messageTone = new Audio("/message-tone.mp3");

// Event listener voor submit event -> verstuurd het bericht

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

// Laat zien hoeveel mensen er online zijn:

socket.on("clients-total", (data) => {
  clientsTotal.innerText = `Online: ${data}`;
});

function sendMessage() {
  if (messageInput.value === "") return;
  // console.log(messageInput.value)
  const data = {
    name: nameInput.value, // naam van gebruiker uit formulier
    message: messageInput.value, // bericht uit formulier
    dateTime: new Date(), // datum van het bericht
  };
  socket.emit("message", data);
  addMessageToUI(true, data); 
  messageInput.value = ""; // Leegt text velt nadat het bericht verstuurt is
}

// geluid dat afspeelt wanneer je het bericht verstuurd

socket.on("chat-message", (data) => {
  // console.log(data)
  messageTone.play(); 
  addMessageToUI(false, data);
});

// zorgt ervoor dat eigen berichten aan de rechterkant staan en berichten van iemand anders aan
// de linkerkant + automatisch naar beneden scrollen. 

function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  const element = `
      <li class="${isOwnMessage ? "message-right" : "message-left"}">
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
        </li>
        `;

  messageContainer.innerHTML += element;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// feedforward & feedback

messageInput.addEventListener("focus", (e) => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("keypress", (e) => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});
messageInput.addEventListener("blur", (e) => {
  socket.emit("feedback", {
    feedback: "",
  });
});

socket.on("feedback", (data) => {
  clearFeedback();
  const element = `
        <li class="message-feedback">
          <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
  `;
  messageContainer.innerHTML += element;
});

function clearFeedback() {
  document.querySelectorAll("li.message-feedback").forEach((element) => {
    element.parentNode.removeChild(element);
  });
}
