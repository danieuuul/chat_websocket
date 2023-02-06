import { container } from "tsyringe";
import { io } from "../http";
import { CreateChatRoomService } from "../services/CreateChatRoomService";
import { CreateMessageService } from "../services/CreateMessageService";
import { CreateUserService } from "../services/CreateUserService";
import { GetAllUsersService } from "../services/GetAllUsersService";
import { GetChatRoomById } from "../services/GetChatRoomById";
import { GetChatRoomByUsersService } from "../services/GetChatRoomByUsersService";
import { GetMessagesByChatoRoomService } from "../services/GetMessagesByChatRoomService";
import { GetUserBySocketIdService } from "../services/GetUserBySocketIdService";

io.on("connect", (socket) => {
  // socket.emit() -> RESTRITA (cliente específico e servidor)
  // io.emit() -> GLOBAL (do servidor para os clientes de um join)

  socket.on("startApp", async (data) => {
    const { name, email, avatar } = data;

    const createUserService = container.resolve(CreateUserService);

    const user = await createUserService.execute({
      email,
      avatar,
      name,
      socket_id: socket.id,
    });

    socket.broadcast.emit("new_user", user);
  });

  socket.on("get_users", async (callback) => {
    const getAllUsersService = container.resolve(GetAllUsersService);
    const users = await getAllUsersService.execute();

    callback(users);
  });

  socket.on("startChat", async (data, callback) => {
    const createChatRoomService = container.resolve(CreateChatRoomService);
    const getUserBySocketIdService = container.resolve(
      GetUserBySocketIdService
    );
    const getChatRoomByUsersService = container.resolve(
      GetChatRoomByUsersService
    );
    const getMessagesByChatRoomService = container.resolve(
      GetMessagesByChatoRoomService
    );

    const userLogged = await getUserBySocketIdService.execute(socket.id);

    let room = await getChatRoomByUsersService.execute([
      data.idUser,
      userLogged._id,
    ]);

    if (!room) {
      room = await createChatRoomService.execute([data.idUser, userLogged._id]);
    }

    socket.join(room.idChatRoom);

    const messages = await getMessagesByChatRoomService.execute(
      room.idChatRoom
    );

    callback({ room, messages });
  });

  socket.on("sendMessage", async (data) => {
    const { text, idChatRoom } = data;

    const getUserBySocketIdService = container.resolve(
      GetUserBySocketIdService
    );
    const createMessageService = container.resolve(CreateMessageService);
    const getChatRoomById = container.resolve(GetChatRoomById);

    const user = await getUserBySocketIdService.execute(socket.id);

    const message = await createMessageService.execute({
      from: user._id,
      text,
      chatRoomId: idChatRoom,
    });

    io.to(idChatRoom).emit("messageSent", {
      message,
      user,
    });

    const room = await getChatRoomById.execute(idChatRoom);
    const userTo = room.idUsers.find(
      (findUser) => String(findUser._id) !== String(user._id)
    );

    io.to(userTo.socket_id).emit("notification", {
      newMessage: true,
      chatRoomId: idChatRoom,
      from: user,
    });
  });
});
