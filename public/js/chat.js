const socket = io("http://localhost:3000");
let idChatRoom;

function onLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get("name");
  const avatar = urlParams.get("avatar");
  const email = urlParams.get("email");

  document.querySelector(".user_logged").innerHTML += `
    <img
      class="avatar_user_logged"
      src=${avatar}
    />
    <strong id="user_logged">${name}</strong> -->
  `;

  socket.emit("startApp", {
    name,
    email,
    avatar,
  });

  socket.on("new_user", (user) => {
    const existInDiv = document.getElementById(`user_${user._id}`);
    if (!existInDiv) {
      addUser(user);
    }
  });

  socket.emit("get_users", (users) => {
    users.map((user) => {
      if (user.email !== email) {
        addUser(user);
      }
    });
  });

  socket.on("messageSent", (data) => {
    if (data.message.chatRoomId === idChatRoom) {
      addMessage(data);
    }
  });

  socket.on("notification", (data) => {
    if (data.chatRoomId !== idChatRoom) {
      const user = document.getElementById(`user_${data.from._id}`);

      user.insertAdjacentHTML(
        "afterbegin",
        ` 
        <div class="notification"></div>
      `
      );
    }
  });
}

function addMessage(data) {
  const divMessageUser = document.getElementById("message_user");
  divMessageUser.innerHTML += `
    <span class="user_name user_name_date">
    <img
      class="img_user"
      src=${data.user.avatar}
    />
    <strong>${data.user.name}</strong>
    <span>&nbsp${dayjs(data.message.created_at).format(
      "DD/MM/YYYY HH:mm"
    )}</span></span>
    <div class="messages">
      <span class="chat_message">${data.message.text}</span>
    </div>
`;
}

function addUser(user) {
  const usersLists = document.getElementById("users_list");
  usersLists.innerHTML += `
    <li
      class="user_name_list"
      id="user_${user._id}"
      idUser="${user._id}"
    >
      <img
        class="nav_avatar"
        src=${user.avatar}
      />
      ${user.name}
    </li>
  `;
}

document.getElementById("users_list").addEventListener("click", (event) => {
  const inputMessage = document.getElementById("user_message");
  inputMessage.classList.remove("hidden");

  document
    .querySelectorAll("li.user_name_list")
    .forEach((item) => item.classList.remove("user_in_focus"));

  document.getElementById("message_user").innerHTML = "";
  if (event.target && event.target.matches("li.user_name_list")) {
    const idUser = event.target.getAttribute("idUser");

    event.target.classList.add("user_in_focus");

    const notification = document.querySelector(
      `#user_${idUser} .notification`
    );
    if (notification) {
      notification.remove();
    }

    socket.emit("startChat", { idUser }, ({ messages, room }) => {
      idChatRoom = room.idChatRoom;

      messages.forEach((message) => {
        const data = {
          message,
          user: message.from,
        };
        addMessage(data);
      });
    });
  }
});

document
  .getElementById("user_message")
  .addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const text = event.target.value;

      socket.emit("sendMessage", { text, idChatRoom });

      event.target.value = "";
    }
  });

onLoad();
