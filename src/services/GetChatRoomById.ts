import { injectable } from "tsyringe";
import { ChatRoom } from "../schemas/ChatRoom";

@injectable()
class GetChatRoomById {
  async execute(idChatRoom: String) {
    const chatRoom = await ChatRoom.findOne({
      idChatRoom,
    }).populate("idUsers");

    return chatRoom;
  }
}

export { GetChatRoomById };
